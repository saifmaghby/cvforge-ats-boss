import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ForgeButton from "@/components/ForgeButton";
import ATSScoreGauge from "@/components/ATSScoreGauge";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { AlertTriangle, Check, X, Zap, FileText, Briefcase, ChevronRight, BarChart3, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ATSResult {
  overallScore: number;
  keywordMatchPercent: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  suggestions: string[];
  summary: string;
}

const StatCard = ({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: React.ElementType }) => (
  <div className="border border-border p-5 flex items-start gap-4">
    <div className="p-2 border border-border bg-secondary">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
      <p className="font-display text-2xl font-bold text-foreground leading-none">{value}</p>
      {sub && <p className="text-[10px] font-mono text-muted-foreground mt-1">{sub}</p>}
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, variant = "primary" }: { icon: React.ElementType; title: string; variant?: "primary" | "destructive" }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`p-1.5 border ${variant === "destructive" ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
      <Icon className={`h-3.5 w-3.5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
    </div>
    <p className={`text-[10px] font-mono uppercase tracking-[0.2em] font-semibold ${variant === "destructive" ? "text-destructive" : "text-primary"}`}>
      {title}
    </p>
  </div>
);

const ATSChecker = () => {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const runAudit = async () => {
    if (!cvText.trim() || !jobDescription.trim()) {
      toast.error("Paste both your CV text and the job description.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ats-checker", {
        body: { cvText, jobDescription },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setResult(data as ATSResult);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const cvWordCount = cvText.trim().split(/\s+/).filter(Boolean).length;
  const jdWordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border px-6 lg:px-10 py-8">
          <div className="max-w-5xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 border border-primary/30 bg-primary/5">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                Parser Simulation Engine
              </p>
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter mb-2">
              ATS Compatibility Audit
            </h1>
            <p className="text-sm font-mono text-muted-foreground max-w-xl leading-relaxed">
              Simulates how ATS parsers on Wuzzuf, Bayt, LinkedIn, and multinational portals process your CV against a specific job description.
            </p>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-8 max-w-5xl">
          {/* Input section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-6">
            <div className="border border-border p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                    CV Content
                  </label>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {cvWordCount} words
                </span>
              </div>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                className="w-full h-56 bg-secondary/50 border border-border focus:border-primary outline-none p-4 text-sm font-mono text-foreground transition-colors resize-none placeholder:text-muted-foreground/30 leading-relaxed"
                placeholder="Paste your full CV content here (plain text)..."
              />
            </div>
            <div className="border border-border border-t-0 lg:border-t lg:border-l-0 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
                    Job Description
                  </label>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {jdWordCount} words
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-56 bg-secondary/50 border border-border focus:border-primary outline-none p-4 text-sm font-mono text-foreground transition-colors resize-none placeholder:text-muted-foreground/30 leading-relaxed"
                placeholder="Paste the target job description here..."
              />
            </div>
          </div>

          <ForgeButton size="lg" onClick={runAudit} className="w-full sm:w-auto mb-10" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 border border-primary-foreground border-t-transparent animate-spin" />
                Analyzing…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Run ATS Audit
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </ForgeButton>

          {/* Loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border border-border p-6 mb-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Running Parser Simulation
                  </span>
                </div>
                <div className="space-y-2">
                  {["Tokenizing CV content", "Extracting JD requirements", "Cross-referencing keywords", "Evaluating formatting"].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className="h-1 w-1 bg-primary animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                      <span className="text-[10px] font-mono text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Score overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border mb-0">
                  <div className="p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-border bg-secondary/30">
                    <ATSScoreGauge score={result.overallScore} />
                  </div>
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-0">
                    <StatCard
                      icon={BarChart3}
                      label="Keyword Match"
                      value={`${result.keywordMatchPercent}%`}
                      sub={`${result.matchedKeywords.length} of ${result.matchedKeywords.length + result.missingKeywords.length} keywords`}
                    />
                    <StatCard
                      icon={Check}
                      label="Matched"
                      value={result.matchedKeywords.length}
                      sub="keywords found in CV"
                    />
                    <StatCard
                      icon={AlertTriangle}
                      label="Issues Found"
                      value={result.formattingIssues.length + result.missingKeywords.length}
                      sub="require attention"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="border border-border border-t-0 p-6 bg-secondary/20">
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">Analysis Summary</p>
                  <p className="text-sm font-mono text-foreground/80 leading-relaxed">{result.summary}</p>
                </div>

                {/* Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="border border-border border-t-0 p-6">
                    <SectionHeader icon={Check} title="Matched Keywords" />
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedKeywords.map((kw) => (
                        <span key={kw} className="border border-primary/20 bg-primary/5 text-primary px-2.5 py-1 text-[11px] font-mono">
                          {kw}
                        </span>
                      ))}
                      {result.matchedKeywords.length === 0 && (
                        <span className="text-xs font-mono text-muted-foreground">None detected</span>
                      )}
                    </div>
                  </div>
                  <div className="border border-border border-t-0 md:border-l-0 p-6">
                    <SectionHeader icon={X} title="Missing Keywords" variant="destructive" />
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw) => (
                        <span key={kw} className="border border-destructive/20 bg-destructive/5 text-destructive px-2.5 py-1 text-[11px] font-mono">
                          {kw}
                        </span>
                      ))}
                      {result.missingKeywords.length === 0 && (
                        <span className="text-xs font-mono text-muted-foreground">None — excellent coverage</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formatting Issues */}
                {result.formattingIssues.length > 0 && (
                  <div className="border border-border border-t-0 p-6">
                    <SectionHeader icon={AlertTriangle} title="Formatting Issues" variant="destructive" />
                    <div className="space-y-3">
                      {result.formattingIssues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 border border-destructive/10 bg-destructive/5">
                          <span className="text-[10px] font-mono text-destructive font-bold mt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-mono text-foreground/80">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div className="border border-border border-t-0 p-6">
                  <SectionHeader icon={Zap} title="Optimization Recommendations" />
                  <div className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex-shrink-0 w-7 h-7 border border-primary/30 bg-primary/5 flex items-center justify-center">
                          <span className="text-[10px] font-mono text-primary font-bold">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-foreground/80 leading-relaxed pt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ATSChecker;
