import { useEffect, useState } from "react";
import { Zap, ArrowUpRight, Loader2 } from "lucide-react";
import { getAllAnalyses, AnalysisResult } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function AIAlerts() {
  const { t } = useLanguage();
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
        <p className="text-sm text-muted-foreground">{t('no_alerts')}</p>
        <p className="text-xs text-muted-foreground/50">{t('run_analysis_desc')}</p>
      </div>
    );
  }

  return (
    <div className="ai-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{t('live_ai_alerts')}</h3>
        <span className="flex items-center gap-1 text-xs text-crimson">
          <Zap className="w-3 h-3" /> {t('real_time')}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isBuy = alert.decision === "BUY";
          const isSell = alert.decision === "SELL";
          
          // Helper to parse JSON if output is structured
          const cleanOutput = () => {
            try {
              // Remove potential markdown code blocks
              const cleaned = alert.decision_output.replace(/```json|```/g, "").trim();
              if (cleaned.startsWith("{")) {
                const parsed = JSON.parse(cleaned);
                return parsed.reasoning || parsed.insight || parsed.core_insight || alert.decision_output;
              }
              return alert.decision_output;
            } catch (e) {
              return alert.decision_output;
            }
          };
          
          return (
            <div
              key={alert.id}
              onClick={() => navigate(`/history?id=${alert.id}&symbol=${alert.symbol}`)}
              className={`p-3 rounded-lg bg-accent border transition-all duration-150 cursor-pointer group ${
                isBuy
                  ? "border-profit/30 hover:glow-profit"
                  : isSell ? "border-loss/30 hover:glow-loss" : "border-white/[0.05] hover:border-gold/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                    {(alert.symbol || "N/A").toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-tighter ${
                    isBuy ? "bg-profit/10 text-profit" : isSell ? "bg-loss/10 text-loss" : "bg-muted text-gold"
                  }`}>
                    {t(alert.decision.toLowerCase() as any) || alert.decision}
                  </span>
                </div>
                <span className="font-mono-data text-[10px] text-muted-foreground">
                  {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/90 line-clamp-2 mt-2 leading-relaxed">
                {cleanOutput()}
              </p>
              <div className="flex items-center justify-end mt-2">
                <span className="text-[10px] text-crimson flex items-center gap-0.5 hover:underline">
                  {t('view_full_report')} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
