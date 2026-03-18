import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AlertTriangle, Shield, TrendingUp, Zap, Loader2 } from "lucide-react";

interface PortfolioData {
  holdings: Array<{
    name: string;
    allocation: number;
    value_raw: number;
    value: string;
    change: string;
    sector: string;
  }>;
  sectors: Array<{
    name: string;
    pct: number;
    color: string;
  }>;
  total_value: string;
  risk_level: number;
  insights: Array<{
    type: "warning" | "suggestion" | "positive";
    text: string;
  }>;
}

const PortfolioBrain = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/portfolio");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load portfolio", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  // Pie chart calculation
  let cumAngle = 0;
  const pieSlices = data?.sectors.map((s) => {
    const startAngle = cumAngle;
    cumAngle += (s.pct / 100) * 360;
    const endAngle = cumAngle;
    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, endAngle);
    const largeArc = s.pct > 50 ? 1 : 0;
    const d = `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    return { ...s, d };
  }) || [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Portfolio Brain</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live AI-powered portfolio analysis & optimization
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-crimson-gold text-foreground text-xs font-semibold glow-crimson hover:opacity-90 transition-opacity">
            <Zap className="w-3.5 h-3.5" />
            Optimize Portfolio
          </button>
        </div>

        {loading || !data ? (
          <div className="ai-card p-12 flex flex-col items-center justify-center min-h-[500px]">
             <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50 mb-4" />
             <p className="text-sm text-muted-foreground">Syncing live holdings and latest market prices...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="ai-card p-6 flex flex-col items-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
                Sector Allocation
              </p>
              <svg viewBox="0 0 100 100" className="w-48 h-48 mb-4">
                {pieSlices.length > 0 ? pieSlices.map((slice, i) => (
                  <path key={i} d={slice.d} fill={slice.color} stroke="hsl(216 30% 6%)" strokeWidth="1" />
                )) : (
                  <circle cx="50" cy="50" r="40" fill="hsl(216 30% 6%)" stroke="hsl(216 30% 12%)" strokeWidth="2" />
                )}
                <circle cx="50" cy="50" r="22" fill="hsl(216 30% 6%)" />
                <text x="50" y="48" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="monospace">
                  {data.total_value}
                </text>
                <text x="50" y="57" textAnchor="middle" fill="hsl(214 20% 69%)" fontSize="4.5">
                  Total Value
                </text>
              </svg>
              <div className="flex flex-wrap gap-3 justify-center">
                {data.sectors.map((s) => (
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
              {data.holdings.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                   No positions detected.
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {data.holdings.map((h) => (
                    <div key={h.name} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{h.name}</p>
                        <p className="text-[10px] text-muted-foreground">{h.sector} · {h.allocation}% alloc</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono-data text-sm text-foreground">{h.value}</p>
                        <p className={`font-mono-data text-xs ${h.change.startsWith("-") ? "text-loss" : "text-profit"}`}>
                          {h.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                      width: `${data.risk_level}%`,
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
                  <span className="font-mono-data text-lg font-bold text-gold">{data.risk_level}%</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {data.risk_level < 40 ? "Low Risk" : data.risk_level > 70 ? "High Risk" : "Moderate Risk"}
                  </span>
                </p>
              </div>

              {/* AI Insights */}
              <div className="ai-card p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
                  Live AI Insights
                </p>
                <div className="space-y-3">
                  {data.insights.length === 0 && (
                     <p className="text-xs text-muted-foreground text-center">No insights available.</p>
                  )}
                  {data.insights.map((insight, i) => (
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
        )}
      </div>
    </AppLayout>
  );
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default PortfolioBrain;
