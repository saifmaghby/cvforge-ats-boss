import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import PortfolioFormPanel from "@/components/portfolio/PortfolioFormPanel";
import PortfolioPreviewPanel from "@/components/portfolio/PortfolioPreviewPanel";
import { PortfolioData, PortfolioTemplate, samplePortfolioData, emptyPortfolioData } from "@/types/portfolio";
import { toast } from "sonner";
import { Save, Eye, Presentation, Globe } from "lucide-react";

const portfolioTemplates: { id: PortfolioTemplate; name: string }[] = [
  { id: "developer", name: "Developer" },
  { id: "designer", name: "Designer" },
  { id: "minimal", name: "Minimal" },
];

const PortfolioBuilder = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get("id");

  const [data, setData] = useState<PortfolioData>(samplePortfolioData);
  const [template, setTemplate] = useState<PortfolioTemplate>("developer");
  const [name, setName] = useState("My Portfolio");
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load existing portfolio
  useQuery({
    queryKey: ["portfolio", portfolioId],
    queryFn: async () => {
      if (!portfolioId) return null;
      const { data: row, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", portfolioId)
        .single();
      if (error) throw error;
      if (row) {
        const loaded = row.portfolio_data as unknown as Partial<PortfolioData>;
        setData({
          hero: { ...emptyPortfolioData.hero, ...loaded?.hero },
          about: loaded?.about || "",
          projects: loaded?.projects || [],
          skills: loaded?.skills || [],
          contact: { ...emptyPortfolioData.contact, ...loaded?.contact },
        });
        setTemplate((row.template || "developer") as PortfolioTemplate);
        setName(row.name);
        setIsPublished(row.is_published);
      }
      return row;
    },
    enabled: !!portfolioId && !!user,
  });

  const generateSlug = (n: string) =>
    n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "portfolio";

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const slug = generateSlug(name) + "-" + Date.now().toString(36);
      if (portfolioId) {
        const { error } = await supabase
          .from("portfolios")
          .update({ portfolio_data: JSON.parse(JSON.stringify(data)), template, name })
          .eq("id", portfolioId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("portfolios")
          .insert([{ user_id: user.id, portfolio_data: JSON.parse(JSON.stringify(data)), template, name, slug }]);
        if (error) throw error;
      }
      toast.success("Portfolio saved");
    } catch {
      toast.error("Failed to save portfolio");
    } finally {
      setSaving(false);
    }
  }, [user, portfolioId, data, template, name]);

  const togglePublish = async () => {
    if (!portfolioId) {
      toast.error("Save your portfolio first");
      return;
    }
    const newState = !isPublished;
    const { error } = await supabase
      .from("portfolios")
      .update({ is_published: newState })
      .eq("id", portfolioId);
    if (error) {
      toast.error("Failed to update");
      return;
    }
    setIsPublished(newState);
    toast.success(newState ? "Portfolio published!" : "Portfolio unpublished");
  };

  // Presentation mode slides
  const slides = buildSlides(data);

  if (presenting) {
    return (
      <PresentationMode
        slides={slides}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
        onExit={() => setPresenting(false)}
        data={data}
      />
    );
  }

  return (
    <DashboardLayout>
      {/* Toolbar */}
      <div className="border-b border-border px-4 h-12 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Portfolio
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-mono outline-none px-1 py-0.5 max-w-[200px] text-foreground"
            placeholder="Portfolio Name"
          />
        </div>
        <div className="flex items-center gap-2">
          <ForgeButton variant="ghost" onClick={() => setData(emptyPortfolioData)}>
            Clear
          </ForgeButton>
          <ForgeButton variant="ghost" onClick={() => setData(samplePortfolioData)}>
            Sample
          </ForgeButton>
          <ForgeButton variant="ghost" onClick={() => { setCurrentSlide(0); setPresenting(true); }}>
            <Presentation className="h-4 w-4 mr-1" />
            Present
          </ForgeButton>
          {portfolioId && (
            <ForgeButton variant="ghost" onClick={togglePublish}>
              <Globe className="h-4 w-4 mr-1" />
              {isPublished ? "Unpublish" : "Publish"}
            </ForgeButton>
          )}
          <ForgeButton variant="ghost" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving…" : "Save"}
          </ForgeButton>
        </div>
      </div>

      {/* Template selector */}
      <div className="border-b border-border px-4 h-10 flex items-center gap-1 bg-background overflow-x-auto">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-3 whitespace-nowrap">
          Template
        </span>
        {portfolioTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors whitespace-nowrap ${
              template === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Split layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ height: "calc(100vh - 9rem)" }}>
        <PortfolioFormPanel data={data} onChange={setData} />
        <div className="hidden lg:block">
          <PortfolioPreviewPanel data={data} template={template} />
        </div>
      </div>
    </DashboardLayout>
  );
};

// Build presentation slides from portfolio data
function buildSlides(data: PortfolioData) {
  const slides: { type: string; content: any }[] = [];
  slides.push({ type: "hero", content: data.hero });
  if (data.about) slides.push({ type: "about", content: data.about });
  if (data.projects.length > 0) {
    // one slide per project
    data.projects.forEach((p) => slides.push({ type: "project", content: p }));
  }
  if (data.skills.length > 0) slides.push({ type: "skills", content: data.skills });
  if (data.contact.email || data.contact.linkedin || data.contact.github) {
    slides.push({ type: "contact", content: data.contact });
  }
  return slides;
}

// Full-screen presentation mode
function PresentationMode({
  slides,
  currentSlide,
  onSlideChange,
  onExit,
  data,
}: {
  slides: { type: string; content: any }[];
  currentSlide: number;
  onSlideChange: (i: number) => void;
  onExit: () => void;
  data: PortfolioData;
}) {
  const slide = slides[currentSlide];
  const next = () => onSlideChange(Math.min(currentSlide + 1, slides.length - 1));
  const prev = () => onSlideChange(Math.max(currentSlide - 1, 0));

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " ") next();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "Escape") onExit();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0a0a0a] flex items-center justify-center"
      tabIndex={0}
      onKeyDown={handleKey}
      autoFocus
      ref={(el) => el?.focus()}
    >
      {/* Slide content */}
      <div className="w-full max-w-4xl px-8">
        {slide.type === "hero" && (
          <div className="text-center">
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-white mb-4 tracking-tighter">
              {slide.content.name || "Your Name"}
            </h1>
            <p className="text-xl lg:text-2xl text-primary font-mono mb-4">
              {slide.content.title}
            </p>
            {slide.content.tagline && (
              <p className="text-lg text-white/50 font-mono max-w-lg mx-auto">
                {slide.content.tagline}
              </p>
            )}
          </div>
        )}

        {slide.type === "about" && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-6">About</p>
            <p className="text-xl lg:text-2xl text-white/80 font-mono leading-relaxed">
              {slide.content}
            </p>
          </div>
        )}

        {slide.type === "project" && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-6">Project</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              {slide.content.title}
            </h2>
            <p className="text-lg text-white/60 font-mono leading-relaxed mb-6 max-w-2xl">
              {slide.content.description}
            </p>
            {slide.content.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {slide.content.tags.map((tag: string) => (
                  <span key={tag} className="text-xs font-mono px-3 py-1 border border-white/20 text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {slide.type === "skills" && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-8">Skills & Expertise</p>
            <div className="flex flex-wrap gap-3">
              {(slide.content as string[]).map((skill) => (
                <span key={skill} className="text-lg font-mono px-5 py-2 border border-primary/30 text-primary bg-primary/5">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {slide.type === "contact" && (
          <div className="text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-8">Let's Connect</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-8 tracking-tight">
              {data.hero.name}
            </h2>
            <div className="flex flex-col items-center gap-4">
              {slide.content.email && (
                <p className="text-lg font-mono text-white/70">{slide.content.email}</p>
              )}
              <div className="flex gap-6 text-white/50 font-mono text-sm">
                {slide.content.linkedin && <span>{slide.content.linkedin}</span>}
                {slide.content.github && <span>{slide.content.github}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button onClick={prev} disabled={currentSlide === 0} className="text-white/30 hover:text-white disabled:opacity-20 font-mono text-sm transition-colors">
          ← Prev
        </button>
        <span className="text-[10px] font-mono text-white/30 tracking-widest">
          {currentSlide + 1} / {slides.length}
        </span>
        <button onClick={next} disabled={currentSlide === slides.length - 1} className="text-white/30 hover:text-white disabled:opacity-20 font-mono text-sm transition-colors">
          Next →
        </button>
      </div>

      {/* Exit */}
      <button
        onClick={onExit}
        className="fixed top-6 right-6 text-white/30 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors"
      >
        ESC to exit
      </button>
    </div>
  );
}

export default PortfolioBuilder;
