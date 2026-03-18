import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  ExternalLink,
  CalendarIcon,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "technical",
  "offer",
  "rejected",
  "accepted",
] as const;

type Stage = (typeof STAGES)[number];

const STAGE_COLORS: Record<Stage, string> = {
  saved: "border-muted-foreground/30 text-muted-foreground",
  applied: "border-primary/40 text-primary",
  screening: "border-primary/60 text-primary",
  interview: "border-accent-foreground text-accent-foreground",
  technical: "border-accent-foreground text-accent-foreground",
  offer: "border-primary text-primary bg-primary/10",
  rejected: "border-destructive/40 text-destructive",
  accepted: "border-primary text-primary bg-primary/20",
};

interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  stage: Stage;
  url: string;
  notes: string;
  applied_date: string | null;
  deadline: string | null;
  salary_range: string;
  location: string;
  created_at: string;
  updated_at: string;
}

type FormData = {
  company: string;
  role: string;
  stage: Stage;
  url: string;
  notes: string;
  applied_date: Date | undefined;
  deadline: Date | undefined;
  salary_range: string;
  location: string;
};

const emptyForm: FormData = {
  company: "",
  role: "",
  stage: "saved",
  url: "",
  notes: "",
  applied_date: undefined,
  deadline: undefined,
  salary_range: "",
  location: "",
};

const inputClass =
  "w-full bg-transparent border-b border-border focus:border-primary outline-none py-2 text-foreground font-mono text-sm transition-colors placeholder:text-muted-foreground/50";
const labelClass =
  "block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1";

const JobTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [filterStage, setFilterStage] = useState<Stage | "all">("all");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["job_applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as JobApplication[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (f: FormData) => {
      const payload = {
        company: f.company,
        role: f.role,
        stage: f.stage,
        url: f.url,
        notes: f.notes,
        applied_date: f.applied_date ? format(f.applied_date, "yyyy-MM-dd") : null,
        deadline: f.deadline ? format(f.deadline, "yyyy-MM-dd") : null,
        salary_range: f.salary_range,
        location: f.location,
        user_id: user!.id,
      };
      if (editingId) {
        const { error } = await supabase
          .from("job_applications")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("job_applications").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_applications"] });
      toast.success(editingId ? "Application updated" : "Application added");
      closeDialog();
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_applications"] });
      toast.success("Application removed");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: Stage }) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ stage })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_applications"] });
      toast.success("Stage updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (app: JobApplication) => {
    setEditingId(app.id);
    setForm({
      company: app.company,
      role: app.role,
      stage: app.stage,
      url: app.url || "",
      notes: app.notes || "",
      applied_date: app.applied_date ? new Date(app.applied_date) : undefined,
      deadline: app.deadline ? new Date(app.deadline) : undefined,
      salary_range: app.salary_range || "",
      location: app.location || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const filtered =
    filterStage === "all"
      ? applications
      : applications.filter((a) => a.stage === filterStage);

  const stageCounts = STAGES.reduce(
    (acc, s) => {
      acc[s] = applications.filter((a) => a.stage === s).length;
      return acc;
    },
    {} as Record<Stage, number>
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
              Pipeline
            </p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter">
              Job Tracker
            </h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              {applications.length} application{applications.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ForgeButton variant="primary" onClick={openNew} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add
          </ForgeButton>
        </div>

        {/* Stage filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStage("all")}
            className={cn(
              "px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors",
              filterStage === "all"
                ? "border-primary text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            All ({applications.length})
          </button>
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border transition-colors",
                filterStage === s
                  ? STAGE_COLORS[s] + " bg-primary/5"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s} ({stageCounts[s]})
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="border border-border p-8 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Loading...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-border p-12 text-center">
            <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-mono text-sm text-muted-foreground">
              No applications yet. Click "Add" to start tracking.
            </p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <div className="col-span-3">Company / Role</div>
              <div className="col-span-2">Stage</div>
              <div className="col-span-2">Applied</div>
              <div className="col-span-2">Deadline</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-1"></div>
            </div>
            {filtered.map((app) => (
              <div
                key={app.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors group cursor-pointer"
                onClick={() => openEdit(app)}
              >
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm uppercase tracking-tight truncate">
                      {app.company}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground truncate">
                      {app.role}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 flex items-center">
                  <Popover>
                    <PopoverTrigger
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "px-2 py-1 text-[10px] font-mono uppercase tracking-widest border flex items-center gap-1",
                        STAGE_COLORS[app.stage]
                      )}
                    >
                      {app.stage}
                      <ChevronDown className="w-3 h-3" />
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1" onClick={(e) => e.stopPropagation()}>
                      {STAGES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStage.mutate({ id: app.id, stage: s })}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-xs font-mono uppercase hover:bg-secondary transition-colors",
                            app.stage === s ? "text-primary" : "text-foreground"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="col-span-2 flex items-center font-mono text-xs text-muted-foreground">
                  {app.applied_date ? format(new Date(app.applied_date), "MMM d, yyyy") : "—"}
                </div>
                <div className="col-span-2 flex items-center font-mono text-xs text-muted-foreground">
                  {app.deadline ? format(new Date(app.deadline), "MMM d, yyyy") : "—"}
                </div>
                <div className="col-span-2 flex items-center font-mono text-xs text-muted-foreground truncate">
                  {app.location || "—"}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-primary transition-colors p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove.mutate(app.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-tight">
              {editingId ? "Edit Application" : "New Application"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company *</label>
                <input
                  className={inputClass}
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Google, Vodafone..."
                />
              </div>
              <div>
                <label className={labelClass}>Role *</label>
                <input
                  className={inputClass}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Senior Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stage</label>
                <select
                  className={cn(inputClass, "cursor-pointer")}
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="bg-background">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Cairo, Remote..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Applied Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        inputClass,
                        "flex items-center justify-between text-left",
                        !form.applied_date && "text-muted-foreground/50"
                      )}
                    >
                      {form.applied_date ? format(form.applied_date, "MMM d, yyyy") : "Pick date"}
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.applied_date}
                      onSelect={(d) => setForm({ ...form, applied_date: d })}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className={labelClass}>Deadline</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        inputClass,
                        "flex items-center justify-between text-left",
                        !form.deadline && "text-muted-foreground/50"
                      )}
                    >
                      {form.deadline ? format(form.deadline, "MMM d, yyyy") : "Pick date"}
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.deadline}
                      onSelect={(d) => setForm({ ...form, deadline: d })}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Salary Range</label>
                <input
                  className={inputClass}
                  value={form.salary_range}
                  onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
                  placeholder="15-20K EGP"
                />
              </div>
              <div>
                <label className={labelClass}>Job URL</label>
                <input
                  className={inputClass}
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                className={cn(inputClass, "min-h-[60px] resize-y")}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Recruiter name, prep notes..."
              />
            </div>

            <ForgeButton
              variant="primary"
              className="w-full mt-4"
              onClick={() => {
                if (!form.company.trim() || !form.role.trim()) {
                  toast.error("Company and Role are required");
                  return;
                }
                upsert.mutate(form);
              }}
            >
              {editingId ? "Update" : "Add Application"}
            </ForgeButton>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default JobTracker;
