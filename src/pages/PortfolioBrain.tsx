import { AppLayout } from "@/components/AppLayout";
import { AlertTriangle, Shield, TrendingUp, Zap } from "lucide-react";

const holdings = [
  { name: "RELIANCE", allocation: 22, value: "₹4,42,000", change: "+12.4%", sector: "Energy" },
  { name: "HDFC BANK", allocation: 18, value: "₹3,60,000", change: "+5.2%", sector: "Banking" },
  { name: "INFOSYS", allocation: 15, value: "₹3,00,000", change: "-2.1%", sector: "IT" },
  { name: "TCS", allocation: 12, value: "₹2,40,000", change: "+8.7%", sector: "IT" },
  { name: "TATAMOTORS", allocation: 10, value: "₹2,00,000", change: "+18.3%", sector: "Auto" },
  { name: "Others", allocation: 23, value: "₹4,60,000", change: "+4.1%", sector: "Mixed" },
];

const sectorData = [
  { name: "IT", pct: 27, color: "hsl(43 65% 53%)" },
  { name: "Banking", pct: 18, color: "hsl(354 85% 48%)" },
  { name: "Energy", pct: 22, color: "hsl(145 100% 39%)" },
  { name: "Auto", pct: 10, color: "hsl(214 20% 69%)" },
  { name: "Others", pct: 23, color: "hsl(220 20% 30%)" },
];

const insights = [
  { type: "warning", text: "IT sector overexposed at 27% — consider reducing by 7%" },
  { type: "suggestion", text: "Add pharma/healthcare for better diversification" },
  { type: "positive", text: "Auto sector timing is strong — hold positions" },
];

const PortfolioBrain = () => {
  const riskLevel = 65;

  // Pie chart
  let cumAngle = 0;
  const pieSlices = sectorData.map((s) => {
    const startAngle = cumAngle;
    cumAngle += (s.pct / 100) * 360;
    const endAngle = cumAngle;
    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, endAngle);
    const largeArc = s.pct > 50 ? 1 : 0;
    const d = `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    return { ...s, d };
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Portfolio Brain</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered portfolio analysis & optimization
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-crimson-gold text-foreground text-xs font-semibold glow-crimson hover:opacity-90 transition-opacity">
            <Zap className="w-3.5 h-3.5" />
            Optimize Portfolio
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="ai-card p-6 flex flex-col items-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
              Sector Allocation
            </p>
            <svg viewBox="0 0 100 100" className="w-48 h-48 mb-4">
              {pieSlices.map((slice, i) => (
                <path key={i} d={slice.d} fill={slice.color} stroke="hsl(216 30% 6%)" strokeWidth="1" />
              ))}
              <circle cx="50" cy="50" r="22" fill="hsl(216 30% 6%)" />
              <text x="50" y="48" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="monospace">
                ₹20L
              </text>
              <text x="50" y="57" textAnchor="middle" fill="hsl(214 20% 69%)" fontSize="5">
                Total Value
              </text>
            </svg>
            <div className="flex flex-wrap gap-3 justify-center">
              {sectorData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] text-muted-foreground">
                    {s.name} {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Holdings */}
          <div className="ai-card p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
              Holdings
            </p>
            <div className="space-y-2">
              {holdings.map((h) => (
                <div key={h.name} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">{h.sector} · {h.allocation}%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-data text-sm text-foreground">{h.value}</p>
                    <p className={`font-mono-data text-xs ${h.change.startsWith("+") ? "text-profit" : "text-loss"}`}>
                      {h.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk + AI Insights */}
          <div className="space-y-6">
            {/* Risk Meter */}
            <div className="ai-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
                Risk Level
              </p>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${riskLevel}%`,
                    background: "linear-gradient(90deg, hsl(145 100% 39%), hsl(43 65% 53%), hsl(14 100% 50%))",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              <p className="text-center mt-2">
                <span className="font-mono-data text-lg font-bold text-gold">{riskLevel}%</span>
                <span className="text-xs text-muted-foreground ml-2">Medium-High</span>
              </p>
            </div>

            {/* AI Insights */}
            <div className="ai-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
                AI Insights
              </p>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-accent">
                    {insight.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    ) : insight.type === "positive" ? (
                      <TrendingUp className="w-4 h-4 text-profit shrink-0 mt-0.5" />
                    ) : (
                      <Shield className="w-4 h-4 text-crimson shrink-0 mt-0.5" />
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default PortfolioBrain;
