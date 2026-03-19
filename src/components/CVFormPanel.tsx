import { CVData, Experience, Education } from "@/types/cv";
import { Plus, Trash2, GripVertical } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

const inputClass =
  "w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground font-mono text-sm transition-colors duration-75 placeholder:text-muted-foreground/50";

const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1";

const sectionHeader = (label: string, sub: string) => (
  <div className="mb-6">
    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">{sub}</p>
    <h3 className="font-display text-xl font-bold uppercase tracking-tight">{label}</h3>
  </div>
);

const CVFormPanel = ({ data, onChange }: Props) => {
  const update = <K extends keyof CVData>(key: K, value: CVData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const updatePersonal = (field: string, value: string) => {
    update("personal", { ...data.personal, [field]: value });
  };

  // Experience helpers
  const addExperience = () => {
    update("experience", [
      ...data.experience,
      { id: crypto.randomUUID(), company: "", role: "", startDate: "", endDate: "", current: false, bullets: [""] },
    ]);
  };

  const updateExp = (id: string, patch: Partial<Experience>) => {
    update(
      "experience",
      data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  const removeExp = (id: string) => {
    update("experience", data.experience.filter((e) => e.id !== id));
  };

  // Education helpers
  const addEducation = () => {
    update("education", [
      ...data.education,
      { id: crypto.randomUUID(), institution: "", degree: "", startDate: "", endDate: "" },
    ]);
  };

  const updateEdu = (id: string, patch: Partial<Education>) => {
    update(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  const removeEdu = (id: string) => {
    update("education", data.education.filter((e) => e.id !== id));
  };

  // Skills
  const updateSkills = (value: string) => {
    update("skills", value.split(",").map((s) => s.trim()).filter(Boolean));
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-auto p-6 lg:p-8 space-y-10">
      {/* Personal Info */}
      <section>
        {sectionHeader("Personal Info", "Section 01")}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} value={data.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} placeholder="Ahmed Hassan" />
          </div>
          <div>
            <label className={labelClass}>Job Title</label>
            <input className={inputClass} value={data.personal.title} onChange={(e) => updatePersonal("title", e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="+20 100 XXX XXXX" />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} value={data.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} placeholder="Cairo, Egypt" />
          </div>
          <div>
            <label className={labelClass}>LinkedIn</label>
            <input className={inputClass} value={data.personal.linkedin} onChange={(e) => updatePersonal("linkedin", e.target.value)} placeholder="linkedin.com/in/yourname" />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section>
        {sectionHeader("Summary", "Section 02")}
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={data.summary}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="Results-driven professional with X+ years of experience in..."
        />
      </section>

      {/* Experience */}
      <section>
        {sectionHeader("Experience", "Section 03")}
        <div className="space-y-6">
          {data.experience.map((exp) => (
            <div key={exp.id} className="border border-border p-4 relative group">
              <button
                onClick={() => removeExp(exp.id)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label className={labelClass}>Role</label>
                  <input className={inputClass} value={exp.role} onChange={(e) => updateExp(exp.id, { role: e.target.value })} placeholder="Senior Engineer" />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input className={inputClass} value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} placeholder="Vodafone Egypt" />
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input className={inputClass} value={exp.startDate} onChange={(e) => updateExp(exp.id, { startDate: e.target.value })} placeholder="2021" />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <div className="flex items-center gap-3">
                    <input
                      className={`${inputClass} ${exp.current ? "opacity-30" : ""}`}
                      value={exp.endDate}
                      onChange={(e) => updateExp(exp.id, { endDate: e.target.value })}
                      placeholder="2024"
                      disabled={exp.current}
                    />
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground whitespace-nowrap cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExp(exp.id, { current: e.target.checked, endDate: "" })}
                        className="accent-[hsl(80,100%,53%)]"
                      />
                      Current
                    </label>
                  </div>
                </div>
              </div>
              {/* Bullets */}
              <div className="mt-4">
                <label className={labelClass}>Achievements</label>
                {exp.bullets.map((bullet, bi) => (
                  <div key={bi} className="flex items-start gap-2 mb-2">
                    <span className="text-muted-foreground mt-2.5 text-xs">•</span>
                    <input
                      className={inputClass}
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...exp.bullets];
                        newBullets[bi] = e.target.value;
                        updateExp(exp.id, { bullets: newBullets });
                      }}
                      placeholder="Orchestrated migration reducing deployment time by 73%..."
                    />
                    {exp.bullets.length > 1 && (
                      <button
                        onClick={() => updateExp(exp.id, { bullets: exp.bullets.filter((_, i) => i !== bi) })}
                        className="text-muted-foreground hover:text-destructive mt-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => updateExp(exp.id, { bullets: [...exp.bullets, ""] })}
                  className="text-[10px] font-mono uppercase tracking-widest text-primary hover:text-foreground transition-colors mt-1"
                >
                  + Add bullet
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addExperience}
            className="w-full border border-dashed border-border hover:border-primary p-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> Add Experience
          </button>
        </div>
      </section>

      {/* Education */}
      <section>
        {sectionHeader("Education", "Section 04")}
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="border border-border p-4 relative group">
              <button
                onClick={() => removeEdu(edu.id)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label className={labelClass}>Degree</label>
                  <input className={inputClass} value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} placeholder="BSc Computer Engineering" />
                </div>
                <div>
                  <label className={labelClass}>Institution</label>
                  <input className={inputClass} value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })} placeholder="Cairo University" />
                </div>
                <div>
                  <label className={labelClass}>Start</label>
                  <input className={inputClass} value={edu.startDate} onChange={(e) => updateEdu(edu.id, { startDate: e.target.value })} placeholder="2014" />
                </div>
                <div>
                  <label className={labelClass}>End</label>
                  <input className={inputClass} value={edu.endDate} onChange={(e) => updateEdu(edu.id, { endDate: e.target.value })} placeholder="2018" />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addEducation}
            className="w-full border border-dashed border-border hover:border-primary p-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> Add Education
          </button>
        </div>
      </section>

      {/* Skills */}
      <section className="pb-8">
        {sectionHeader("Skills", "Section 05")}
        <label className={labelClass}>Comma-separated</label>
        <input
          className={inputClass}
          value={data.skills.join(", ")}
          onChange={(e) => updateSkills(e.target.value)}
          placeholder="TypeScript, React, Node.js, Python, AWS..."
        />
      </section>
    </div>
  );
};

export default CVFormPanel;
