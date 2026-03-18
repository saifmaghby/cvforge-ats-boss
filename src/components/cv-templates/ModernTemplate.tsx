import { CVData } from "@/types/cv";

const ModernTemplate = ({ data }: { data: CVData }) => {
  const { personal, summary, experience, education, skills } = data;

  return (
    <article className="h-full overflow-hidden bg-white text-black font-sans text-[9px] leading-tight">
      {/* Header with accent bar */}
      <div className="bg-neutral-900 text-white px-6 py-4">
        <h3 className="text-base font-bold tracking-tight leading-none">
          {personal.fullName || "YOUR NAME"}
        </h3>
        {personal.title && (
          <p className="text-[9px] text-neutral-300 mt-1">{personal.title}</p>
        )}
        {(personal.email || personal.phone || personal.location || personal.linkedin) && (
          <p className="text-[7px] text-neutral-400 mt-1.5">
            {[personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join("  |  ")}
          </p>
        )}
      </div>

      <div className="px-6 py-4">
        {/* Summary */}
        {summary && (
          <div className="mb-3 pb-3 border-b border-neutral-100">
            <p className="text-neutral-600 leading-relaxed text-[8px]">{summary}</p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-5">
          {/* Main column */}
          <div className="flex-1">
            {experience.length > 0 && (
              <div className="mb-3">
                <h4 className="text-[8px] font-bold uppercase tracking-[0.12em] text-neutral-900 mb-2 pb-0.5 border-b-2 border-neutral-900 inline-block">
                  Experience
                </h4>
                {experience.map((exp) => (
                  <div key={exp.id} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-black text-[8px]">{exp.role}</span>
                      <span className="text-neutral-400 text-[7px]">
                        {exp.startDate}{exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}
                      </span>
                    </div>
                    {exp.company && (
                      <p className="text-[7px] text-neutral-500 italic">{exp.company}</p>
                    )}
                    {exp.bullets.filter(Boolean).length > 0 && (
                      <ul className="mt-0.5 space-y-0.5 text-neutral-600 text-[8px]">
                        {exp.bullets.filter(Boolean).map((b, i) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side column */}
          <div className="w-[30%] pl-3 border-l border-neutral-100">
            {education.length > 0 && (
              <div className="mb-3">
                <h4 className="text-[8px] font-bold uppercase tracking-[0.12em] text-neutral-900 mb-2 pb-0.5 border-b-2 border-neutral-900 inline-block">
                  Education
                </h4>
                {education.map((edu) => (
                  <div key={edu.id} className="mb-1.5">
                    <p className="text-black font-bold text-[8px]">{edu.degree}</p>
                    {edu.institution && (
                      <p className="text-[7px] text-neutral-500">{edu.institution}</p>
                    )}
                    <p className="text-[7px] text-neutral-400">
                      {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <h4 className="text-[8px] font-bold uppercase tracking-[0.12em] text-neutral-900 mb-2 pb-0.5 border-b-2 border-neutral-900 inline-block">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => (
                    <span key={s} className="text-[7px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ModernTemplate;
