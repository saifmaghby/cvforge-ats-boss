import { ArabicCVData } from "@/types/arabic-cv";

const ArabicModernTemplate = ({ data }: { data: ArabicCVData }) => {
  const { personal, summary, experience, education, skills } = data;

  return (
    <article dir="rtl" className="h-full overflow-hidden bg-white text-black" style={{ fontFamily: "'Noto Kufi Arabic', 'Tajawal', sans-serif" }}>
      {/* Header with accent bar */}
      <div className="bg-neutral-900 text-white p-5 pb-4">
        <h3 className="text-sm font-bold tracking-tight">
          {personal.fullName || "الاسم الكامل"}
        </h3>
        {personal.title && (
          <p className="text-[9px] text-neutral-300 mt-0.5">{personal.title}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-2 text-[7px] text-neutral-400" dir="ltr" style={{ justifyContent: "flex-end" }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_0.4fr] gap-0 text-[8px] leading-tight">
        {/* Main Content - Right side in RTL */}
        <div className="p-4 space-y-2.5">
          {/* Summary */}
          {summary && (
            <div>
              <h4 className="text-[8px] font-bold text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1">
                الملخص المهني
              </h4>
              <p className="text-neutral-700 leading-snug">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h4 className="text-[8px] font-bold text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1">
                الخبرة العملية
              </h4>
              {experience.map((exp) => (
                <div key={exp.id} className="mb-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-neutral-900">
                      {exp.role}
                    </span>
                    <span className="text-neutral-400 text-[7px]" dir="ltr">
                      {exp.startDate}{exp.current ? " – الحالي" : exp.endDate ? ` – ${exp.endDate}` : ""}
                    </span>
                  </div>
                  {exp.company && (
                    <p className="text-neutral-500 text-[7px]">{exp.company}</p>
                  )}
                  {exp.bullets.length > 0 && (
                    <ul className="mt-0.5 space-y-0.5 text-neutral-700">
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

        {/* Sidebar - Left side in RTL */}
        <div className="bg-neutral-50 p-4 space-y-2.5 border-r border-neutral-200">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h4 className="text-[8px] font-bold text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1">
                التعليم
              </h4>
              {education.map((edu) => (
                <div key={edu.id} className="mb-1">
                  <p className="font-bold text-neutral-900 text-[7px]">{edu.degree}</p>
                  <p className="text-neutral-600 text-[7px]">{edu.institution}</p>
                  <p className="text-neutral-400 text-[6px]" dir="ltr" style={{ textAlign: "right" }}>
                    {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h4 className="text-[8px] font-bold text-neutral-900 border-b border-neutral-200 pb-0.5 mb-1">
                المهارات
              </h4>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill, i) => (
                  <span key={i} className="bg-neutral-200 text-neutral-800 text-[6px] px-1.5 py-0.5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ArabicModernTemplate;
