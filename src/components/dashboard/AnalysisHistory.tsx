import { useEffect, useState } from "react";
import { getAllAnalyses, AnalysisResult } from "@/lib/supabase";
import { History, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const data = await getAllAnalyses(20);
      setHistory(data);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'BUY': return 'text-profit border-profit/30 bg-profit/10';
      case 'SELL': return 'text-loss border-loss/30 bg-loss/10';
      default: return 'text-gold border-gold/30 bg-gold/10';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'BUY': return <TrendingUp className="w-3 h-3" />;
      case 'SELL': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <div className="ai-card p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-gold" />
          <h3 className="font-display font-bold text-lg text-white">Analysis History</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Activity className="w-6 h-6 text-gold animate-pulse" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm opacity-60">
            <History className="w-8 h-8 mb-2 opacity-20" />
            No past analyses found.<br />Run a scan to generate history!
          </div>
        ) : (
          history.map((record) => (
            <div key={record.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex flex-col">
                  <span className="font-black text-lg text-white tracking-widest leading-none">{record.symbol}</span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-1">
                    {new Date(record.created_at).toLocaleString()}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-md border flex items-center gap-1 font-black text-[10px] uppercase tracking-wider ${getDecisionColor(record.decision)}`}>
                  {getDecisionIcon(record.decision)} {record.decision}
                </div>
              </div>
              
              <div className="relative z-10 text-sm text-foreground/80 line-clamp-3 font-mono-data opacity-80 group-hover:opacity-100 transition-opacity">
                {record.decision_output}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
