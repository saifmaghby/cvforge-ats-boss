import { PortfolioData, PortfolioTemplate } from "@/types/portfolio";
import DeveloperTemplate from "./templates/DeveloperTemplate";
import DesignerTemplate from "./templates/DesignerTemplate";
import MinimalPortfolioTemplate from "./templates/MinimalPortfolioTemplate";

interface Props {
  data: PortfolioData;
  template: PortfolioTemplate;
}

const templateComponents: Record<PortfolioTemplate, React.FC<{ data: PortfolioData }>> = {
  developer: DeveloperTemplate,
  designer: DesignerTemplate,
  minimal: MinimalPortfolioTemplate,
};

const PortfolioPreviewPanel = ({ data, template }: Props) => {
  const TemplateComponent = templateComponents[template];

  const hasContent =
    data.hero.name || data.about || data.projects.length > 0 || data.skills.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-secondary p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-primary" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Live Preview
        </span>
      </div>

      <div className="border border-border bg-white text-black overflow-hidden">
        {hasContent ? (
          <TemplateComponent data={data} />
        ) : (
          <div className="flex items-center justify-center h-96 text-neutral-400 text-[10px] font-mono uppercase tracking-widest">
            Start adding content to preview
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPreviewPanel;
