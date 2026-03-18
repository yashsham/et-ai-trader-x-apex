import { AppLayout } from "@/components/AppLayout";
import { ArrowUpRight, TrendingUp, Zap, Eye } from "lucide-react";

const opportunities = [
  {
    id: 1,
    stock: "RELIANCE",
    sector: "Energy",
    signal: "Breakout",
    confidence: 92,
    expectedMove: "+8.2%",
    price: "₹2,485.60",
    volume: "2.4x avg",
    reason: "Breaking above 52-week resistance with institutional buying",
  },
  {
    id: 2,
    stock: "TATAMOTORS",
    sector: "Auto",
    signal: "Insider Buy",
    confidence: 88,
    expectedMove: "+5.7%",
    price: "₹985.40",
    volume: "1.8x avg",
    reason: "Promoter increased stake by 2.1% — strong conviction signal",
  },
  {
    id: 3,
    stock: "BAJFINANCE",
    sector: "NBFC",
    signal: "News Impact",
    confidence: 85,
    expectedMove: "+4.3%",
    price: "₹7,126.50",
    volume: "1.5x avg",
    reason: "RBI policy favorable for NBFC sector, credit growth expected",
  },
  {
    id: 4,
    stock: "INFY",
    sector: "IT",
    signal: "AI Prediction",
    confidence: 79,
    expectedMove: "+3.8%",
    price: "₹1,642.30",
    volume: "1.3x avg",
    reason: "Strong dollar hedging + large deal pipeline announcement",
  },
  {
    id: 5,
    stock: "ADANIENT",
    sector: "Infra",
    signal: "Breakout",
    confidence: 91,
    expectedMove: "+7.1%",
    price: "₹2,847.00",
    volume: "3.1x avg",
    reason: "Cup & handle pattern completion with massive volume confirmation",
  },
  {
    id: 6,
    stock: "HCLTECH",
    sector: "IT",
    signal: "Volume",
    confidence: 74,
    expectedMove: "+2.9%",
    price: "₹1,456.80",
    volume: "1.6x avg",
    reason: "Unusual options activity suggests institutional positioning",
  },
];

const signalColors: Record<string, string> = {
  Breakout: "text-crimson bg-crimson/10",
  "Insider Buy": "text-gold bg-gold/10",
  "News Impact": "text-profit bg-profit/10",
  "AI Prediction": "text-gold bg-gold/10",
  Volume: "text-muted-foreground bg-muted",
};

const OpportunityRadar = () => {
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
          <div className="flex items-center gap-2 text-xs text-crimson">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">{opportunities.length} Active Signals</span>
          </div>
        </div>

        {/* Signal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className={`ai-card p-5 relative overflow-hidden group ${
                opp.confidence > 85
                  ? "border-crimson/20 hover:border-gold/40"
                  : ""
              }`}
            >
              {/* High confidence glow */}
              {opp.confidence > 85 && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute -inset-1 bg-gradient-to-r from-crimson/10 via-gold/10 to-crimson/10 rounded-xl blur-sm" />
                </div>
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data text-lg font-bold text-foreground">
                      {opp.stock}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${signalColors[opp.signal]}`}>
                      {opp.signal}
                    </span>
                  </div>
                  {/* Confidence ring */}
                  <div className="relative w-12 h-12">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle
                        cx="18" cy="18" r="14"
                        fill="none" stroke="hsl(220 20% 14%)" strokeWidth="3"
                      />
                      <circle
                        cx="18" cy="18" r="14"
                        fill="none"
                        stroke={opp.confidence > 85 ? "hsl(43 65% 53%)" : "hsl(214 20% 69%)"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${(opp.confidence / 100) * 87.96} 87.96`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono-data text-[10px] font-bold text-gold">
                      {opp.confidence}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono-data text-foreground">{opp.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Expected Move</span>
                    <span className="font-mono-data text-profit font-semibold">{opp.expectedMove}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-mono-data text-foreground">{opp.volume}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {opp.reason}
                </p>

                {/* CTA */}
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-foreground text-xs font-semibold hover:bg-crimson/20 hover:text-crimson transition-all duration-150">
                  <Eye className="w-3.5 h-3.5" />
                  View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default OpportunityRadar;
