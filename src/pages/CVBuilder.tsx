import { useState, useRef } from "react";
import CVFormPanel from "@/components/CVFormPanel";
import CVPreviewPanel from "@/components/CVPreviewPanel";
import ForgeButton from "@/components/ForgeButton";
import TailorCVDialog from "@/components/TailorCVDialog";
import DashboardLayout from "@/components/DashboardLayout";
import { CVData, sampleCVData, emptyCVData } from "@/types/cv";
import { toast } from "sonner";

const CVBuilder = () => {
  const [cvData, setCvData] = useState<CVData>(sampleCVData);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = cvData.personal.fullName
        ? `${cvData.personal.fullName.replace(/\s+/g, "_")}_CV.pdf`
        : "CV.pdf";
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(previewRef.current)
        .save();
      toast.success("PDF exported successfully");
    } catch {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

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
          <ForgeButton variant="primary" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? "Exporting…" : "Export PDF"}
          </ForgeButton>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ height: "calc(100vh - 7.5rem)" }}>
        <CVFormPanel data={cvData} onChange={setCvData} />
        <div className="hidden lg:block">
          <CVPreviewPanel ref={previewRef} data={cvData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVBuilder;
