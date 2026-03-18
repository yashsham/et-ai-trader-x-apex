import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TrendingUp, ShieldAlert, Target, ArrowDown, Zap, Play, BarChart3, Brain, ArrowRight } from "lucide-react";
import type { SignalData } from "./AISignalCard";

interface TradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SignalData | null;
}

const tradePlans: Record<string, { entry: string; target: string; targetPct: string; stopLoss: string; probability: number; reason: string }> = {
  RELIANCE: { entry: "₹2,450 – ₹2,480", target: "₹2,650", targetPct: "+8.2%", stopLoss: "₹2,380", probability: 87, reason: "Stock resistance tod chuka hai, volume spike strong buying signal de raha hai. Institutional buyers active, breakout sustain hone ke chances high hain." },
  TATAMOTORS: { entry: "₹970 – ₹990", target: "₹1,045", targetPct: "+5.7%", stopLoss: "₹945", probability: 82, reason: "Promoter stake badhaya hai — strong conviction signal. EV segment ka outlook positive hai, market ne abhi fully price-in nahi kiya." },
  BAJFINANCE: { entry: "₹7,050 – ₹7,130", target: "₹7,435", targetPct: "+4.3%", stopLoss: "₹6,920", probability: 79, reason: "RBI policy NBFC ke liye favorable hai. Credit growth expect ho raha hai, sector rotation bhi support kar raha hai." },
  INFY: { entry: "₹1,620 – ₹1,645", target: "₹1,705", targetPct: "+3.8%", stopLoss: "₹1,590", probability: 74, reason: "Dollar hedging strong hai aur large deal pipeline announce hui hai. IT sector mein selective buying chal rahi hai." },
  ADANIENT: { entry: "₹2,820 – ₹2,850", target: "₹3,050", targetPct: "+7.1%", stopLoss: "₹2,750", probability: 88, reason: "Cup & handle pattern complete ho gaya hai massive volume ke saath. Technical breakout strong hai." },
  HCLTECH: { entry: "₹1,440 – ₹1,460", target: "₹1,500", targetPct: "+2.9%", stopLoss: "₹1,410", probability: 68, reason: "Unusual options activity dikha raha hai institutional positioning. Short-term upside possible hai." },
};

export function TradePlanModal({ open, onOpenChange, data }: TradePlanModalProps) {
  if (!data) return null;
  const plan = tradePlans[data.stock] || tradePlans.RELIANCE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border p-0 overflow-hidden">
        {/* Glowing top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--crimson))] via-[hsl(var(--gold))] to-[hsl(var(--crimson))]" />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center">
                <span className="font-mono-data text-sm font-bold text-foreground">{data.stock.slice(0, 2)}</span>
              </div>
              <div>
                <DialogTitle className="font-mono-data text-lg font-bold text-foreground">{data.stock}</DialogTitle>
                <DialogDescription className="text-xs text-gold font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  AI Generated Trade Strategy
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Trade Parameters */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <TradeParam icon={<Target className="w-4 h-4 text-profit" />} label="Entry Zone" value={plan.entry} />
            <TradeParam icon={<TrendingUp className="w-4 h-4 text-profit" />} label="Target" value={`${plan.target} (${plan.targetPct})`} valueClass="text-profit" />
            <TradeParam icon={<ArrowDown className="w-4 h-4 text-loss" />} label="Stop Loss" value={plan.stopLoss} valueClass="text-loss" />
            <TradeParam icon={<ShieldAlert className="w-4 h-4 text-[hsl(var(--warning))]" />} label="Risk Level" value={data.risk} valueClass={data.risk === "Low" ? "text-profit" : data.risk === "High" ? "text-loss" : "text-[hsl(var(--warning))]"} />
          </div>

          {/* Probability & Risk Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-accent/40 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Accuracy</span>
                <span className="font-mono-data text-lg font-black text-gold">{plan.probability}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${plan.probability}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-crimson to-gold"
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-accent/40 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Risk Exposure</span>
                <span className={`text-xs font-black uppercase ${
                  data.risk === 'Low' ? 'text-profit' : data.risk === 'High' ? 'text-loss' : 'text-gold'
                }`}>{data.risk}</span>
              </div>
              <div className="flex gap-1 h-1.5">
                <div className={`flex-1 rounded-full ${data.risk === 'Low' ? 'bg-profit' : 'bg-white/10'}`} />
                <div className={`flex-1 rounded-full ${data.risk === 'Medium' ? 'bg-gold' : 'bg-white/10'}`} />
                <div className={`flex-1 rounded-full ${data.risk === 'High' ? 'bg-loss' : 'bg-white/10'}`} />
              </div>
            </div>
          </div>

          {/* AI Reason */}
          <div className="mb-8 relative">
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gold/30 rounded-full" />
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 italic">
              <span className="text-[10px] uppercase tracking-widest text-gold font-black block mb-2 flex items-center gap-2">
                <Brain className="w-3 h-3 text-gold" /> AI Strategic Overview
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed">"{plan.reason}"</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full py-4 rounded-xl bg-crimson text-white font-black text-base shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <BarChart3 className="w-5 h-5" />
              SIMULATE TRADE PLAN
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl border border-white/10 text-muted-foreground text-xs font-bold hover:text-white hover:bg-white/5 transition-all"
            >
              Close Strategy
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TradeParam({ icon, label, value, valueClass = "text-foreground" }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="p-3 rounded-lg bg-accent/60">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <span className={`font-mono-data text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
