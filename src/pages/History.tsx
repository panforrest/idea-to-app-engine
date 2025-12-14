import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, TrendingUp, Target, Lightbulb, AlertTriangle, X } from "lucide-react";

interface AnalysisDetail {
  summary: string;
  viabilityScore: number;
  marketPotential: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  targetAudience: string;
  competitiveAdvantage: string;
  revenueModel: string;
  nextSteps: string[];
}

interface Analysis {
  id: string;
  idea: string;
  analysis: AnalysisDetail;
  created_at: string;
}

const History = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Analysis | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });
    
    setAnalyses((data as unknown as Analysis[]) || []);
    setFetching(false);
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Analysis History</h1>
        </div>

        {analyses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No analyses yet.</p>
            <Button onClick={() => navigate("/")}>Analyze Your First Idea</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.idea}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.analysis.summary}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-primary">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-bold">{item.analysis.viabilityScore}/100</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selected?.idea}</DialogTitle>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-6 mt-4">
              {/* Score */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Viability Score</p>
                  <p className="text-2xl font-bold text-primary">{selected.analysis.viabilityScore}/100</p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-muted-foreground">{selected.analysis.summary}</p>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-green-500" /> Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {selected.analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              {/* Challenges */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> Challenges
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {selected.analysis.challenges?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              {/* Target & Revenue */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Target Audience</p>
                  <p className="font-medium">{selected.analysis.targetAudience}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Revenue Model</p>
                  <p className="font-medium">{selected.analysis.revenueModel}</p>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Next Steps
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {selected.analysis.nextSteps?.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
