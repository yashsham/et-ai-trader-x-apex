import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface OverviewData {
  symbol: string;
  current: number;
  change: number;
  changePct: number;
  history: number[];
}

export function MarketOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Use relative URL assuming proxy, or hardcode localhost for dev
        const res = await fetch("http://localhost:8000/api/v1/market/overview");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch market overview", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="ai-card p-6 min-h-[160px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
      </div>
    );
  }

  const { current, change, changePct, history } = data;
  const isUp = change >= 0;

  // Handle chart rendering safely
  let points = "";
  let areaPoints = "";
  if (history && history.length > 0) {
    const max = Math.max(...history);
    const min = Math.min(...history);
    const range = max === min ? 1 : max - min; // avoid div by zero

    points = history
      .map((val, i) => {
        const x = (i / (history.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    areaPoints = `0,100 ${points} 100,100`;
  }

  return (
    <div className="ai-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{data.symbol}</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-mono-data text-2xl font-bold text-foreground">
              {current.toLocaleString()}
            </span>
            <span className={`font-mono-data text-sm font-semibold flex items-center gap-1 ${isUp ? "text-profit" : "text-loss"}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? "+" : ""}{change.toLocaleString()} ({changePct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Today</div>
      </div>

      {/* Mini Chart */}
      <div className="h-24">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? "hsl(145 100% 39%)" : "hsl(14 100% 50%)"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isUp ? "hsl(145 100% 39%)" : "hsl(14 100% 50%)"} stopOpacity="0" />
            </linearGradient>
          </defs>
          {areaPoints && <polygon points={areaPoints} fill="url(#chartFill)" />}
          {points && (
            <polyline
              points={points}
              fill="none"
              stroke={isUp ? "hsl(145 100% 39%)" : "hsl(14 100% 50%)"}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
