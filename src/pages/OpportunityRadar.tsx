import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Zap, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { AISignalCard, type SignalData } from "@/components/dashboard/AISignalCard";
import { TradePlanModal } from "@/components/dashboard/TradePlanModal";
import { AIDecisionStrip } from "@/components/dashboard/AIDecisionStrip";
import { motion, AnimatePresence } from "framer-motion";
import { getAllAnalyses } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_BASE_URL } from "@/lib/api-config";
import { toast } from "sonner";

const OpportunityRadar = () => {
  const { t, language } = useLanguage();
  const [opportunities, setOpportunities] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<SignalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    signal: "All",
    minConfidence: 0,
    risk: "All"
  });

  useEffect(() => {
    async function loadRadar() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/radar/history?limit=20&lang=${language}`);
        const json = await res.json();
        
        if (!json.success) {
          throw new Error(json.error?.message || "Failed to fetch radar data");
        }
        
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
      } catch (error) {
        console.error("[Radar] Load Error:", error);
        toast.error(t('syncing_radar') + " failed");
      } finally {
        setLoading(false);
      }
    }
    loadRadar();
  }, [language]);

  const handleViewTradePlan = (data: SignalData) => {
    setSelectedSignal(data);
    setModalOpen(true);
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const signalMatch = activeFilters.signal === "All" || opp.signal === activeFilters.signal;
    const confidenceMatch = opp.confidence >= activeFilters.minConfidence;
    const riskMatch = activeFilters.risk === "All" || opp.risk === activeFilters.risk;
    return signalMatch && confidenceMatch && riskMatch;
  });

  const highConfCount = filteredOpportunities.filter(o => o.confidence > 85).length;

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
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                showFilters ? "bg-gold text-black border-gold" : "border-border text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold)/0.3)]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> {t('filters')}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ai-card p-4 flex flex-wrap items-center gap-6 bg-accent/20 border-gold/10">
                {/* Signal Filter */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('signal')}</span>
                  <div className="flex bg-background/50 p-1 rounded-lg border border-white/5">
                    {["All", "BUY", "SELL", "HOLD"].map((sig) => (
                      <button
                        key={sig}
                        onClick={() => setActiveFilters(prev => ({ ...prev, signal: sig }))}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                          activeFilters.signal === sig ? "bg-gold text-black" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {sig === "All" ? t('all') : t(sig.toLowerCase() as any)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidence Filter */}
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('min_confidence')}</span>
                    <span className="text-[10px] font-mono font-bold text-gold">{activeFilters.minConfidence}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="5"
                    value={activeFilters.minConfidence}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))}
                    className="w-full accent-gold h-1.5 bg-background rounded-lg cursor-pointer"
                  />
                </div>

                {/* Risk Filter */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('risk_label')}</span>
                  <div className="flex gap-2">
                    {["All", "Low", "Medium", "High"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setActiveFilters(prev => ({ ...prev, risk: r }))}
                        className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                          activeFilters.risk === r 
                            ? "bg-white/10 border-gold/30 text-gold" 
                            : "border-white/5 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                         {r === "All" ? t('all') : t(r.toLowerCase() as any)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Button */}
                <button
                  onClick={() => setActiveFilters({ signal: "All", minConfidence: 0, risk: "All" })}
                  className="ml-auto text-[10px] font-bold text-loss hover:underline"
                >
                  {t('clear_filters')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                { label: t('active_signals'), value: filteredOpportunities.length.toString(), color: "text-foreground" },
                { label: t('high_confidence'), value: highConfCount.toString(), color: "text-gold" },
                { label: t('avg_expected_move'), value: filteredOpportunities.length > 0 ? `+${(filteredOpportunities.reduce<number>((acc, curr) => acc + (curr.expectedMove || 0), 0) / filteredOpportunities.length).toFixed(1)}%` : "0%", color: "text-profit" },
                { label: t('best_signal'), value: filteredOpportunities.length > 0 ? filteredOpportunities.reduce((a, b) => a.confidence > b.confidence ? a : b).stock : "None", color: "text-[hsl(var(--crimson))]" },
              ].map((stat, i) => (
                <div key={i} className="ai-card p-4 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">{stat.label}</span>
                  <span className={`font-mono-data text-xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            {filteredOpportunities.length === 0 ? (
               <div className="ai-card p-12 text-center text-muted-foreground mt-4">
                {t('no_signals_detected')}
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
                {filteredOpportunities.map((opp, i) => (
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
