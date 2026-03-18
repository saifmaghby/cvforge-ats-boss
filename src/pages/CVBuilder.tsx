import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CVFormPanel from "@/components/CVFormPanel";
import CVPreviewPanel from "@/components/CVPreviewPanel";
import ForgeButton from "@/components/ForgeButton";
import TailorCVDialog from "@/components/TailorCVDialog";
import DashboardLayout from "@/components/DashboardLayout";
import { CVData, sampleCVData, emptyCVData } from "@/types/cv";

const CVBuilder = () => {
  const [cvData, setCvData] = useState<CVData>(sampleCVData);

  return (
    <DashboardLayout>
      {/* Builder toolbar */}
      <div className="border-b border-border px-4 h-12 flex items-center justify-between bg-background">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Builder
        </span>
        <div className="flex items-center gap-3">
          <ForgeButton variant="ghost" onClick={() => setCvData(emptyCVData)}>
            Clear
          </ForgeButton>
          <ForgeButton variant="ghost" onClick={() => setCvData(sampleCVData)}>
            Load Sample
          </ForgeButton>
          <TailorCVDialog data={cvData} onChange={setCvData} />
          <ForgeButton variant="primary">Export PDF</ForgeButton>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ height: "calc(100vh - 7.5rem)" }}>
        <CVFormPanel data={cvData} onChange={setCvData} />
        <div className="hidden lg:block">
          <CVPreviewPanel data={cvData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVBuilder;
