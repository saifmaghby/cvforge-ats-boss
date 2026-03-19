import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeCVData } from "@/types/cv";
import { toast } from "sonner";
import { Search, ExternalLink, Lightbulb, Loader2, Sparkles, Globe } from "lucide-react";

interface SearchQuery {
  label: string;
  url: string;
}

interface Board {
  name: string;
  icon: string;
  queries: SearchQuery[];
}

interface JobSearchResult {
  recommendedTitle: string;
  summary: string;
  boards: Board[];
  tips: string[];
}

const JobSearch = () => {
  const { user } = useAuth();
  const [savedCVs, setSavedCVs] = useState<{ id: string; name: string }[]>([]);
  const [selectedCV, setSelectedCV] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobSearchResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_cvs")
      .select("id, name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) setSavedCVs(data);
      });
  }, [user]);

  const handleSearch = async () => {
    if (!selectedCV) {
      toast.error("Please select a CV first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data: cvRow } = await supabase
        .from("saved_cvs")
        .select("cv_data")
        .eq("id", selectedCV)
        .single();

      if (!cvRow) {
        toast.error("CV not found");
        return;
      }

      const cvData = normalizeCVData(cvRow.cv_data);
      const { data, error } = await supabase.functions.invoke("job-search", {
        body: { cvData },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      toast.success("Search links generated!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate search links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight flex items-center gap-2">
            <Search className="h-7 w-7 text-primary" />
            Smart Job Search
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            AI generates personalized search links to top job boards based on your CV
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCV} onValueChange={setSelectedCV}>
                <SelectTrigger className="flex-1 font-mono text-sm">
                  <SelectValue placeholder="Select a saved CV" />
                </SelectTrigger>
                <SelectContent>
                  {savedCVs.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id} className="font-mono text-sm">
                      {cv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} disabled={loading || !selectedCV} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Generating..." : "Find Jobs"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-mono text-sm font-medium text-primary">
                      Recommended Title: {result.recommendedTitle}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Boards */}
            {result.boards.map((board) => (
              <Card key={board.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <span className="text-xl">{board.icon}</span>
                    {board.name}
                    <Badge variant="secondary" className="ml-auto font-mono text-xs">
                      {board.queries.length} searches
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {board.queries.map((query, i) => (
                    <a
                      key={i}
                      href={query.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent transition-colors group"
                    >
                      <span className="text-sm font-mono text-foreground group-hover:text-primary transition-colors">
                        {query.label}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 ml-3 transition-colors" />
                    </a>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Tips */}
            {result.tips.length > 0 && (
              <>
                <Separator />
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Job Search Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground font-mono flex items-start gap-2">
                          <span className="text-primary font-bold mt-px">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-mono text-sm">
                Select a CV and click "Find Jobs" to generate personalized search links
              </p>
              <p className="text-muted-foreground/60 font-mono text-xs mt-1">
                Links to Wuzzuf, LinkedIn Jobs & Bayt.com
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobSearch;
