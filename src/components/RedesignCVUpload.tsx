import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeCVData } from "@/types/cv";
import ForgeButton from "@/components/ForgeButton";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface RedesignCVUploadProps {
  compact?: boolean;
}

const RedesignCVUpload = ({ compact = false }: RedesignCVUploadProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setFile(selected);
  };

  const fileToBase64 = async (f: File): Promise<string> => {
    const buffer = await f.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleRedesign = async () => {
    if (!file || !user) return;
    setProcessing(true);

    try {
      const cvBase64 = await fileToBase64(file);

      // Run extract + ATS audit in parallel
      const [extractRes, auditRes] = await Promise.all([
        supabase.functions.invoke("extract-cv", { body: { cvBase64 } }),
        supabase.functions.invoke("ats-audit", { body: { cvBase64 } }),
      ]);

      if (extractRes.error) throw extractRes.error;
      if (extractRes.data?.error) throw new Error(extractRes.data.error);

      const cvData = normalizeCVData(extractRes.data);

      // Save as new CV
      const { data: savedCV, error: saveError } = await supabase
        .from("saved_cvs")
        .insert([{
          user_id: user.id,
          name: cvData.personal.fullName
            ? `${cvData.personal.fullName} — Redesigned`
            : "Redesigned CV",
          cv_data: JSON.parse(JSON.stringify(cvData)),
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      // Store audit data in sessionStorage for the builder to pick up
      const auditData = !auditRes.error && auditRes.data && !auditRes.data.error
        ? auditRes.data
        : null;

      if (auditData) {
        sessionStorage.setItem(`ats-audit-${savedCV.id}`, JSON.stringify(auditData));
      }

      toast.success("CV extracted and redesigned! Choose a template.");
      navigate(`/builder?cv=${savedCV.id}`);
    } catch (err) {
      console.error("Redesign error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to extract CV data");
    } finally {
      setProcessing(false);
    }
  };

  const fileSelectedUI = (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-sm font-mono text-muted-foreground ${compact ? "" : "justify-center"}`}>
        <FileText className="h-4 w-4" />
        <span className={`truncate ${compact ? "" : "max-w-[200px]"}`}>{file?.name}</span>
        <button
          onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          className={`text-xs text-muted-foreground hover:text-foreground ${compact ? "ml-auto" : "underline"}`}
        >
          Change
        </button>
      </div>
      <ForgeButton
        variant="primary"
        onClick={handleRedesign}
        disabled={processing}
        className={compact ? "w-full justify-center" : ""}
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Extracting & Scoring…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Redesign My CV
          </>
        )}
      </ForgeButton>
    </div>
  );

  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf"
      onChange={handleFileChange}
      className="hidden"
    />
  );

  if (compact) {
    return (
      <div className="space-y-3">
        {hiddenInput}
        {!file ? (
          <ForgeButton
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="w-full justify-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Old CV (PDF)
          </ForgeButton>
        ) : fileSelectedUI}
      </div>
    );
  }

  return (
    <div className="border border-dashed border-border p-8 text-center space-y-4">
      {hiddenInput}
      <div className="flex justify-center">
        <div className="w-12 h-12 border border-primary/30 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">
          Redesign Your CV
        </h3>
        <p className="text-sm font-mono text-muted-foreground mt-1">
          Upload your old CV (PDF) and we'll extract your data, score it for ATS readiness, and redesign it with a modern template.
        </p>
      </div>
      {!file ? (
        <ForgeButton
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose PDF File
        </ForgeButton>
      ) : fileSelectedUI}
    </div>
  );
};

export default RedesignCVUpload;
