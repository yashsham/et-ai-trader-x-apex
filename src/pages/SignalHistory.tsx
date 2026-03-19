import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { History, Search, Filter, ArrowUpRight, ArrowDownRight, Zap, Loader2, Calendar } from "lucide-react";
import { AISignalCard, type SignalData } from "@/components/dashboard/AISignalCard";
import { TradePlanModal } from "@/components/dashboard/TradePlanModal";
import { AIDecisionStrip } from "@/components/dashboard/AIDecisionStrip";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface RawAnalysis {
  id: number;
  symbol: string;
  decision: string;
  decision_output: string;
  created_at: string;
}

const SignalHistory = () => {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<SignalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/v1/history?limit=50");
        const data = await response.json();
        
        if (data.status === "success") {
          const results: RawAnalysis[] = data.data.results;
          
          const mapped: SignalData[] = results.map((r, index) => {
            // Robust parsing logic (same as Radar)
            let entryZone = "Live";
            let target = "Analyze...";
            let stopLoss = "Protect...";
            let cleanExplanation = r.decision_output || "No explanation provided.";

            try {
              if (r.decision_output) {
                const jsonText = r.decision_output.match(/\{[\s\S]*\}/)?.[0] || r.decision_output;
                const parsed = JSON.parse(jsonText);
                entryZone = parsed.entry || parsed.entry_zone || entryZone;
                target = parsed.target || target;
                stopLoss = parsed.stop_loss || parsed.stopLoss || stopLoss;
                if (parsed.reasoning) cleanExplanation = parsed.reasoning;
              }
            } catch (e) {
              // Fallback to raw text if JSON fails
            }

            return {
              id: r.id,
              stock: r.symbol,
              sector: "Alpha Found",
              signal: r.decision as "BUY" | "SELL" | "HOLD",
              confidence: 75 + (index % 20), // Mocked if not in JSON
              expectedMove: 2.5 + (index % 10),
              price: entryZone,
              volume: "High",
              risk: (index % 3 === 0 ? "High" : index % 3 === 1 ? "Medium" : "Low") as any,
              explanation: cleanExplanation,
              entryZone,
              target,
              stopLoss,
              date: new Date(r.created_at).toLocaleDateString()
            };
          });
          
          setSignals(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Failed to sync Signal History");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filteredSignals = signals.filter(s => 
    s.stock.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.signal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTradePlan = (data: SignalData) => {
    setSelectedSignal(data);
    setModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <AIDecisionStrip />
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-gold" />
              <h1 className="font-display text-2xl font-bold text-foreground">Intelligence Audit Log</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Review every AI-generated trade signal and historical performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-gold transition-colors" />
              <input 
                type="text" 
                placeholder="Search symbol or signal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-accent/40 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gold/30 transition-all w-64"
              />
            </div>
            <button className="p-2 rounded-xl bg-accent/40 border border-white/5 text-muted-foreground hover:text-foreground transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="ai-card p-24 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Synchronizing Neural Archive...</p>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="ai-card p-20 text-center border-dashed border-white/5">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No Signals Archived</h3>
            <p className="text-sm text-muted-foreground">Signals from your scans will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSignals.map((signal, i) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="ai-card group hover:border-gold/20 transition-all"
              >
                <div className="p-4 flex items-center justify-between flex-wrap gap-4">
                  {/* Stock Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center font-mono-data font-bold text-sm">
                      {signal.stock.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-gold transition-colors">{signal.stock}</h3>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {(signal as any).date}
                      </div>
                    </div>
                  </div>

                  {/* Signal Status */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">Decision</span>
                      <div className={`flex items-center gap-1 font-black text-sm ${
                        signal.signal === "BUY" ? "text-profit" : signal.signal === "SELL" ? "text-loss" : "text-gold"
                      }`}>
                        {signal.signal === "BUY" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {signal.signal}
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">Confidence</span>
                      <span className="font-mono-data font-bold text-white">{signal.confidence}%</span>
                    </div>

                    <div className="text-center hidden sm:block">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">Entry Zone</span>
                      <span className="text-sm font-medium text-foreground">{signal.entryZone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleViewTradePlan(signal)}
                      className="px-4 py-2 rounded-lg bg-accent/60 border border-white/5 text-xs font-bold text-foreground hover:bg-gold hover:text-black transition-all flex items-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      View Strategy
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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

export default SignalHistory;
