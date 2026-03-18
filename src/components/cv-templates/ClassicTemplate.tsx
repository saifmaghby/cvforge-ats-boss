import { CVData } from "@/types/cv";

/** The original "industrial" template — extracted from CVPreviewPanel */
const ClassicTemplate = ({ data }: { data: CVData }) => {
  const { personal, summary, experience, education, skills } = data;

  return (
    <article className="p-6 font-mono text-[9px] leading-tight h-full overflow-hidden bg-white text-black">
      {/* Header */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <h3 className="font-display text-sm font-bold tracking-tight text-black">
          {personal.fullName || "YOUR NAME"}
        </h3>
        {(personal.title || personal.location) && (
          <p className="text-[8px] text-neutral-600 mt-0.5">
            {[personal.title, personal.location].filter(Boolean).join(" · ")}
          </p>
        )}
        {(personal.email || personal.phone || personal.linkedin) && (
          <p className="text-[7px] text-neutral-500 mt-0.5">
            {[personal.email, personal.phone, personal.linkedin].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-2">
          <h4 className="font-display text-[8px] font-bold uppercase tracking-widest text-black mb-0.5">
            Professional Summary
          </h4>
          <p className="text-neutral-700 leading-snug text-[8px]">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-2">
          <h4 className="font-display text-[8px] font-bold uppercase tracking-widest text-black mb-0.5">
            Experience
          </h4>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-1.5">
              <div className="flex justify-between">
                <span className="font-bold text-black text-[8px]">
                  {exp.role}{exp.company ? ` — ${exp.company}` : ""}
                </span>
                <span className="text-neutral-500 text-[7px]">
                  {exp.startDate}{exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}
                </span>
              </div>
              {exp.bullets.length > 0 && (
                <ul className="mt-0.5 space-y-0.5 text-neutral-700 text-[8px]">
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-2">
          <h4 className="font-display text-[8px] font-bold uppercase tracking-widest text-black mb-0.5">
            Education
          </h4>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between mb-1">
              <span className="text-black font-bold text-[8px]">
                {edu.degree}{edu.institution ? ` — ${edu.institution}` : ""}
              </span>
              <span className="text-neutral-500 text-[7px]">
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h4 className="font-display text-[8px] font-bold uppercase tracking-widest text-black mb-0.5">
            Skills
          </h4>
          <p className="text-neutral-700 text-[8px]">{skills.join(" · ")}</p>
        </div>
      )}
    </article>
  );
};

export default ClassicTemplate;
