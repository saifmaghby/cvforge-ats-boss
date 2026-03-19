import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CVFormPanel from "@/components/CVFormPanel";
import CVPreviewPanel from "@/components/CVPreviewPanel";
import ForgeButton from "@/components/ForgeButton";
import TailorCVDialog from "@/components/TailorCVDialog";
import DashboardLayout from "@/components/DashboardLayout";
import { CVData, sampleCVData, emptyCVData } from "@/types/cv";
import { CVTemplateId, cvTemplates } from "@/components/cv-templates";
import { toast } from "sonner";
import { Save } from "lucide-react";

const CVBuilder = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const cvId = searchParams.get("cv");

  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplateId>("classic");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cvName, setCvName] = useState("Untitled CV");
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load CV from cloud if cvId is present
  useEffect(() => {
    if (!cvId || !user) {
      if (!cvId) setCvData(sampleCVData);
      setLoaded(true);
      return;
    }
    const load = async () => {
      const { data, error } = await supabase
        .from("saved_cvs")
        .select("*")
        .eq("id", cvId)
        .single();
      if (error || !data) {
        toast.error("Could not load CV");
        setCvData(sampleCVData);
      } else {
        const raw = data.cv_data as Record<string, unknown> ?? {};
        const merged: CVData = {
          personal: { ...emptyCVData.personal, ...(raw.personal as Record<string, unknown> ?? {}) } as CVData["personal"],
          summary: (raw.summary as string) ?? emptyCVData.summary,
          experience: (raw.experience as CVData["experience"]) ?? emptyCVData.experience,
          education: (raw.education as CVData["education"]) ?? emptyCVData.education,
          skills: (raw.skills as CVData["skills"]) ?? emptyCVData.skills,
        };
        setCvData(merged);
        setTemplate((data.template || "classic") as CVTemplateId);
        setCvName(data.name);
      }
      setLoaded(true);
    };
    load();
  }, [cvId, user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (cvId) {
        const { error } = await supabase
          .from("saved_cvs")
          .update({ cv_data: JSON.parse(JSON.stringify(cvData)), template, name: cvName })
          .eq("id", cvId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_cvs")
          .insert([{ user_id: user.id, cv_data: JSON.parse(JSON.stringify(cvData)), template, name: cvName }]);
        if (error) throw error;
      }
      toast.success("CV saved");
    } catch {
      toast.error("Failed to save CV");
    } finally {
      setSaving(false);
    }
  }, [user, cvId, cvData, template, cvName]);

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

  if (!loaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen text-muted-foreground font-mono text-sm">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Builder toolbar */}
      <div className="border-b border-border px-4 h-12 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Builder
          </span>
          <input
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-sm font-mono outline-none px-1 py-0.5 max-w-[200px] text-foreground"
            placeholder="CV Name"
          />
        </div>
        <div className="flex items-center gap-3">
          <ForgeButton variant="ghost" onClick={() => setCvData(emptyCVData)}>
            Clear
          </ForgeButton>
          <ForgeButton variant="ghost" onClick={() => setCvData(sampleCVData)}>
            Load Sample
          </ForgeButton>
          <TailorCVDialog data={cvData} onChange={setCvData} />
          <ForgeButton variant="ghost" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving…" : "Save"}
          </ForgeButton>
          <ForgeButton variant="primary" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? "Exporting…" : "Export PDF"}
          </ForgeButton>
        </div>
      </div>

      {/* Template selector bar */}
      <div className="border-b border-border px-4 h-10 flex items-center gap-1 bg-background overflow-x-auto">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-3 whitespace-nowrap">
          Template
        </span>
        {cvTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors whitespace-nowrap ${
              template === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Split layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2" style={{ height: "calc(100vh - 9rem)" }}>
        <CVFormPanel data={cvData} onChange={setCvData} />
        <div className="hidden lg:block">
          <CVPreviewPanel ref={previewRef} data={cvData} template={template} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVBuilder;
