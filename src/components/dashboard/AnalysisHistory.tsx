import { useEffect, useState } from "react";
import { getAllAnalyses, AnalysisResult } from "@/lib/supabase";
import { History, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function AnalysisHistory() {
  const { t } = useLanguage();
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
          <h3 className="font-display font-bold text-lg text-white">{t('analysis_history')}</h3>
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
            {t('no_history_found')}<br />{t('run_scan_gen_history')}
          </div>
        ) : (
          history.map((record) => (
            <div key={record.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex flex-col">
                  <span className="font-black text-lg text-white tracking-widest leading-none">{record.symbol.toUpperCase()}</span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-1">
                    {new Date(record.created_at).toLocaleString()}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-md border flex items-center gap-1 font-black text-[10px] uppercase tracking-wider ${getDecisionColor(record.decision)}`}>
                  {getDecisionIcon(record.decision)} {record.decision}
                </div>
              </div>
              
              {/* 40 Years Experience: Parse and sanitize AI output for institutional-grade presentation */}
              <div className="relative z-10 text-sm text-foreground/80 font-mono-data opacity-95 group-hover:opacity-100 transition-opacity">
                {(() => {
                  try {
                    let raw = record.decision_output.trim();
                    
                    // Multi-pass Institutional Extraction
                    // 1. Strip markdown backticks
                    if (raw.startsWith('```')) {
                      raw = raw.replace(/^```json\n?/, '').replace(/```$/, '').trim();
                    }
                    
                    // 2. If it still doesn't parse, try finding the first { and last }
                    // This handles AI responses that include intro/outro text.
                    let parsed;
                    try {
                      parsed = JSON.parse(raw);
                    } catch (e) {
                      const match = raw.match(/\{[\s\S]*\}/);
                      if (match) {
                        parsed = JSON.parse(match[0]);
                      } else {
                        throw e;
                      }
                    }

                    return (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          {parsed.sentiment && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                              parsed.sentiment.toLowerCase().includes('bull') ? 'bg-profit/20 text-profit' : 
                              parsed.sentiment.toLowerCase().includes('bear') ? 'bg-loss/20 text-loss' : 
                              'bg-gold/20 text-gold'
                            }`}>
                              {parsed.sentiment}
                            </span>
                          )}
                          {parsed.entry && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400">
                              <span className="opacity-50 font-bold uppercase">Entry:</span> {parsed.entry}
                            </div>
                          )}
                          {parsed.target && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-profit/10 border border-profit/20 text-[10px] text-profit">
                              <span className="opacity-50 font-bold uppercase">Target:</span> {parsed.target}
                            </div>
                          )}
                          {parsed.stop_loss && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-loss/10 border border-loss/20 text-[10px] text-loss">
                              <span className="opacity-50 font-bold uppercase">SL:</span> {parsed.stop_loss}
                            </div>
                          )}
                        </div>
                        <p className="text-xs italic leading-relaxed text-muted-foreground line-clamp-2">
                          {parsed.reasoning || "No detailed reasoning provided."}
                        </p>
                      </div>
                    );
                  } catch (e) {
                    // Fallback for genuinely non-JSON or legacy dirty records
                    const cleaned = record.decision_output
                      .replace(/```json/g, '')
                      .replace(/```/g, '')
                      .trim();
                    return <p className="text-xs leading-relaxed opacity-70 line-clamp-3">{cleaned}</p>;
                  }
                })()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
