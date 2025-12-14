import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";

interface Analysis {
  id: string;
  idea: string;
  analysis: {
    summary: string;
    viabilityScore: number;
    marketPotential: string;
  };
  created_at: string;
}

const History = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [fetching, setFetching] = useState(true);

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
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
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
    </div>
  );
};

export default History;
