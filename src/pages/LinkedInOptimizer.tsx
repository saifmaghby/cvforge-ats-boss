import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import { normalizeCVData, CVData } from "@/types/cv";
import { Loader2, Linkedin, Copy, CheckCircle, Lightbulb, Star, Briefcase, Tag } from "lucide-react";
import { toast } from "sonner";

interface LinkedInResult {
  headline: string;
  headlineAlternatives: string[];
  about: string;
  experienceEntries: { company: string; role: string; bullets: string[] }[];
  topSkills: string[];
  keywordsToAdd: string[];
  tips: string[];
}

const LinkedInOptimizer = () => {
  const { user } = useAuth();
  const [savedCVs, setSavedCVs] = useState<{ id: string; name: string; cv_data: any }[]>([]);
  const [selectedCV, setSelectedCV] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [currentHeadline, setCurrentHeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_cvs").select("id, name, cv_data").order("updated_at", { ascending: false })
      .then(({ data }) => { if (data) setSavedCVs(data); });
  }, [user]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOptimize = async () => {
    if (!selectedCV) { toast.error("Please select a CV"); return; }
    setLoading(true);
    setResult(null);
    try {
      const cv = savedCVs.find((c) => c.id === selectedCV);
      const cvData = normalizeCVData(cv?.cv_data);
      const { data, error } = await supabase.functions.invoke("linkedin-optimizer", {
        body: { cvData, targetRole, currentHeadline },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to optimize");
    } finally {
      setLoading(false);
    }
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button onClick={() => copyToClipboard(text, field)} className="text-muted-foreground hover:text-foreground transition-colors">
      {copiedField === field ? <CheckCircle className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
            LinkedIn <span className="text-primary">Optimizer</span>
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            Transform your CV into an optimized LinkedIn profile that attracts recruiters
          </p>
        </div>

        {/* Setup */}
        <div className="border border-border p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Select CV</label>
            <select
              value={selectedCV}
              onChange={(e) => setSelectedCV(e.target.value)}
              className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
            >
              <option value="">Choose a saved CV…</option>
              {savedCVs.map((cv) => (
                <option key={cv.id} value={cv.id}>{cv.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Target Role (Optional)</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Current LinkedIn Headline (Optional)</label>
            <input
              value={currentHeadline}
              onChange={(e) => setCurrentHeadline(e.target.value)}
              placeholder="Your current LinkedIn headline"
              className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
            />
          </div>

          <ForgeButton variant="primary" onClick={handleOptimize} disabled={loading || !selectedCV}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Optimizing…</> : <><Linkedin className="h-4 w-4 mr-2" /> Optimize for LinkedIn</>}
          </ForgeButton>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5">
            {/* Headline */}
            <div className="border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Star className="h-3.5 w-3.5" /> Headline</h3>
                <CopyBtn text={result.headline} field="headline" />
              </div>
              <p className="font-mono text-sm text-foreground font-medium">{result.headline}</p>
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Alternatives</span>
                {result.headlineAlternatives.map((h, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <p className="text-xs font-mono text-muted-foreground">{h}</p>
                    <CopyBtn text={h} field={`headline-${i}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> About Section</h3>
                <CopyBtn text={result.about} field="about" />
              </div>
              <p className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">{result.about}</p>
            </div>

            {/* Experience */}
            <div className="border border-border p-4 space-y-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> Experience</h3>
              {result.experienceEntries.map((exp, i) => (
                <div key={i} className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-medium text-foreground">{exp.role} @ {exp.company}</p>
                    <CopyBtn text={exp.bullets.join("\n")} field={`exp-${i}`} />
                  </div>
                  <ul className="space-y-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-xs font-mono text-muted-foreground">• {b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Skills & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border p-4 space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> Top Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.topSkills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono border border-border px-2 py-0.5 text-foreground">{s}</span>
                  ))}
                </div>
              </div>
              <div className="border border-border p-4 space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-destructive flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> Missing Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordsToAdd.map((k, i) => (
                    <span key={i} className="text-[10px] font-mono border border-destructive/30 text-destructive px-2 py-0.5">{k}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="border border-border p-4 space-y-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Lightbulb className="h-3.5 w-3.5" /> Pro Tips</h3>
              <ul className="space-y-1.5">
                {result.tips.map((t, i) => (
                  <li key={i} className="text-xs font-mono text-muted-foreground">→ {t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LinkedInOptimizer;
