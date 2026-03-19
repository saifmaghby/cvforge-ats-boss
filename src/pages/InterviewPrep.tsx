import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MessageSquare,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  Send,
} from "lucide-react";

interface InterviewQuestion {
  question: string;
  category: string;
  tip: string;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

type SavedCV = { id: string; name: string; cv_data: any };

const labelClass =
  "block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1";
const inputClass =
  "w-full bg-transparent border border-border focus:border-primary outline-none py-2 px-3 text-foreground font-mono text-sm transition-colors placeholder:text-muted-foreground/50";

const categoryColors: Record<string, string> = {
  behavioral: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  technical: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  situational: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "culture-fit": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  curveball: "bg-red-500/10 text-red-400 border-red-500/20",
};

const InterviewPrep = () => {
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  // Practice mode
  const [mode, setMode] = useState<"setup" | "practice">("setup");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_cvs")
      .select("id, name, cv_data")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setSavedCVs(data);
      });
  }, [user]);

  const generateQuestions = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    setGenerating(true);
    try {
      const cvData = selectedCVId
        ? savedCVs.find((c) => c.id === selectedCVId)?.cv_data
        : null;

      const { data, error } = await supabase.functions.invoke("interview-prep", {
        body: { action: "generate", jobDescription, cvData },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setQuestions(data.questions || []);
      setMode("practice");
      setCurrentIndex(0);
      setCompletedCount(0);
      setAnswer("");
      setFeedback(null);
      toast.success(`${data.questions?.length || 0} questions generated!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please write your answer first");
      return;
    }
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("interview-prep", {
        body: {
          action: "evaluate",
          question: questions[currentIndex].question,
          answer,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setFeedback(data.feedback);
      setCompletedCount((c) => c + 1);
    } catch (e: any) {
      toast.error(e.message || "Failed to evaluate answer");
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setFeedback(null);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setAnswer("");
      setFeedback(null);
    }
  };

  const backToSetup = () => {
    setMode("setup");
    setQuestions([]);
    setFeedback(null);
    setAnswer("");
  };

  const currentQ = questions[currentIndex];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-5xl">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
          AI-Powered
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter mb-8">
          Interview Prep
        </h1>

        {mode === "setup" && (
          <div className="space-y-6">
            {/* CV Selection */}
            {savedCVs.length > 0 && (
              <div>
                <label className={labelClass}>Use a saved CV (optional)</label>
                <select
                  className={inputClass}
                  value={selectedCVId}
                  onChange={(e) => setSelectedCVId(e.target.value)}
                >
                  <option value="">— No CV (JD only) —</option>
                  {savedCVs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* JD */}
            <div>
              <label className={labelClass}>Job Description *</label>
              <textarea
                className={`${inputClass} min-h-[200px]`}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <ForgeButton
              onClick={generateQuestions}
              disabled={generating || !jobDescription.trim()}
            >
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" /> Generating
                  Questions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Interview Questions
                </>
              )}
            </ForgeButton>
          </div>
        )}

        {mode === "practice" && currentQ && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={backToSetup}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                ← New Session
              </button>
              <span className="text-xs font-mono text-muted-foreground">
                {completedCount}/{questions.length} answered
              </span>
            </div>
            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(completedCount / questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question card */}
            <div className="border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    categoryColors[currentQ.category] || "bg-secondary text-foreground"
                  }`}
                >
                  {currentQ.category}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Q{currentIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className="font-display text-xl font-bold tracking-tight">
                {currentQ.question}
              </h2>

              <div className="flex items-start gap-2 bg-secondary/50 border border-border p-3">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs font-mono text-muted-foreground">
                  {currentQ.tip}
                </p>
              </div>
            </div>

            {/* Answer area */}
            {!feedback && (
              <div className="space-y-3">
                <label className={labelClass}>Your Answer</label>
                <textarea
                  className={`${inputClass} min-h-[160px]`}
                  placeholder="Type your answer here... Speak as you would in a real interview."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <ForgeButton
                  onClick={submitAnswer}
                  disabled={evaluating || !answer.trim()}
                >
                  {evaluating ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Answer
                    </>
                  )}
                </ForgeButton>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="border border-border divide-y divide-border">
                {/* Score */}
                <div className="p-5 flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl font-bold border-2 ${
                      feedback.score >= 7
                        ? "border-emerald-500 text-emerald-400"
                        : feedback.score >= 5
                        ? "border-amber-500 text-amber-400"
                        : "border-red-500 text-red-400"
                    }`}
                  >
                    {feedback.score}
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">
                      {feedback.score >= 8
                        ? "Excellent!"
                        : feedback.score >= 6
                        ? "Good effort"
                        : "Needs work"}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      Score out of 10
                    </p>
                  </div>
                </div>

                {/* Strengths */}
                <div className="p-5">
                  <p className={labelClass}>Strengths</p>
                  <ul className="space-y-1.5 mt-2">
                    {feedback.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm font-mono text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="p-5">
                  <p className={labelClass}>Areas to Improve</p>
                  <ul className="space-y-1.5 mt-2">
                    {feedback.improvements.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm font-mono text-amber-400"
                      >
                        <Target className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Model answer */}
                <div className="p-5">
                  <p className={labelClass}>Model Answer</p>
                  <p className="text-sm font-mono text-muted-foreground mt-2 leading-relaxed">
                    {feedback.modelAnswer}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
