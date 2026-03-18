import { CVData } from "@/types/cv";

const MinimalTemplate = ({ data }: { data: CVData }) => {
  const { personal, summary, experience, education, skills } = data;

  return (
    <article className="p-8 font-mono text-[9px] leading-tight h-full overflow-hidden bg-white text-black">
      {/* Header — clean, left-aligned */}
      <div className="mb-4">
        <h3 className="text-lg font-bold tracking-tight text-black leading-none">
          {personal.fullName || "YOUR NAME"}
        </h3>
        {personal.title && (
          <p className="text-[9px] text-neutral-500 mt-1 tracking-wide uppercase">
            {personal.title}
          </p>
        )}
        {(personal.email || personal.phone || personal.location || personal.linkedin) && (
          <p className="text-[7px] text-neutral-400 mt-1.5">
            {[personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join("  ·  ")}
          </p>
        )}
      </div>

      <div className="w-full h-px bg-neutral-200 mb-3" />

      {/* Summary */}
      {summary && (
        <div className="mb-3">
          <p className="text-neutral-600 leading-relaxed text-[8px]">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-3">
          <h4 className="text-[7px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">
            Experience
          </h4>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-black text-[8px]">
                  {exp.role}{exp.company ? `, ${exp.company}` : ""}
                </span>
                <span className="text-neutral-400 text-[7px]">
                  {exp.startDate}{exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}
                </span>
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-0.5 space-y-0.5 text-neutral-600 text-[8px]">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="pl-2">— {b}</li>
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
          <h4 className="text-[7px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">
            Education
          </h4>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between mb-1">
              <span className="text-black text-[8px]">
                {edu.degree}{edu.institution ? `, ${edu.institution}` : ""}
              </span>
              <span className="text-neutral-400 text-[7px]">
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h4 className="text-[7px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">
            Skills
          </h4>
          <p className="text-neutral-600 text-[8px]">{skills.join("  ·  ")}</p>
        </div>
      )}
    </article>
  );
};

export default MinimalTemplate;
