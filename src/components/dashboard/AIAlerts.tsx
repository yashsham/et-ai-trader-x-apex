import { useEffect, useState } from "react";
import { Zap, ArrowUpRight, Loader2 } from "lucide-react";
import { getAllAnalyses, AnalysisResult } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export function AIAlerts() {
  const [alerts, setAlerts] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAlerts() {
      // Fetch latest 4 analysis results globally
      const data = await getAllAnalyses(4);
      setAlerts(data);
      setLoading(false);
    }
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="ai-card p-6 min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
      </div>
    );
  }

  // Fallback if no data
  if (alerts.length === 0) {
    return (
      <div className="ai-card p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
        <Zap className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No recent AI alerts.</p>
        <p className="text-xs text-muted-foreground/50">Run an analysis to generate alerts.</p>
      </div>
    );
  }

  return (
    <div className="ai-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Live AI Alerts</h3>
        <span className="flex items-center gap-1 text-xs text-crimson">
          <Zap className="w-3 h-3" /> Real-time
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isBuy = alert.decision === "BUY";
          const isSell = alert.decision === "SELL";
          
          return (
            <div
              key={alert.id}
              onClick={() => navigate(`/history`)}
              className={`p-3 rounded-lg bg-accent border transition-all duration-150 cursor-pointer ${
                isBuy
                  ? "border-profit/30 hover:glow-profit"
                  : isSell ? "border-loss/30 hover:glow-loss" : "border-white/[0.05] hover:border-gold/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-sm font-bold text-foreground">
                    {alert.symbol}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isBuy ? "bg-profit/10 text-profit" : isSell ? "bg-loss/10 text-loss" : "bg-muted text-gold"
                  }`}>
                    {alert.decision}
                  </span>
                </div>
                <span className="font-mono-data text-xs text-gold font-semibold">
                  {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{alert.decision_output}</p>
              <div className="flex items-center justify-end mt-2">
                <span className="text-[10px] text-crimson flex items-center gap-0.5 hover:underline">
                  View full report <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
