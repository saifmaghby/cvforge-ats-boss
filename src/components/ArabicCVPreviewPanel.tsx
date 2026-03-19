import { forwardRef } from "react";
import { ArabicCVData } from "@/types/arabic-cv";
import { ArabicCVTemplateId } from "@/components/arabic-cv-templates";
import ArabicClassicTemplate from "@/components/arabic-cv-templates/ArabicClassicTemplate";
import ArabicModernTemplate from "@/components/arabic-cv-templates/ArabicModernTemplate";

interface Props {
  data: ArabicCVData;
  template?: ArabicCVTemplateId;
}

const templateComponents: Record<ArabicCVTemplateId, React.FC<{ data: ArabicCVData }>> = {
  "arabic-classic": ArabicClassicTemplate,
  "arabic-modern": ArabicModernTemplate,
};

const ArabicCVPreviewPanel = forwardRef<HTMLDivElement, Props>(({ data, template = "arabic-classic" }, ref) => {
  const { personal, summary, experience, education, skills } = data;
  const hasContent = personal.fullName || summary || experience.length || education.length || skills.length;

  const TemplateComponent = templateComponents[template];

  return (
    <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-auto border-r border-border bg-secondary p-6">
      <div className="flex items-center gap-2 mb-4" dir="rtl">
        <div className="w-2 h-2 bg-primary" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          معاينة مباشرة
        </span>
      </div>

      <div ref={ref} className="border border-border bg-white text-black origin-top" style={{ aspectRatio: "1/1.414" }}>
        {hasContent ? (
          <TemplateComponent data={data} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-400 text-[10px] uppercase tracking-widest" dir="rtl">
            ابدأ الكتابة لمشاهدة المعاينة
          </div>
        )}
      </div>
    </div>
  );
});

ArabicCVPreviewPanel.displayName = "ArabicCVPreviewPanel";

export default ArabicCVPreviewPanel;
