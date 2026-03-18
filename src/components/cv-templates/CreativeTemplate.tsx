import { CVData } from "@/types/cv";

const CreativeTemplate = ({ data }: { data: CVData }) => {
  const { personal, summary, experience, education, skills } = data;

  return (
    <article className="h-full overflow-hidden bg-white text-black font-sans text-[9px] leading-tight flex">
      {/* Left accent sidebar */}
      <div className="w-[32%] bg-neutral-950 text-white px-4 py-5 flex flex-col">
        {/* Name */}
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-tight leading-tight">
            {personal.fullName || "YOUR NAME"}
          </h3>
          {personal.title && (
            <p className="text-[8px] text-amber-400 mt-1 uppercase tracking-wider font-bold">
              {personal.title}
            </p>
          )}
        </div>

        {/* Contact */}
        <div className="mb-4">
          <h4 className="text-[7px] uppercase tracking-[0.15em] text-amber-400 mb-1.5 font-bold">
            Contact
          </h4>
          <div className="space-y-1 text-[7px] text-neutral-300">
            {personal.email && <p>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.linkedin && <p>{personal.linkedin}</p>}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[7px] uppercase tracking-[0.15em] text-amber-400 mb-1.5 font-bold">
              Skills
            </h4>
            <div className="space-y-1">
              {skills.map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-amber-400 flex-shrink-0" />
                  <span className="text-[7px] text-neutral-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h4 className="text-[7px] uppercase tracking-[0.15em] text-amber-400 mb-1.5 font-bold">
              Education
            </h4>
            {education.map((edu) => (
              <div key={edu.id} className="mb-1.5">
                <p className="text-white font-bold text-[8px]">{edu.degree}</p>
                {edu.institution && (
                  <p className="text-[7px] text-neutral-400">{edu.institution}</p>
                )}
                <p className="text-[7px] text-neutral-500">
                  {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 py-5">
        {/* Summary */}
        {summary && (
          <div className="mb-3 pb-3 border-b border-neutral-200">
            <h4 className="text-[7px] uppercase tracking-[0.15em] text-amber-600 mb-1 font-bold">
              Profile
            </h4>
            <p className="text-neutral-600 leading-relaxed text-[8px]">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <h4 className="text-[7px] uppercase tracking-[0.15em] text-amber-600 mb-2 font-bold">
              Experience
            </h4>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-2.5 relative pl-3">
                <div className="absolute left-0 top-0.5 w-1.5 h-1.5 bg-amber-500" />
                <div className="absolute left-[2.5px] top-2 bottom-0 w-px bg-neutral-200" />
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-black text-[8px]">{exp.role}</span>
                  <span className="text-neutral-400 text-[7px]">
                    {exp.startDate}{exp.current ? " – Present" : exp.endDate ? ` – ${exp.endDate}` : ""}
                  </span>
                </div>
                {exp.company && (
                  <p className="text-[7px] text-neutral-500">{exp.company}</p>
                )}
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul className="mt-0.5 space-y-0.5 text-neutral-600 text-[8px]">
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i}>▸ {b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default CreativeTemplate;
