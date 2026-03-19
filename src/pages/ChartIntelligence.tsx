import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { BookmarkPlus, Zap, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { TradePlanModal } from "@/components/dashboard/TradePlanModal";

interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Analysis {
  trend: string;
  support: number;
  resistance: number;
  target: number;
  stop_loss: number;
  risk_reward: string;
  explanation: string;
}

const ChartIntelligence = () => {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [searchInput, setSearchInput] = useState("RELIANCE.NS");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("1mo");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async (targetSymbol: string, tf: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/charts/${targetSymbol}?period=${tf}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setChartData(data.data?.chartData || []);
      setAnalysis(data.data?.analysis || null);
      setSymbol(targetSymbol);
    } catch (err: any) {
      setError(err.message || "Failed to fetch chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(symbol, timeframe);
  }, [timeframe]);

  const handleExecuteTrade = () => {
    if (!analysis || chartData.length === 0) {
      toast.error("Analysis not ready. Please wait for the AI to complete its scan.");
      return;
    }
    setIsModalOpen(true);
  };

  const currentPrice = chartData[chartData.length - 1]?.close || 0;
  const signalData = analysis ? {
    id: Date.now(),
    stock: symbol.split('.')[0],
    sector: "Equity",
    signal: analysis.trend.includes("Bullish") ? "Breakout" : "Bearish",
    confidence: 85,
    expectedMove: parseFloat(((analysis.target - currentPrice) / currentPrice * 100).toFixed(2)),
    price: currentPrice.toFixed(2),
    volume: (chartData[chartData.length - 1]?.volume / 1000000).toFixed(1) + "M",
    risk: analysis.risk_reward.includes('1:1') ? "Medium" as const : "Low" as const,
    explanation: analysis.explanation,
    target: analysis.target.toString(),
    stopLoss: analysis.stop_loss.toString(),
    entryZone: `₹${analysis.support.toFixed(1)} – ₹${(analysis.support * 1.01).toFixed(1)}`
  } : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchData(searchInput.trim(), timeframe);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: symbol }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast.success(`${symbol} added to watchlist`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to add ${symbol} to watchlist`);
    }
  };

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.low)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.high)) : 1;
  const range = maxPrice - minPrice || 1;
  const padding = range * 0.1; // 10% vertical padding
  const graphMin = minPrice - padding;
  const graphMax = maxPrice + padding;
  const graphRange = graphMax - graphMin;

  const svgW = 800;
  const svgH = 400;
  const candleW = chartData.length > 0 ? svgW / chartData.length : 10;

  const toY = (price: number) => svgH - ((price - graphMin) / graphRange) * (svgH - 40) - 20;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
              Chart Intelligence
              {loading && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time AI-powered technical analysis</p>
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center bg-card border border-white/[0.08] rounded-lg px-2 py-1 focus-within:border-gold/30 focus-within:ring-1 focus-within:ring-gold/20 transition-all">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                placeholder="Ex. TCS.NS"
                className="bg-transparent text-sm text-foreground outline-none w-24 md:w-32 px-2"
              />
              <button type="submit" className="p-1.5 text-muted-foreground hover:text-gold transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>
            <button 
              onClick={handleAddToWatchlist}
              className="flex items-center gap-2 px-4 py-2 h-9 rounded-lg bg-accent text-foreground text-xs font-semibold hover:bg-muted transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Watchlist</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-loss/10 border border-loss/20 rounded-xl text-loss text-sm flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 ai-card p-4 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-lg text-foreground tracking-wide">{symbol}</div>
              <div className="flex items-center gap-2">
                {[
                  { label: "1W", value: "5d" },
                  { label: "1M", value: "1mo" },
                  { label: "3M", value: "3mo" },
                  { label: "6M", value: "6mo" },
                  { label: "1Y", value: "1y" },
                ].map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                      timeframe === tf.value
                        ? "bg-crimson/20 text-crimson"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 360 }}>
              {!loading && chartData.length > 0 && analysis && (
                <>
                  {/* Resistance line */}
                  {analysis.resistance && toY(analysis.resistance) > 0 && toY(analysis.resistance) < svgH && (
                    <>
                      <line
                        x1="0" y1={toY(analysis.resistance)} x2={svgW} y2={toY(analysis.resistance)}
                        stroke="hsl(43 65% 53%)" strokeWidth="1" strokeDasharray="6 4" opacity="0.6"
                      />
                      <text x={svgW - 5} y={toY(analysis.resistance) - 6} textAnchor="end" fill="hsl(43 65% 53%)" fontSize="9" fontFamily="monospace">
                        Res ₹{analysis.resistance}
                      </text>
                    </>
                  )}

                  {/* Support line */}
                  {analysis.support && toY(analysis.support) > 0 && toY(analysis.support) < svgH && (
                    <>
                      <line
                        x1="0" y1={toY(analysis.support)} x2={svgW} y2={toY(analysis.support)}
                        stroke="hsl(145 100% 39%)" strokeWidth="1" strokeDasharray="6 4" opacity="0.6"
                      />
                      <text x={svgW - 5} y={toY(analysis.support) + 14} textAnchor="end" fill="hsl(145 100% 39%)" fontSize="9" fontFamily="monospace">
                        Sup ₹{analysis.support}
                      </text>
                    </>
                  )}

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
                          width={Math.max(1, candleW * 0.7)}
                          height={Math.max(1, Math.abs(toY(d.open) - toY(d.close)))}
                          fill={color}
                          rx="1"
                        />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
            
            {loading && (
              <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            )}
          </div>

          {/* AI Explanation panel */}
          <div className="ai-card p-5 flex flex-col relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded gradient-crimson-gold flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                  <Zap className="w-3 h-3 text-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">AI Intelligence</span>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="p-3 rounded-lg bg-accent/50 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full gradient-crimson-gold opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-xs text-muted-foreground leading-relaxed font-editorial italic ml-2">
                  {analysis?.explanation || "Awaiting AI Analysis..."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground">Trend Output</span>
                  <span className={`font-semibold ${analysis?.trend?.includes("Bullish") ? "text-profit" : analysis?.trend?.includes("Bearish") ? "text-loss" : "text-gold"}`}>
                    {analysis?.trend || "..."}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground">Support Floor</span>
                  <span className="font-mono-data text-foreground">₹{analysis?.support?.toFixed(1) || "..."}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground">Resistance Ceiling</span>
                  <span className="font-mono-data text-foreground">₹{analysis?.resistance?.toFixed(1) || "..."}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-gold/5 border border-gold/10">
                  <span className="text-gold font-medium">AI Price Target</span>
                  <span className="font-mono-data text-gold font-bold">₹{analysis?.target?.toFixed(1) || "..."}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded bg-loss/5 border border-loss/10">
                  <span className="text-loss font-medium">Auto Stop-Loss</span>
                  <span className="font-mono-data text-loss font-bold">₹{analysis?.stop_loss?.toFixed(1) || "..."}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 transition-colors">
                  <span className="text-muted-foreground">Risk/Reward Est.</span>
                  <span className="font-mono-data text-foreground font-semibold">{analysis?.risk_reward || "..."}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleExecuteTrade}
              className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg gradient-crimson-gold text-foreground text-xs font-bold glow-crimson transition-opacity shadow-lg ${!analysis ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              disabled={!analysis}
            >
              <Zap className="w-4 h-4" />
              Execute Trade Plan
            </button>
          </div>
        </div>
      </div>

      <TradePlanModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={signalData}
      />
    </AppLayout>
  );
};

export default ChartIntelligence;
