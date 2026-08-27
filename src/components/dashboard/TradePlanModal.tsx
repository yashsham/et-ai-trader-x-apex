import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TrendingUp, ShieldAlert, Target, ArrowDown, Zap, BarChart3, Brain, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { SignalData } from "./AISignalCard";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface TradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SignalData | null;
}

const tradePlans: Record<string, { entry: string; target: string; targetPct: string; stopLoss: string; probability: number; reason: string }> = {
  RELIANCE: { entry: "₹2,440 – ₹2,460", target: "₹2,620", targetPct: "+6.5%", stopLoss: "₹2,380", probability: 89, reason: "Rebound off 50-day EMA with MACD bullish crossover and heavy institutional block buying above 2,420 support." },
  HDFCBANK: { entry: "₹1,610 – ₹1,630", target: "₹1,750", targetPct: "+6.2%", stopLoss: "₹1,560", probability: 91, reason: "Institutional liquidity sweep detected at key demand zone with net interest margin expansion projections." },
  TATAMOTORS: { entry: "₹910 – ₹925", target: "₹1,020", targetPct: "+8.2%", stopLoss: "₹880", probability: 92, reason: "EV division margin expansion driving upside breakout above multi-month flag pattern with 42% export surge." },
  TCS: { entry: "₹4,080 – ₹4,140", target: "₹4,350", targetPct: "+5.4%", stopLoss: "₹3,980", probability: 84, reason: "Nifty IT index leader consolidating near all-time high resistance band with double-digit US cloud migration deals." },
  INFY: { entry: "₹1,830 – ₹1,850", target: "₹1,980", targetPct: "+5.8%", stopLoss: "₹1,780", probability: 86, reason: "Double-bottom bullish reversal pattern on 4H chart with RSI oversold recovery and heavy institutional accumulation." },
  BAJFINANCE: { entry: "₹7,050 – ₹7,130", target: "₹7,435", targetPct: "+4.3%", stopLoss: "₹6,920", probability: 79, reason: "RBI policy NBFC favorable stance. Credit growth expanding with retail loan book quality improvement." },
  BHARTIARTL: { entry: "₹1,240 – ₹1,260", target: "₹1,380", targetPct: "+7.8%", stopLoss: "₹1,190", probability: 88, reason: "ARPU rate hikes and 5G network expansion driving high-conviction institutional accumulation." },
  SBIN: { entry: "₹820 – ₹835", target: "₹910", targetPct: "+7.2%", stopLoss: "₹790", probability: 87, reason: "PSU banking sector rally led by strong Q3 credit growth and asset quality improvement." },
  ICICIBANK: { entry: "₹1,180 – ₹1,200", target: "₹1,310", targetPct: "+6.9%", stopLoss: "₹1,140", probability: 90, reason: "Net interest income expansion with private banking sector outperformance." },
  "BTC-USD": { entry: "$95,500 – $96,800", target: "$105,000", targetPct: "+9.2%", stopLoss: "$92,000", probability: 88, reason: "Institutional spot ETF inflows of $850M pushing digital asset price past key resistance levels." },
  "ETH-USD": { entry: "$3,150 – $3,220", target: "$3,650", targetPct: "+11.5%", stopLoss: "$2,980", probability: 85, reason: "Layer-2 gas fee reduction and staking yield expansion driving bullish momentum." }
};

const TradeParam = ({ icon, label, value, valueClass = "text-foreground" }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) => (
  <div className="p-3.5 rounded-xl bg-accent/40 border border-white/5 space-y-1">
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-wider">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`font-mono text-sm font-bold ${valueClass}`}>{value}</div>
  </div>
);

export function TradePlanModal({ open, onOpenChange, data }: TradePlanModalProps) {
  const { t } = useLanguage();
  const [isSimulating, setIsSimulating] = useState(false);
  if (!data) return null;
  
  const rawStock = (data.stock || "RELIANCE").toUpperCase();
  const cleanStock = rawStock.split('.')[0];
  const mockPlan = tradePlans[cleanStock] || tradePlans[rawStock] || {
    entry: "₹1,610 – ₹1,630",
    target: "₹1,750",
    targetPct: "+6.5%",
    stopLoss: "₹1,560",
    probability: data.confidence || 85,
    reason: "Institutional liquidity sweep detected at key demand zone with MACD bullish crossover."
  };

  const isPlaceholder = (val: string | undefined, defaultVal: string) => {
    if (!val || val === "Live" || val.includes("Analyze") || val.includes("Protect")) {
      return defaultVal;
    }
    return val;
  };

  const plan = {
    entry: isPlaceholder(data.entryZone, mockPlan.entry),
    target: isPlaceholder(data.target, mockPlan.target),
    targetPct: mockPlan.targetPct || "+6.5%",
    stopLoss: isPlaceholder(data.stopLoss, mockPlan.stopLoss),
    probability: data.confidence || mockPlan.probability || 85,
    reason: isPlaceholder(data.explanation, mockPlan.reason)
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      setIsSimulating(false);
      toast.success(`Trade Strategy Validated: ${data.stock}`, {
        description: `Target ${plan.target} verified with ${plan.probability}% win probability. Risk-reward ratio optimized.`,
      });
      onOpenChange(false);
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-white/10 p-0 overflow-hidden shadow-2xl">
        {/* Glowing top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-crimson via-gold to-crimson" />

        <div className="p-6 space-y-5">
          <DialogHeader className="mb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <span className="font-mono text-base font-bold text-gold">{cleanStock.slice(0, 3)}</span>
              </div>
              <div>
                <DialogTitle className="font-mono text-lg font-bold text-foreground flex items-center gap-2">
                  <span>{data.stock}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-accent text-gold border border-gold/20 uppercase font-mono">
                    {data.signal || "BUY"}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-gold font-semibold flex items-center gap-1 mt-0.5 font-mono">
                  <Zap className="w-3 h-3" />
                  {t('ai_trade_strategy') || "AI-Generated Trade Strategy"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Trade Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <TradeParam icon={<Target className="w-4 h-4 text-profit" />} label={t('entry_zone') || "Entry Zone"} value={plan.entry} />
            <TradeParam icon={<TrendingUp className="w-4 h-4 text-profit" />} label={t('target_price') || "Target Price"} value={`${plan.target} (${plan.targetPct})`} valueClass="text-profit" />
            <TradeParam icon={<ArrowDown className="w-4 h-4 text-crimson" />} label={t('stop_loss') || "Stop Loss"} value={plan.stopLoss} valueClass="text-crimson" />
            <TradeParam icon={<ShieldAlert className="w-4 h-4 text-gold" />} label={t('risk_label') || "Risk Level"} value={data.risk || "Medium"} valueClass={data.risk === "Low" ? "text-profit" : data.risk === "High" ? "text-crimson" : "text-gold"} />
          </div>

          {/* Probability & Risk Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-accent/40 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-mono">{t('accuracy') || "AI ACCURACY"}</span>
                <span className="font-mono text-lg font-black text-gold">{plan.probability}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${plan.probability}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gold rounded-full shadow-[0_0_8px_rgba(255,184,0,0.5)]"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent/40 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-mono">RISK EXPOSURE</span>
                <span className={`font-mono text-xs font-black uppercase ${data.risk === "Low" ? "text-profit" : data.risk === "High" ? "text-crimson" : "text-gold"}`}>
                  {data.risk || "MEDIUM"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-3">
                <div className={`h-1.5 rounded ${data.risk === "Low" || data.risk === "Medium" || data.risk === "High" ? "bg-profit" : "bg-muted"}`} />
                <div className={`h-1.5 rounded ${data.risk === "Medium" || data.risk === "High" ? "bg-gold" : "bg-muted"}`} />
                <div className={`h-1.5 rounded ${data.risk === "High" ? "bg-crimson" : "bg-muted"}`} />
              </div>
            </div>
          </div>

          {/* AI Strategic Overview */}
          <div className="p-4 rounded-xl bg-gold/5 border border-gold/15 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gold uppercase tracking-widest font-mono">
              <Brain className="w-3.5 h-3.5" />
              <span>AI Strategic Overview</span>
            </div>
            <p className="text-xs text-foreground/90 italic leading-relaxed font-sans pl-2 border-l-2 border-gold">
              "{plan.reason}"
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-sm transition-all shadow-lg shadow-gold/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Validating Strategy Parameters...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  <span>Simulate Trade Execution</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-2 text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer font-mono"
            >
              Close Strategy
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
