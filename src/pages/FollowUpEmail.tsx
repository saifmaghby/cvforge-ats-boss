import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import { Loader2, Mail, Copy, CheckCircle, Clock, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface EmailResult {
  subject: string;
  body: string;
  timing: string;
  tips: string[];
  alternativeSubjects: string[];
}

const emailTypes = [
  { value: "post-interview", label: "After Interview", desc: "Thank the interviewer & reaffirm interest" },
  { value: "post-application", label: "After Application", desc: "Check application status" },
  { value: "networking", label: "After Networking", desc: "Follow up on a networking conversation" },
  { value: "post-offer", label: "Offer Response", desc: "Accept, negotiate, or request time" },
  { value: "rejection-response", label: "After Rejection", desc: "Stay gracious, keep doors open" },
];

const FollowUpEmail = () => {
  const [type, setType] = useState("post-interview");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerate = async () => {
    if (!companyName.trim() || !roleName.trim()) { toast.error("Company and role are required"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("follow-up-email", {
        body: { type, companyName, roleName, recipientName, interviewDate, customDetails },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button onClick={() => copyToClipboard(text, field)} className="text-muted-foreground hover:text-foreground transition-colors">
      {copiedField === field ? <CheckCircle className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
            Follow-Up <span className="text-primary">Email</span> Generator
          </h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            Generate professional follow-up emails with perfect timing recommendations
          </p>
        </div>

        {/* Setup */}
        <div className="border border-border p-5 space-y-4">
          {/* Email Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Email Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {emailTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`text-left border p-3 transition-colors ${
                    type === t.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <span className="text-xs font-mono font-medium text-foreground block">{t.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Company *</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Vodafone Egypt"
                className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Role *</label>
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Frontend Developer"
                className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recipient Name (Optional)</label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g., Ahmed Hassan"
                className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Interview/Event Date (Optional)</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full border border-border bg-background text-foreground font-mono text-sm p-2 focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Additional Details (Optional)</label>
            <textarea
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="Topics discussed, specific points to mention, etc."
              rows={3}
              className="w-full border border-border bg-background text-foreground font-mono text-sm p-3 focus:border-primary outline-none resize-none"
            />
          </div>

          <ForgeButton variant="primary" onClick={handleGenerate} disabled={loading || !companyName.trim() || !roleName.trim()}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</> : <><Mail className="h-4 w-4 mr-2" /> Generate Email</>}
          </ForgeButton>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5">
            {/* Timing */}
            <div className="border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm font-mono text-foreground">{result.timing}</p>
            </div>

            {/* Subject Line */}
            <div className="border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary">Subject Line</h3>
                <CopyBtn text={result.subject} field="subject" />
              </div>
              <p className="font-mono text-sm text-foreground font-medium">{result.subject}</p>
              <div className="space-y-1 pt-2 border-t border-border">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Alternatives</span>
                {result.alternativeSubjects.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-xs font-mono text-muted-foreground">{s}</p>
                    <CopyBtn text={s} field={`subj-${i}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Email Body */}
            <div className="border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary">Email Body</h3>
                <CopyBtn text={result.body} field="body" />
              </div>
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">{result.body}</pre>
            </div>

            {/* Tips */}
            <div className="border border-border p-4 space-y-2">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-2"><Lightbulb className="h-3.5 w-3.5" /> Pro Tips</h3>
              <ul className="space-y-1.5">
                {result.tips.map((t, i) => (
                  <li key={i} className="text-xs font-mono text-muted-foreground">→ {t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FollowUpEmail;
