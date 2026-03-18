import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Zap, Filter, SlidersHorizontal } from "lucide-react";
import { AISignalCard, type SignalData } from "@/components/dashboard/AISignalCard";
import { TradePlanModal } from "@/components/dashboard/TradePlanModal";
import { motion } from "framer-motion";

const opportunities: SignalData[] = [
  {
    id: 1,
    stock: "RELIANCE",
    sector: "Energy",
    signal: "Breakout",
    confidence: 92,
    expectedMove: 8.2,
    price: "₹2,485.60",
    volume: "2.4x avg",
    risk: "Medium",
    explanation: "Strong breakout above 52-week resistance with massive institutional buying. Volume confirms breakout validity.",
  },
  {
    id: 2,
    stock: "TATAMOTORS",
    sector: "Auto",
    signal: "Insider Buy",
    confidence: 88,
    expectedMove: 5.7,
    price: "₹985.40",
    volume: "1.8x avg",
    risk: "Low",
    explanation: "Promoter ne 2.1% stake badhaya — yeh strong conviction signal hai. EV segment outlook positive.",
  },
  {
    id: 3,
    stock: "BAJFINANCE",
    sector: "NBFC",
    signal: "News Impact",
    confidence: 85,
    expectedMove: 4.3,
    price: "₹7,126.50",
    volume: "1.5x avg",
    risk: "Medium",
    explanation: "RBI policy NBFC ke liye favorable, credit growth expected. Sector rotation support kar raha hai.",
  },
  {
    id: 4,
    stock: "INFY",
    sector: "IT",
    signal: "AI Prediction",
    confidence: 79,
    expectedMove: 3.8,
    price: "₹1,642.30",
    volume: "1.3x avg",
    risk: "Low",
    explanation: "Strong dollar hedging + large deal pipeline. IT sector mein selective buying chal rahi hai.",
  },
  {
    id: 5,
    stock: "ADANIENT",
    sector: "Infra",
    signal: "Breakout",
    confidence: 91,
    expectedMove: 7.1,
    price: "₹2,847.00",
    volume: "3.1x avg",
    risk: "High",
    explanation: "Cup & handle pattern complete with massive volume confirmation. Technical breakout strong dikhra.",
  },
  {
    id: 6,
    stock: "HCLTECH",
    sector: "IT",
    signal: "Volume",
    confidence: 74,
    expectedMove: 2.9,
    price: "₹1,456.80",
    volume: "1.6x avg",
    risk: "Low",
    explanation: "Unusual options activity suggests institutional positioning. Short-term upside possible.",
  },
];

const OpportunityRadar = () => {
  const [selectedSignal, setSelectedSignal] = useState<SignalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewTradePlan = (data: SignalData) => {
    setSelectedSignal(data);
    setModalOpen(true);
  };

  const highConfCount = opportunities.filter(o => o.confidence > 85).length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Opportunity Radar</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-detected trading opportunities — updated every 30 seconds
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--crimson)/0.12)] text-[hsl(var(--crimson))]"
            >
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold">{highConfCount} High-Confidence</span>
            </motion.div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold)/0.3)] transition-all">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Active Signals", value: opportunities.length.toString(), color: "text-foreground" },
            { label: "High Confidence", value: highConfCount.toString(), color: "text-gold" },
            { label: "Avg Expected Move", value: `+${(opportunities.reduce((a, b) => a + b.expectedMove, 0) / opportunities.length).toFixed(1)}%`, color: "text-profit" },
            { label: "Best Signal", value: opportunities.reduce((a, b) => a.confidence > b.confidence ? a : b).stock, color: "text-[hsl(var(--crimson))]" },
          ].map((stat, i) => (
            <div key={i} className="ai-card p-4 text-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">{stat.label}</span>
              <span className={`font-mono-data text-xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Signal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {opportunities.map((opp, i) => (
            <AISignalCard
              key={opp.id}
              data={opp}
              onViewTradePlan={handleViewTradePlan}
              index={i}
            />
          ))}
        </div>
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
