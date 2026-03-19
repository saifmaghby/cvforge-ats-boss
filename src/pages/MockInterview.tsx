import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Mic,
  Send,
  Sparkles,
  User,
  Bot,
  RotateCcw,
  Trophy,
  Target,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Code,
  Users,
  Shuffle,
  ChevronDown,
} from "lucide-react";

type Message = { role: "user" | "assistant" | "system"; content: string };
type InterviewType = "mixed" | "technical" | "behavioral" | "hr";
type Language = "english" | "arabic";

interface Evaluation {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  topStrengths: string[];
  areasToImprove: string[];
  detailedFeedback: string;
  hireRecommendation: string;
}

type SavedCV = { id: string; name: string; cv_data: any };

const MOCK_INTERVIEW_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`;

async function streamResponse({
  body,
  onDelta,
  onDone,
}: {
  body: Record<string, any>;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(MOCK_INTERVIEW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Request failed (${resp.status})`);
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const interviewTypes: { id: InterviewType; label: string; icon: typeof Shuffle; desc: string }[] = [
  { id: "mixed", label: "Mixed", icon: Shuffle, desc: "Behavioral + Technical + HR" },
  { id: "technical", label: "Technical", icon: Code, desc: "Coding, system design, problem-solving" },
  { id: "behavioral", label: "Behavioral", icon: Users, desc: "STAR method, teamwork, leadership" },
  { id: "hr", label: "HR / Cultural", icon: Briefcase, desc: "Salary, goals, cultural fit" },
];

const recommendationColors: Record<string, string> = {
  "Strong Hire": "text-emerald-400 border-emerald-500",
  "Hire": "text-emerald-400 border-emerald-500",
  "Leaning Hire": "text-amber-400 border-amber-500",
  "Leaning No Hire": "text-orange-400 border-orange-500",
  "No Hire": "text-red-400 border-red-500",
};

const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1";
const inputClass = "w-full bg-transparent border border-border focus:border-primary outline-none py-2 px-3 text-foreground font-mono text-sm transition-colors placeholder:text-muted-foreground/50";

const MockInterview = () => {
  const { user } = useAuth();
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("mixed");
  const [language, setLanguage] = useState<Language>("english");

  const [mode, setMode] = useState<"setup" | "interview" | "results">("setup");
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayMessages, setDisplayMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const systemPromptRef = useRef<string>("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isStreaming]);

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

  const startInterview = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    const cvData = selectedCVId ? savedCVs.find((c) => c.id === selectedCVId)?.cv_data : null;

    const langInstruction = language === "arabic"
      ? "Conduct the interview primarily in Arabic (Egyptian dialect when appropriate), but technical terms can be in English."
      : "Conduct the interview in English.";

    const typeInstruction = interviewType === "technical"
      ? "Focus heavily on technical questions, coding scenarios, system design, and problem-solving."
      : interviewType === "behavioral"
      ? "Focus on behavioral questions using the STAR method, teamwork, leadership, and conflict resolution."
      : interviewType === "hr"
      ? "Focus on HR-style questions: salary expectations, career goals, strengths/weaknesses, cultural fit, and workplace scenarios."
      : "Mix behavioral, technical, and HR questions naturally.";

    const cvText = cvData
      ? `\nCandidate CV:\nName: ${cvData.personal?.fullName || ""}\nTitle: ${cvData.personal?.title || ""}\nSummary: ${cvData.summary || ""}\nSkills: ${(cvData.skills || []).join(", ")}\nExperience: ${(cvData.experience || []).map((e: any) => `${e.role} at ${e.company}`).join(" | ")}`
      : "";

    const systemPrompt = `You are an experienced interviewer at a top company in the MENA region (Egypt/Gulf). You are conducting a realistic job interview.

${langInstruction}
${typeInstruction}

Job Description:
${jobDescription}
${cvText}

INTERVIEW RULES:
1. Start with a warm professional greeting and introduce yourself briefly (make up a realistic name and title)
2. Ask ONE question at a time - never multiple questions
3. After the candidate answers, provide brief acknowledgment, then ask the next question
4. Include questions commonly asked in Egyptian/MENA interviews (e.g., military service status for males, availability to travel, willingness to relocate within Gulf countries)
5. Be professional but natural - use conversational language
6. After 6-8 questions, wrap up the interview naturally
7. When wrapping up, ask "Do you have any questions for us?"
8. Keep responses concise - this is a conversation, not a lecture

IMPORTANT: Stay in character as the interviewer throughout. Do NOT break character or provide tips/coaching during the interview.`;

    systemPromptRef.current = systemPrompt;

    setMode("interview");
    setDisplayMessages([]);
    setMessages([]);
    setQuestionCount(0);
    setIsStreaming(true);

    const initialMessages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Please begin the interview." },
    ];

    let assistantText = "";

    try {
      await streamResponse({
        body: { action: "start", jobDescription, cvData, interviewType, language },
        onDelta: (chunk) => {
          assistantText += chunk;
          setDisplayMessages([{ role: "assistant", content: assistantText }]);
        },
        onDone: () => {
          const fullMessages: Message[] = [
            ...initialMessages,
            { role: "assistant", content: assistantText },
          ];
          setMessages(fullMessages);
          setQuestionCount(1);
          setIsStreaming(false);
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to start interview");
      setMode("setup");
      setIsStreaming(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput("");
    setIsStreaming(true);

    const newDisplayMessages = [...displayMessages, { role: "user" as const, content: userMsg }];
    setDisplayMessages(newDisplayMessages);

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];

    let assistantText = "";

    try {
      await streamResponse({
        body: { action: "respond", messages: newMessages },
        onDelta: (chunk) => {
          assistantText += chunk;
          setDisplayMessages([
            ...newDisplayMessages,
            { role: "assistant", content: assistantText },
          ]);
        },
        onDone: () => {
          const fullMessages: Message[] = [
            ...newMessages,
            { role: "assistant", content: assistantText },
          ];
          setMessages(fullMessages);
          setQuestionCount((c) => c + 1);
          setIsStreaming(false);
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
      setIsStreaming(false);
    }
  };

  const endInterview = async () => {
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("mock-interview", {
        body: { action: "evaluate", messages },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEvaluation(data.evaluation);
      setMode("results");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate evaluation");
    } finally {
      setEvaluating(false);
    }
  };

  const resetInterview = () => {
    setMode("setup");
    setMessages([]);
    setDisplayMessages([]);
    setEvaluation(null);
    setInput("");
    setQuestionCount(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const ScoreRing = ({ score, label, size = "md" }: { score: number; label: string; size?: "sm" | "md" }) => {
    const radius = size === "md" ? 40 : 28;
    const stroke = size === "md" ? 6 : 4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const svgSize = (radius + stroke) * 2;
    const color = score >= 75 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500";
    const textColor = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";

    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
          <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" className={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <span className={`font-display text-lg font-bold ${textColor} -mt-${size === "md" ? "12" : "9"}`} style={{ marginTop: size === "md" ? "-52px" : "-38px" }}>{score}</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground" style={{ marginTop: size === "md" ? "18px" : "10px" }}>{label}</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-5xl h-full flex flex-col">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
          AI-Powered
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter mb-6">
          Mock Interview
        </h1>

        {/* ─── SETUP ─── */}
        {mode === "setup" && (
          <div className="space-y-6">
            {/* Interview Type */}
            <div>
              <label className={labelClass}>Interview Type</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {interviewTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setInterviewType(t.id)}
                    className={`border p-3 text-left transition-all ${
                      interviewType === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <t.icon className={`h-4 w-4 mb-1.5 ${interviewType === t.id ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-mono text-xs font-medium">{t.label}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className={labelClass}>Language</label>
              <div className="flex gap-2">
                {(["english", "arabic"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`border px-4 py-2 font-mono text-xs transition-all ${
                      language === l
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    {l === "english" ? "🇬🇧 English" : "🇪🇬 عربي"}
                  </button>
                ))}
              </div>
            </div>

            {/* CV Selection */}
            {savedCVs.length > 0 && (
              <div>
                <label className={labelClass}>Use a saved CV (optional)</label>
                <select className={inputClass} value={selectedCVId} onChange={(e) => setSelectedCVId(e.target.value)}>
                  <option value="">— No CV —</option>
                  {savedCVs.map((cv) => (
                    <option key={cv.id} value={cv.id}>{cv.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* JD */}
            <div>
              <label className={labelClass}>Job Description *</label>
              <textarea
                className={`${inputClass} min-h-[180px]`}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <ForgeButton onClick={startInterview} disabled={!jobDescription.trim()}>
              <MessageSquare className="h-4 w-4" /> Start Mock Interview
            </ForgeButton>
          </div>
        )}

        {/* ─── INTERVIEW CHAT ─── */}
        {mode === "interview" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header bar */}
            <div className="flex items-center justify-between border border-border p-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">
                  Interview in progress · Q{questionCount}
                </span>
              </div>
              <button
                onClick={endInterview}
                disabled={evaluating || isStreaming || displayMessages.length < 3}
                className="text-xs font-mono text-primary hover:text-primary/80 disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                {evaluating ? (
                  <><Sparkles className="h-3 w-3 animate-spin" /> Evaluating...</>
                ) : (
                  <><Trophy className="h-3 w-3" /> End & Get Results</>
                )}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1 pb-4">
              {displayMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] border p-4 ${
                    msg.role === "assistant"
                      ? "border-border bg-secondary/30"
                      : "border-primary/20 bg-primary/5"
                  }`}>
                    <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isStreaming && displayMessages.length === 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="border border-border bg-secondary/30 p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border border-border p-3 flex gap-2 items-end mt-2">
              <textarea
                ref={inputRef}
                className="flex-1 bg-transparent outline-none font-mono text-sm resize-none min-h-[40px] max-h-[120px] placeholder:text-muted-foreground/50"
                placeholder={language === "arabic" ? "اكتب إجابتك هنا..." : "Type your answer here..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="p-2 text-primary hover:text-primary/80 disabled:opacity-30 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── RESULTS ─── */}
        {mode === "results" && evaluation && (
          <div className="space-y-6">
            {/* Recommendation badge */}
            <div className="flex items-center justify-between border border-border p-5">
              <div>
                <p className={labelClass}>Hiring Recommendation</p>
                <p className={`font-display text-2xl font-bold mt-1 ${recommendationColors[evaluation.hireRecommendation] || "text-foreground"}`}>
                  {evaluation.hireRecommendation}
                </p>
              </div>
              <ScoreRing score={evaluation.overallScore} label="Overall" size="md" />
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border p-4 flex flex-col items-center">
                <ScoreRing score={evaluation.communicationScore} label="Communication" size="sm" />
              </div>
              <div className="border border-border p-4 flex flex-col items-center">
                <ScoreRing score={evaluation.technicalScore} label="Technical" size="sm" />
              </div>
              <div className="border border-border p-4 flex flex-col items-center">
                <ScoreRing score={evaluation.confidenceScore} label="Confidence" size="sm" />
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-border p-5">
                <p className={labelClass}>Top Strengths</p>
                <ul className="space-y-2 mt-3">
                  {evaluation.topStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-mono">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-border p-5">
                <p className={labelClass}>Areas to Improve</p>
                <ul className="space-y-2 mt-3">
                  {evaluation.areasToImprove.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-mono">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed feedback */}
            <div className="border border-border p-5">
              <p className={labelClass}>Detailed Coaching Feedback</p>
              <p className="text-sm font-mono text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap">
                {evaluation.detailedFeedback}
              </p>
            </div>

            <ForgeButton onClick={resetInterview}>
              <RotateCcw className="h-4 w-4" /> Start New Interview
            </ForgeButton>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
