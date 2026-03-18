import { forwardRef } from "react";
import { CVData } from "@/types/cv";
import { CVTemplateId } from "@/components/cv-templates";
import ClassicTemplate from "@/components/cv-templates/ClassicTemplate";
import MinimalTemplate from "@/components/cv-templates/MinimalTemplate";
import ModernTemplate from "@/components/cv-templates/ModernTemplate";
import CreativeTemplate from "@/components/cv-templates/CreativeTemplate";
import ExecutiveTemplate from "@/components/cv-templates/ExecutiveTemplate";

interface Props {
  data: CVData;
  template?: CVTemplateId;
}

const templateComponents: Record<CVTemplateId, React.FC<{ data: CVData }>> = {
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
};

const CVPreviewPanel = forwardRef<HTMLDivElement, Props>(({ data, template = "classic" }, ref) => {
  const { personal, summary, experience, education, skills } = data;
  const hasContent =
    personal.fullName || summary || experience.length || education.length || skills.length;

  const TemplateComponent = templateComponents[template];

  return (
    <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-auto border-l border-border bg-secondary p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-primary" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Live Preview
        </span>
      </div>

      <div ref={ref} className="border border-border bg-white text-black origin-top" style={{ aspectRatio: "1/1.414" }}>
        {hasContent ? (
          <TemplateComponent data={data} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-400 text-[10px] font-mono uppercase tracking-widest">
            Start typing to see preview
          </div>
        )}
      </div>
    </div>
  );
});

CVPreviewPanel.displayName = "CVPreviewPanel";

export default CVPreviewPanel;
