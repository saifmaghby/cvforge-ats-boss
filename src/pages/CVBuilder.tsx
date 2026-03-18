import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CVFormPanel from "@/components/CVFormPanel";
import CVPreviewPanel from "@/components/CVPreviewPanel";
import ForgeButton from "@/components/ForgeButton";
import TailorCVDialog from "@/components/TailorCVDialog";
import { CVData, sampleCVData, emptyCVData } from "@/types/cv";

const CVBuilder = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cvData, setCvData] = useState<CVData>(sampleCVData);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <nav className="border-b border-border sticky top-0 bg-background z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="font-display text-lg font-bold uppercase tracking-tight">
              CV<span className="text-primary">Forge</span>
            </a>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hidden sm:inline">
              Builder
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ForgeButton
              variant="ghost"
              onClick={() => setCvData(emptyCVData)}
            >
              Clear
            </ForgeButton>
            <ForgeButton
              variant="ghost"
              onClick={() => setCvData(sampleCVData)}
            >
              Load Sample
            </ForgeButton>
            <ForgeButton variant="primary">
              Export PDF
            </ForgeButton>
          </div>
        </div>
      </nav>

      {/* Main split layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <CVFormPanel data={cvData} onChange={setCvData} />
        <div className="hidden lg:block">
          <CVPreviewPanel data={cvData} />
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
