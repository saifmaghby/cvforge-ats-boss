import { useState } from "react";
import { PortfolioData, PortfolioProject } from "@/types/portfolio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ForgeButton from "@/components/ForgeButton";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  data: PortfolioData;
  onChange: (data: PortfolioData) => void;
}

const PortfolioFormPanel = ({ data, onChange }: Props) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    about: false,
    projects: false,
    skills: false,
    contact: false,
  });

  const toggle = (key: string) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const updateHero = (field: keyof PortfolioData["hero"], value: string) =>
    onChange({ ...data, hero: { ...data.hero, [field]: value } });

  const updateContact = (field: keyof PortfolioData["contact"], value: string) =>
    onChange({ ...data, contact: { ...data.contact, [field]: value } });

  const addProject = () => {
    const newProject: PortfolioProject = {
      id: Date.now().toString(),
      title: "",
      description: "",
      imageUrl: "",
      tags: [],
      liveUrl: "",
      repoUrl: "",
    };
    onChange({ ...data, projects: [...data.projects, newProject] });
  };

  const updateProject = (id: string, field: keyof PortfolioProject, value: any) => {
    onChange({
      ...data,
      projects: data.projects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const removeProject = (id: string) =>
    onChange({ ...data, projects: data.projects.filter((p) => p.id !== id) });

  const Section = ({
    id,
    label,
    children,
  }: {
    id: string;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-border">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
          {label}
        </span>
        {openSections[id] ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {openSections[id] && <div className="px-4 pb-5 space-y-3">{children}</div>}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto border-r border-border bg-background">
      <Section id="hero" label="Hero / Intro">
        <Input
          placeholder="Full Name"
          value={data.hero.name}
          onChange={(e) => updateHero("name", e.target.value)}
          className="font-mono text-sm"
        />
        <Input
          placeholder="Title (e.g. Full-Stack Developer)"
          value={data.hero.title}
          onChange={(e) => updateHero("title", e.target.value)}
          className="font-mono text-sm"
        />
        <Textarea
          placeholder="Short tagline or elevator pitch"
          value={data.hero.tagline}
          onChange={(e) => updateHero("tagline", e.target.value)}
          className="font-mono text-sm resize-none"
          rows={2}
        />
        <Input
          placeholder="Avatar URL (optional)"
          value={data.hero.avatarUrl}
          onChange={(e) => updateHero("avatarUrl", e.target.value)}
          className="font-mono text-sm"
        />
      </Section>

      <Section id="about" label="About Me">
        <Textarea
          placeholder="Write about yourself, your experience, and what you're looking for..."
          value={data.about}
          onChange={(e) => onChange({ ...data, about: e.target.value })}
          className="font-mono text-sm resize-none"
          rows={5}
        />
      </Section>

      <Section id="projects" label={`Projects (${data.projects.length})`}>
        {data.projects.map((project, idx) => (
          <div key={project.id} className="border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Project {idx + 1}
              </span>
              <button
                onClick={() => removeProject(project.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input
              placeholder="Project Title"
              value={project.title}
              onChange={(e) => updateProject(project.id, "title", e.target.value)}
              className="font-mono text-sm"
            />
            <Textarea
              placeholder="Project description"
              value={project.description}
              onChange={(e) => updateProject(project.id, "description", e.target.value)}
              className="font-mono text-sm resize-none"
              rows={2}
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={project.tags.join(", ")}
              onChange={(e) =>
                updateProject(
                  project.id,
                  "tags",
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                )
              }
              className="font-mono text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Live URL"
                value={project.liveUrl}
                onChange={(e) => updateProject(project.id, "liveUrl", e.target.value)}
                className="font-mono text-sm"
              />
              <Input
                placeholder="Repo URL"
                value={project.repoUrl}
                onChange={(e) => updateProject(project.id, "repoUrl", e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        ))}
        <ForgeButton variant="ghost" onClick={addProject} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </ForgeButton>
      </Section>

      <Section id="skills" label={`Skills (${data.skills.length})`}>
        <Input
          placeholder="Skills (comma-separated)"
          value={data.skills.join(", ")}
          onChange={(e) =>
            onChange({
              ...data,
              skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          className="font-mono text-sm"
        />
      </Section>

      <Section id="contact" label="Contact">
        <Input
          placeholder="Email"
          value={data.contact.email}
          onChange={(e) => updateContact("email", e.target.value)}
          className="font-mono text-sm"
        />
        <Input
          placeholder="LinkedIn URL"
          value={data.contact.linkedin}
          onChange={(e) => updateContact("linkedin", e.target.value)}
          className="font-mono text-sm"
        />
        <Input
          placeholder="GitHub URL"
          value={data.contact.github}
          onChange={(e) => updateContact("github", e.target.value)}
          className="font-mono text-sm"
        />
        <Input
          placeholder="Personal Website"
          value={data.contact.website}
          onChange={(e) => updateContact("website", e.target.value)}
          className="font-mono text-sm"
        />
      </Section>
    </div>
  );
};

export default PortfolioFormPanel;
