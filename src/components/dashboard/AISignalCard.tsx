import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Plus, TrendingUp, TrendingDown, ShieldAlert, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface SignalData {
  id: number | string;
  stock: string;
  sector: string;
  signal: string;
  confidence: number;
  expectedMove: number;
  price: string;
  volume: string;
  risk: "Low" | "Medium" | "High";
  explanation: string;
  target?: string;
  stopLoss?: string;
  entryZone?: string;
  date?: string;
}

const signalConfig: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  Breakout: {
    color: "text-profit",
    bg: "bg-[hsl(var(--profit)/0.12)]",
    border: "border-[hsl(var(--profit)/0.3)]",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--profit)/0.4)]",
  },
  Bearish: {
    color: "text-loss",
    bg: "bg-[hsl(var(--loss)/0.12)]",
    border: "border-[hsl(var(--loss)/0.3)]",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--loss)/0.4)]",
  },
  "Insider Buy": {
    color: "text-gold",
    bg: "bg-[hsl(var(--gold)/0.12)]",
    border: "border-[hsl(var(--gold)/0.3)]",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--gold)/0.4)]",
  },
  "News Impact": {
    color: "text-profit",
    bg: "bg-[hsl(var(--profit)/0.12)]",
    border: "border-[hsl(var(--profit)/0.3)]",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--profit)/0.4)]",
  },
  "AI Prediction": {
    color: "text-gold",
    bg: "bg-[hsl(var(--gold)/0.12)]",
    border: "border-[hsl(var(--gold)/0.3)]",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--gold)/0.4)]",
  },
  Volume: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    glow: "shadow-[0_0_20px_-5px_hsl(var(--muted-foreground)/0.3)]",
  },
};

const riskColors: Record<string, string> = {
  Low: "text-profit bg-[hsl(var(--profit)/0.12)]",
  Medium: "text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.12)]",
  High: "text-loss bg-[hsl(var(--loss)/0.12)]",
};

interface AISignalCardProps {
  data: SignalData;
  onViewTradePlan: (data: SignalData) => void;
  index?: number;
}

export function AISignalCard({ data, onViewTradePlan, index = 0 }: AISignalCardProps) {
  const { t } = useLanguage();
  const config = signalConfig[data.signal] || signalConfig.Volume;
  const isPositive = data.expectedMove >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.2, 0, 0, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative bg-card border rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 ${
        data.confidence > 90 ? (isPositive ? "elite-glow-profit border-profit/50" : "elite-glow-loss border-loss/50") : "border-border"
      }`}
    >
      {/* Background visual texture */}
      <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
      
      {/* Dynamic glow overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        initial={false}
      >
        <div className={`absolute -inset-4 rounded-3xl blur-2xl ${
          isPositive
            ? "bg-[hsl(var(--profit)/0.15)]"
            : "bg-[hsl(var(--loss)/0.15)]"
        }`} />
      </motion.div>

      <div className="relative z-10 p-6">
        {/* Top: Stock + Signal Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/80 flex items-center justify-center border border-white/5 shadow-inner">
              <span className="font-mono-data text-sm font-black text-foreground">
                {data.stock.slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="font-mono-data text-lg font-black text-white tracking-tight">{data.stock}</h3>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{data.sector}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-widest ${config.color} ${config.bg} border ${config.border}`}>
              {data.signal}
            </span>
            <span className="text-[9px] text-muted-foreground font-mono">ID: #{data.id}0{index}</span>
          </div>
        </div>

        {/* Center: Expected Move - MASSIVE IMPACT */}
        <div className={`text-center py-10 mb-6 rounded-2xl transition-all duration-500 overflow-hidden relative ${
          data.confidence > 90 
            ? "bg-white/[0.02] ring-1 ring-white/10 shadow-2xl" 
            : "bg-accent/40"
        }`}>
          {/* Subtle moving light effect for high confidence */}
          {data.confidence > 90 && (
            <motion.div 
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"
            />
          )}

          {data.confidence > 90 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/20 border border-crimson/40 mb-4 shadow-lg shadow-crimson/20"
            >
              <Zap className="w-4 h-4 text-crimson fill-crimson animate-pulse" />
              <span className="text-[10px] font-black text-crimson uppercase tracking-[0.2em]">🔥 {t('high_conviction_signal')}</span>
            </motion.div>
          )}
          
          <span className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground block mb-2 font-black opacity-60">
            {t('projected_return')}
          </span>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <span
              className={`text-display-huge leading-none ${
                isPositive ? "text-profit" : "text-loss"
              }`}
              style={isPositive 
                ? { textShadow: `0 0 50px hsl(145 100% 39% / 0.4)` } 
                : { textShadow: `0 0 50px hsl(14 100% 50% / 0.4)` }
              }
            >
              {isPositive ? "+" : ""}{data.expectedMove}%
            </span>
            <div className={`mt-4 px-4 py-1.5 rounded-xl border flex items-center gap-2 ${
              isPositive ? "bg-profit/10 border-profit/20" : "bg-loss/10 border-loss/20"
            }`}>
              {isPositive ? <TrendingUp className="w-5 h-5 text-profit" /> : <TrendingDown className="w-5 h-5 text-loss" />}
              <span className="font-mono-data text-lg font-black text-foreground">{data.price}</span>
            </div>
          </motion.div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('ai_confidence')}</span>
            <span className="font-mono-data text-sm font-bold text-gold">{data.confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-accent overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.confidence}%` }}
              transition={{ duration: 1, delay: index * 0.08 + 0.2, ease: [0.2, 0, 0, 1] }}
              className={`h-full rounded-full ${
                data.confidence > 85
                  ? "bg-gradient-to-r from-[hsl(var(--crimson))] to-[hsl(var(--gold))]"
                  : "bg-[hsl(var(--muted-foreground))]"
              }`}
            />
          </div>
        </div>

        {/* Risk + Volume */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-muted-foreground" />
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${riskColors[data.risk]}`}>
              {t(data.risk.toLowerCase() as any)} {t('risk_label')}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">{t('volume')}: {data.volume}</span>
        </div>

        {/* AI Explanation */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-5 italic">
          "{data.explanation}"
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onViewTradePlan(data)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[hsl(var(--crimson))] text-primary-foreground text-xs font-bold hover:shadow-[0_0_20px_-3px_hsl(var(--crimson)/0.6)] transition-shadow duration-300"
          >
            <Eye className="w-3.5 h-3.5" />
            {t('view_trade_plan')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold)/0.4)] transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
