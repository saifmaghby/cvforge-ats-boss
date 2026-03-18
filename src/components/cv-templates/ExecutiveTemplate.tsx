import { CVData } from "@/types/cv";

const ExecutiveTemplate = ({ data }: { data: CVData }) => {
  const { personal, summary, experience, education, skills } = data;

  return (
    <article className="h-full overflow-hidden bg-white text-black font-serif text-[9px] leading-tight p-6">
      {/* Header — centered, stately */}
      <div className="text-center mb-3 pb-3 border-b-2 border-neutral-800">
        <h3 className="text-lg font-bold tracking-wide uppercase text-neutral-900 leading-none">
          {personal.fullName || "YOUR NAME"}
        </h3>
        {personal.title && (
          <p className="text-[9px] text-neutral-500 mt-1 tracking-widest uppercase">
            {personal.title}
          </p>
        )}
        {(personal.email || personal.phone || personal.location || personal.linkedin) && (
          <p className="text-[7px] text-neutral-400 mt-1.5 tracking-wide">
            {[personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join("   ◆   ")}
          </p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-3 text-center">
          <p className="text-neutral-600 leading-relaxed text-[8px] italic max-w-[85%] mx-auto">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-neutral-300" />
            <h4 className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-800">
              Professional Experience
            </h4>
            <div className="h-px flex-1 bg-neutral-300" />
          </div>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-black text-[8px] uppercase">{exp.role}</span>
                  {exp.company && (
                    <span className="text-neutral-500 text-[8px]"> — {exp.company}</span>
                  )}
                </div>
                <span className="text-neutral-400 text-[7px] italic">
                  {exp.startDate}{exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}
                </span>
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-0.5 space-y-0.5 text-neutral-600 text-[8px]">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="pl-3 relative">
                      <span className="absolute left-0">◇</span> {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-neutral-300" />
            <h4 className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-800">
              Education
            </h4>
            <div className="h-px flex-1 bg-neutral-300" />
          </div>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between mb-1">
              <div>
                <span className="text-black font-bold text-[8px]">{edu.degree}</span>
                {edu.institution && (
                  <span className="text-neutral-500 text-[8px]"> — {edu.institution}</span>
                )}
              </div>
              <span className="text-neutral-400 text-[7px] italic">
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-neutral-300" />
            <h4 className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-800">
              Core Competencies
            </h4>
            <div className="h-px flex-1 bg-neutral-300" />
          </div>
          <p className="text-neutral-600 text-[8px] text-center">{skills.join("   ◆   ")}</p>
        </div>
      )}
    </article>
  );
};

export default ExecutiveTemplate;
