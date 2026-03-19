import { ArabicCVData, ArabicExperience, ArabicEducation } from "@/types/arabic-cv";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: ArabicCVData;
  onChange: (data: ArabicCVData) => void;
}

const inputClass =
  "w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground text-sm transition-colors duration-75 placeholder:text-muted-foreground/50";

const labelClass = "block text-[10px] uppercase tracking-widest text-muted-foreground mb-1";

const sectionHeader = (labelAr: string, sub: string) => (
  <div className="mb-6" dir="rtl">
    <p className="text-[10px] uppercase tracking-[0.2em] text-primary mb-1">{sub}</p>
    <h3 className="text-xl font-bold tracking-tight">{labelAr}</h3>
  </div>
);

const ArabicCVFormPanel = ({ data, onChange }: Props) => {
  const update = <K extends keyof ArabicCVData>(key: K, value: ArabicCVData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const updatePersonal = (field: string, value: string) => {
    update("personal", { ...data.personal, [field]: value });
  };

  const addExperience = () => {
    update("experience", [
      ...data.experience,
      { id: crypto.randomUUID(), company: "", role: "", startDate: "", endDate: "", current: false, bullets: [""] },
    ]);
  };

  const updateExp = (id: string, patch: Partial<ArabicExperience>) => {
    update("experience", data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeExp = (id: string) => {
    update("experience", data.experience.filter((e) => e.id !== id));
  };

  const addEducation = () => {
    update("education", [
      ...data.education,
      { id: crypto.randomUUID(), institution: "", degree: "", startDate: "", endDate: "" },
    ]);
  };

  const updateEdu = (id: string, patch: Partial<ArabicEducation>) => {
    update("education", data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEdu = (id: string) => {
    update("education", data.education.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-10 p-6" dir="rtl">
      {/* Personal Info */}
      <section>
        {sectionHeader("المعلومات الشخصية", "القسم الأول")}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2">
            <label className={labelClass}>الاسم الكامل</label>
            <input className={inputClass} placeholder="أدخل اسمك الكامل" value={data.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>المسمى الوظيفي</label>
            <input className={inputClass} placeholder="مثال: مهندس برمجيات أول" value={data.personal.title} onChange={(e) => updatePersonal("title", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>الموقع</label>
            <input className={inputClass} placeholder="القاهرة، مصر" value={data.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>البريد الإلكتروني</label>
            <input className={inputClass} dir="ltr" style={{ textAlign: "right" }} placeholder="email@example.com" value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>رقم الهاتف</label>
            <input className={inputClass} dir="ltr" style={{ textAlign: "right" }} placeholder="+20 100 XXX XXXX" value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>لينكد إن</label>
            <input className={inputClass} dir="ltr" style={{ textAlign: "right" }} placeholder="linkedin.com/in/yourname" value={data.personal.linkedin} onChange={(e) => updatePersonal("linkedin", e.target.value)} />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section>
        {sectionHeader("الملخص المهني", "نبذة عنك")}
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="اكتب ملخصاً مهنياً مختصراً يوضح خبراتك وأهدافك المهنية..."
          value={data.summary}
          onChange={(e) => update("summary", e.target.value)}
        />
      </section>

      {/* Experience */}
      <section>
        {sectionHeader("الخبرة العملية", "الخبرات")}
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-6 border border-border p-4 relative group">
            <button onClick={() => removeExp(exp.id)} className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-destructive transition-opacity">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <label className={labelClass}>المسمى الوظيفي</label>
                <input className={inputClass} placeholder="مهندس برمجيات" value={exp.role} onChange={(e) => updateExp(exp.id, { role: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>الشركة</label>
                <input className={inputClass} placeholder="اسم الشركة" value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>تاريخ البداية</label>
                <input className={inputClass} dir="ltr" style={{ textAlign: "right" }} placeholder="2021" value={exp.startDate} onChange={(e) => updateExp(exp.id, { startDate: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>تاريخ الانتهاء</label>
                <div className="flex items-center gap-3">
                  <input className={inputClass} dir="ltr" style={{ textAlign: "right" }} placeholder="2023" disabled={exp.current} value={exp.endDate} onChange={(e) => updateExp(exp.id, { endDate: e.target.value })} />
                  <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap cursor-pointer">
                    <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, { current: e.target.checked, endDate: "" })} className="accent-primary" />
                    حالي
                  </label>
                </div>
              </div>
            </div>
            {/* Bullets */}
            <div className="mt-3 space-y-2">
              <label className={labelClass}>الإنجازات</label>
              {exp.bullets.map((b, bi) => (
                <div key={bi} className="flex items-center gap-2">
                  <span className="text-primary text-[10px]">•</span>
                  <input
                    className={inputClass}
                    placeholder="أضف إنجازاً..."
                    value={b}
                    onChange={(e) => {
                      const newBullets = [...exp.bullets];
                      newBullets[bi] = e.target.value;
                      updateExp(exp.id, { bullets: newBullets });
                    }}
                  />
                  {exp.bullets.length > 1 && (
                    <button onClick={() => updateExp(exp.id, { bullets: exp.bullets.filter((_, j) => j !== bi) })} className="text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => updateExp(exp.id, { bullets: [...exp.bullets, ""] })} className="text-primary text-[10px] uppercase tracking-widest hover:underline">
                + إضافة إنجاز
              </button>
            </div>
          </div>
        ))}
        <button onClick={addExperience} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <Plus className="w-4 h-4" /> إضافة خبرة عملية
        </button>
      </section>

      {/* Education */}
      <section>
        {sectionHeader("التعليم", "المؤهلات")}
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-4 border border-border p-4 relative group">
            <button onClick={() => removeEdu(edu.id)} className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-destructive transition-opacity">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <label className={labelClass}>الدرجة العلمية</label>
                <input className={inputClass} placeholder="بكالوريوس هندسة حاسبات" value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>المؤسسة التعليمية</label>
                <input className={inputClass} placeholder="جامعة القاهرة" value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>تاريخ البداية</label>
                <input className={inputClass} dir="ltr" style={{ textAlign: "right" }} placeholder="2014" value={edu.startDate} onChange={(e) => updateEdu(edu.id, { startDate: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>تاريخ الانتهاء</label>
                <input className={inputClass} dir="ltr" style={{ textAlign: "right" }} placeholder="2018" value={edu.endDate} onChange={(e) => updateEdu(edu.id, { endDate: e.target.value })} />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addEducation} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <Plus className="w-4 h-4" /> إضافة مؤهل تعليمي
        </button>
      </section>

      {/* Skills */}
      <section>
        {sectionHeader("المهارات", "مهاراتك")}
        <div className="flex flex-wrap gap-2 mb-3">
          {data.skills.map((skill, i) => (
            <span key={i} className="flex items-center gap-1 bg-secondary text-foreground text-xs px-2 py-1 border border-border">
              {skill}
              <button onClick={() => update("skills", data.skills.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80">×</button>
            </span>
          ))}
        </div>
        <input
          className={inputClass}
          placeholder="اكتب مهارة واضغط Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const val = (e.target as HTMLInputElement).value.trim();
              if (val && !data.skills.includes(val)) {
                update("skills", [...data.skills, val]);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
      </section>
    </div>
  );
};

export default ArabicCVFormPanel;
