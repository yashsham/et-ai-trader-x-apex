import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Zap, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { AISignalCard, type SignalData } from "@/components/dashboard/AISignalCard";
import { TradePlanModal } from "@/components/dashboard/TradePlanModal";
import { AIDecisionStrip } from "@/components/dashboard/AIDecisionStrip";
import { motion } from "framer-motion";
import { getAllAnalyses } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const OpportunityRadar = () => {
  const { t } = useLanguage();
  const [opportunities, setOpportunities] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<SignalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadRadar() {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/radar/history?limit=20&lang=${language}`);
      const json = await res.json();
      const results = json.data || [];
      
      // Map Supabase AnalysisResult to the Frontend SignalData structure
      const mapped: SignalData[] = results.map((r, index) => {
        let confidence = 50;
        let risk = "Medium";
        if (r.decision === "BUY") { confidence = 85 + (index % 10); risk = "High"; }
        if (r.decision === "HOLD") { confidence = 60 + (index % 15); risk = "Medium"; }
        if (r.decision === "SELL") { confidence = 75 + (index % 20); risk = "Low"; }

        // Attempt to parse dynamic trade parameters from AI output
        let entryZone = "Live";
        let target = "Analyze...";
        let stopLoss = "Protect...";
        let cleanExplanation = r.decision_output || "Analyze further.";

        try {
          if (r.decision_output) {
            // Support Markdown code blocks or raw JSON
            const jsonText = r.decision_output.match(/\{[\s\S]*\}/)?.[0] || r.decision_output;
            const parsed = JSON.parse(jsonText);
            
            entryZone = parsed.entry || parsed.entry_zone || entryZone;
            target = parsed.target || target;
            stopLoss = parsed.stop_loss || parsed.stopLoss || stopLoss;
            
            // If the explanation was just a JSON dump, use a cleaner version if reasoning exists
            if (parsed.reasoning) {
              cleanExplanation = parsed.reasoning;
            }
          }
        } catch (e) {
          console.warn("[Radar] Failed to parse AI output for:", r.symbol);
        }

        return {
          id: index + 1,
          stock: r.symbol,
          sector: "AI Tracked",
          signal: r.decision,
          confidence: confidence,
          expectedMove: 5.0 + (Number(r.id) % 5),
          price: entryZone, // Display entry zone as price on card
          volume: "Avg",
          risk: risk as "Low" | "Medium" | "High",
          explanation: cleanExplanation,
          entryZone,
          target,
          stopLoss
        };
      });

      setOpportunities(mapped);
      setLoading(false);
    }
    loadRadar();
  }, []);

  const handleViewTradePlan = (data: SignalData) => {
    setSelectedSignal(data);
    setModalOpen(true);
  };

  const highConfCount = opportunities.filter(o => o.confidence > 85).length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <AIDecisionStrip />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{t('radar')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('radar_desc')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--crimson)/0.12)] text-[hsl(var(--crimson))]"
            >
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold">{highConfCount} {t('high_confidence')}</span>
            </motion.div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold)/0.3)] transition-all">
              <SlidersHorizontal className="w-3.5 h-3.5" /> {t('filters')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ai-card p-12 flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50 mb-4" />
             <p className="text-sm text-muted-foreground">{t('syncing_radar')}</p>
          </div>
        ) : (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: t('active_signals'), value: opportunities.length.toString(), color: "text-foreground" },
                { label: t('high_confidence'), value: highConfCount.toString(), color: "text-gold" },
                { label: t('avg_expected_move'), value: opportunities.length > 0 ? `+${(opportunities.reduce<number>((acc, curr) => acc + (curr.expectedMove || 0), 0) / opportunities.length).toFixed(1)}%` : "0%", color: "text-profit" },
                { label: t('best_signal'), value: opportunities.length > 0 ? opportunities.reduce((a, b) => a.confidence > b.confidence ? a : b).stock : "None", color: "text-[hsl(var(--crimson))]" },
              ].map((stat, i) => (
                <div key={i} className="ai-card p-4 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">{stat.label}</span>
                  <span className={`font-mono-data text-xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            {opportunities.length === 0 ? (
               <div className="ai-card p-12 text-center text-muted-foreground mt-4">
                {t('no_signals_detected')}
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
                {opportunities.map((opp, i) => (
                  <AISignalCard
                    key={opp.id}
                    data={opp}
                    onViewTradePlan={handleViewTradePlan}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <TradePlanModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        data={selectedSignal}
      />
    </AppLayout>
  );
};

export default OpportunityRadar;
