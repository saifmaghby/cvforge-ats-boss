import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ArabicCVFormPanel from "@/components/ArabicCVFormPanel";
import ArabicCVPreviewPanel from "@/components/ArabicCVPreviewPanel";
import ForgeButton from "@/components/ForgeButton";
import DashboardLayout from "@/components/DashboardLayout";
import { ArabicCVData, sampleArabicCVData, emptyArabicCVData, normalizeArabicCVData } from "@/types/arabic-cv";
import { ArabicCVTemplateId, arabicCvTemplates } from "@/components/arabic-cv-templates";
import { toast } from "sonner";
import { Save, Download } from "lucide-react";

const ArabicCVBuilder = () => {
  const { user } = useAuth();
  const [cvData, setCvData] = useState<ArabicCVData>(sampleArabicCVData);
  const [template, setTemplate] = useState<ArabicCVTemplateId>("arabic-classic");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [cvName, setCvName] = useState("سيرة ذاتية بدون عنوان");
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDataChange = useCallback((nextData: ArabicCVData) => {
    setCvData(normalizeArabicCVData(nextData));
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("saved_cvs").insert({
        user_id: user.id,
        name: cvName || "سيرة ذاتية عربية",
        template: template,
        cv_data: cvData as any,
      });
      if (error) throw error;
      toast.success("تم حفظ السيرة الذاتية بنجاح");
    } catch (e: any) {
      toast.error(e.message || "فشل حفظ السيرة الذاتية");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `${cvName || "cv-arabic"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(previewRef.current)
        .save();
      toast.success("تم تصدير PDF بنجاح");
    } catch {
      toast.error("فشل التصدير");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Toolbar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background" dir="rtl">
        <div className="flex items-center gap-4">
          <input
            className="bg-transparent border-none outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground w-48"
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
            dir="rtl"
          />
          <div className="flex gap-1">
            {arabicCvTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                  template === t.id
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.nameAr}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ForgeButton variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="w-3.5 h-3.5 ml-1" />
            {exporting ? "جارٍ التصدير..." : "تصدير PDF"}
          </ForgeButton>
          <ForgeButton size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-3.5 h-3.5 ml-1" />
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </ForgeButton>
        </div>
      </div>

      {/* Main grid - reversed for RTL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-7rem)]">
        <div className="overflow-auto max-h-[calc(100vh-7rem)]">
          <ArabicCVFormPanel data={cvData} onChange={handleDataChange} />
        </div>
        <ArabicCVPreviewPanel ref={previewRef} data={cvData} template={template} />
      </div>
    </DashboardLayout>
  );
};

export default ArabicCVBuilder;
