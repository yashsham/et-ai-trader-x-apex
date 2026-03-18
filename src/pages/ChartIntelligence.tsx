import { AppLayout } from "@/components/AppLayout";
import { Plus, BookmarkPlus, Zap } from "lucide-react";

const chartData = Array.from({ length: 60 }, (_, i) => {
  const base = 2350 + Math.sin(i * 0.3) * 50 + i * 1.5;
  const open = base + (Math.random() - 0.5) * 20;
  const close = base + (Math.random() - 0.5) * 20;
  const high = Math.max(open, close) + Math.random() * 15;
  const low = Math.min(open, close) - Math.random() * 15;
  return { open, close, high, low };
});

const ChartIntelligence = () => {
  const minPrice = Math.min(...chartData.map((d) => d.low));
  const maxPrice = Math.max(...chartData.map((d) => d.high));
  const range = maxPrice - minPrice;
  const svgW = 800;
  const svgH = 400;
  const candleW = svgW / chartData.length;

  const toY = (price: number) => svgH - ((price - minPrice) / range) * (svgH - 40) - 20;

  const resistance = 2450;
  const support = 2370;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Chart Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">RELIANCE — AI-powered technical analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-foreground text-xs font-semibold hover:bg-muted transition-colors">
              <BookmarkPlus className="w-3.5 h-3.5" />
              Add to Watchlist
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-crimson-gold text-foreground text-xs font-semibold glow-crimson hover:opacity-90 transition-opacity">
              <Zap className="w-3.5 h-3.5" />
              Generate Trade Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 ai-card p-4">
            <div className="flex items-center gap-4 mb-4">
              {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
                <button
                  key={tf}
                  className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                    tf === "1D"
                      ? "bg-crimson/20 text-crimson"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 360 }}>
              {/* Resistance line */}
              <line
                x1="0" y1={toY(resistance)} x2={svgW} y2={toY(resistance)}
                stroke="hsl(43 65% 53%)" strokeWidth="1" strokeDasharray="6 4" opacity="0.6"
              />
              <text x={svgW - 5} y={toY(resistance) - 6} textAnchor="end" fill="hsl(43 65% 53%)" fontSize="9" fontFamily="monospace">
                AI Resistance ₹{resistance}
              </text>

              {/* Support line */}
              <line
                x1="0" y1={toY(support)} x2={svgW} y2={toY(support)}
                stroke="hsl(145 100% 39%)" strokeWidth="1" strokeDasharray="6 4" opacity="0.6"
              />
              <text x={svgW - 5} y={toY(support) + 14} textAnchor="end" fill="hsl(145 100% 39%)" fontSize="9" fontFamily="monospace">
                AI Support ₹{support}
              </text>

              {/* Breakout zone */}
              <rect
                x="0" y={toY(resistance)} width={svgW}
                height={toY(support) - toY(resistance)}
                fill="hsl(354 85% 48%)" opacity="0.04"
              />

              {/* Candles */}
              {chartData.map((d, i) => {
                const x = i * candleW + candleW / 2;
                const isGreen = d.close >= d.open;
                const color = isGreen ? "hsl(145 100% 39%)" : "hsl(14 100% 50%)";
                return (
                  <g key={i}>
                    <line x1={x} y1={toY(d.high)} x2={x} y2={toY(d.low)} stroke={color} strokeWidth="1" />
                    <rect
                      x={x - candleW * 0.35}
                      y={toY(Math.max(d.open, d.close))}
                      width={candleW * 0.7}
                      height={Math.max(1, Math.abs(toY(d.open) - toY(d.close)))}
                      fill={color}
                      rx="1"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* AI Explanation panel */}
          <div className="ai-card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded gradient-crimson-gold flex items-center justify-center">
                <Zap className="w-3 h-3 text-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">AI Analysis</span>
            </div>

            <div className="space-y-4 flex-1">
              <div className="p-3 rounded-lg bg-accent">
                <p className="text-xs text-muted-foreground leading-relaxed font-editorial italic">
                  "Yeh stock resistance tod raha hai ₹2,450 pe. Breakout ka strong signal hai.
                  Agar volume badhta hai, toh target ₹2,600 possible hai."
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Trend</span>
                  <span className="text-profit font-semibold">Bullish ↑</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Support</span>
                  <span className="font-mono-data text-foreground">₹2,370</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Resistance</span>
                  <span className="font-mono-data text-foreground">₹2,450</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">AI Target</span>
                  <span className="font-mono-data text-gold font-semibold">₹2,600</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="font-mono-data text-loss">₹2,320</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Risk/Reward</span>
                  <span className="font-mono-data text-profit font-semibold">1:3.2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChartIntelligence;
