import { TrendingUp, TrendingDown } from "lucide-react";

const niftyData = [22180, 22210, 22150, 22280, 22350, 22310, 22400, 22380, 22450, 22420, 22480, 22510];

export function MarketOverview() {
  const current = niftyData[niftyData.length - 1];
  const prev = niftyData[0];
  const change = current - prev;
  const changePct = ((change / prev) * 100).toFixed(2);
  const isUp = change >= 0;

  const max = Math.max(...niftyData);
  const min = Math.min(...niftyData);
  const range = max - min;

  const points = niftyData
    .map((val, i) => {
      const x = (i / (niftyData.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="ai-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Nifty 50</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-mono-data text-2xl font-bold text-foreground">
              {current.toLocaleString()}
            </span>
            <span className={`font-mono-data text-sm font-semibold flex items-center gap-1 ${isUp ? "text-profit" : "text-loss"}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? "+" : ""}{change} ({changePct}%)
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
          <polygon points={areaPoints} fill="url(#chartFill)" />
          <polyline
            points={points}
            fill="none"
            stroke={isUp ? "hsl(145 100% 39%)" : "hsl(14 100% 50%)"}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
