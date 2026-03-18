import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ForgeButton from "@/components/ForgeButton";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink, Check, X, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface SavedPortfolio {
  id: string;
  name: string;
  template: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const MyPortfolios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as SavedPortfolio[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const slug = "portfolio-" + Date.now().toString(36);
      const { data, error } = await supabase
        .from("portfolios")
        .insert([{ user_id: user!.id, name: "Untitled Portfolio", slug, portfolio_data: {} }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      navigate(`/portfolio/builder?id=${data.id}`);
    },
    onError: () => toast.error("Failed to create portfolio"),
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("portfolios").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      setEditingId(null);
      toast.success("Renamed");
    },
    onError: () => toast.error("Failed to rename"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast.success("Deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const startRename = (p: SavedPortfolio) => {
    setEditingId(p.id);
    setEditName(p.name);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      renameMutation.mutate({ id: editingId, name: editName.trim() });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">
              Showcase
            </p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold uppercase tracking-tighter">
              My Portfolios
            </h1>
          </div>
          <ForgeButton variant="primary" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            New Portfolio
          </ForgeButton>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground font-mono text-sm">Loading…</div>
        ) : portfolios.length === 0 ? (
          <div className="border border-border p-12 text-center">
            <p className="text-muted-foreground font-mono text-sm mb-4">
              No portfolios yet. Create your first one.
            </p>
            <ForgeButton variant="primary" onClick={() => createMutation.mutate()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </ForgeButton>
          </div>
        ) : (
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Name</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Template</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest">Updated</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolios.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm font-mono"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmRename();
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                          <button onClick={confirmRename} className="text-primary hover:text-primary/80"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <span className="font-mono text-sm font-medium">{p.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 border border-border">
                        {p.template}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${p.is_published ? "border-primary/30 text-primary bg-primary/5" : "border-border text-muted-foreground"}`}>
                        {p.is_published ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {format(new Date(p.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/portfolio/builder?id=${p.id}`)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button onClick={() => startRename(p)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Rename">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{p.name}"? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(p.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyPortfolios;
