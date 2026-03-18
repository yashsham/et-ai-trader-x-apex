import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Plus, TrendingUp, TrendingDown, ShieldAlert } from "lucide-react";

export interface SignalData {
  id: number;
  stock: string;
  sector: string;
  signal: "Breakout" | "Bearish" | "Insider Buy" | "News Impact" | "AI Prediction" | "Volume";
  confidence: number;
  expectedMove: number;
  price: string;
  volume: string;
  risk: "Low" | "Medium" | "High";
  explanation: string;
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
  const config = signalConfig[data.signal] || signalConfig.Volume;
  const isPositive = data.expectedMove >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.2, 0, 0, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative bg-card border rounded-xl overflow-hidden group cursor-pointer transition-shadow duration-300 ${
        data.confidence > 85 ? config.border : "border-border"
      }`}
    >
      {/* Hover glow overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        initial={false}
      >
        <div className={`absolute -inset-1 rounded-xl blur-md ${
          isPositive
            ? "bg-[hsl(var(--profit)/0.08)]"
            : "bg-[hsl(var(--loss)/0.08)]"
        }`} />
      </motion.div>

      <div className="relative z-10 p-5">
        {/* Top: Stock + Signal Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <span className="font-mono-data text-xs font-bold text-foreground">
                {data.stock.slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="font-mono-data text-base font-bold text-foreground">{data.stock}</h3>
              <span className="text-[10px] text-muted-foreground">{data.sector}</span>
            </div>
          </div>
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${config.color} ${config.bg}`}>
            {data.signal}
          </span>
        </div>

        {/* Center: Expected Move */}
        <div className="text-center py-4 mb-4 rounded-lg bg-accent/50">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
            Expected Move
          </span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.4 }}
            className={`font-mono-data text-3xl font-extrabold ${
              isPositive ? "text-profit" : "text-loss"
            }`}
            style={isPositive ? { textShadow: "0 0 20px hsl(145 100% 39% / 0.4)" } : { textShadow: "0 0 20px hsl(14 100% 50% / 0.4)" }}
          >
            {isPositive ? "+" : ""}{data.expectedMove}%
          </motion.span>
          <div className="flex items-center justify-center gap-1 mt-1">
            {isPositive ? <TrendingUp className="w-3 h-3 text-profit" /> : <TrendingDown className="w-3 h-3 text-loss" />}
            <span className="font-mono-data text-xs text-muted-foreground">{data.price}</span>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Confidence</span>
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
              {data.risk} Risk
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">Vol: {data.volume}</span>
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
            View Trade Plan
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
