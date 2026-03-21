import { useEffect, useState } from "react";
import { Brain, Zap, ArrowRight, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface SummaryData {
  summary: string;
  priority_action: string;
  highlight_section: string;
  timestamp: string;
}

export function ExecutiveSummaryCard() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/summary?lang=${language}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard summary", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [language]);

  if (loading) {
    return (
      <div className="ai-card p-8 flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50 mb-3" />
        <p className="text-xs text-muted-foreground animate-pulse font-mono tracking-widest uppercase">
          Synthesizing Intelligence...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ai-card overflow-hidden border-gold/30 hover:border-gold/50 transition-colors shadow-[0_0_40px_-15px_rgba(212,163,47,0.2)]"
    >
      <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-6 border-b border-gold/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
              <Brain className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('ai_intelligence')}</h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Executive Focus · {data.highlight_section}</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-profit/10 border border-profit/20 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span className="text-[10px] font-bold text-profit uppercase">Active</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative mb-6">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gold/30 rounded-full" />
          <p className="text-base text-foreground font-medium leading-relaxed italic pl-2">
            "{data.summary}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Priority Action</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-crimson fill-crimson" />
              <span className="text-sm font-black text-white tracking-widest">{data.priority_action}</span>
            </div>
          </div>
          <motion.button
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest hover:text-white transition-colors"
          >
            Review Insights <ArrowRight className="w-3 h-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
