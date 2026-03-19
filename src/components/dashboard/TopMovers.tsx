import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface StockMover {
  name: string;
  price: string;
  change: string;
  raw_pct: number;
  sector: string;
}

interface MoversData {
  gainers: StockMover[];
  losers: StockMover[];
}

export function TopMovers() {
  const [data, setData] = useState<MoversData>({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/market/movers");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch market movers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="ai-card p-6 min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="ai-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Live Gainers & Losers (Nifty Top 10)</h3>

      <div className="space-y-2">
        {data.gainers.slice(0, 3).map((stock) => (
          <div
            key={stock.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-profit" />
              <div>
                <p className="text-sm font-medium text-foreground">{stock.name}</p>
                <p className="text-[10px] text-muted-foreground">{stock.sector}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono-data text-sm text-foreground">{stock.price}</p>
              <p className="font-mono-data text-xs text-profit">{stock.change}</p>
            </div>
          </div>
        ))}

        <div className="border-t border-white/[0.05] my-2" />

        {data.losers.slice(0, 3).map((stock) => (
          <div
            key={stock.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-loss" />
              <div>
                <p className="text-sm font-medium text-foreground">{stock.name}</p>
                <p className="text-[10px] text-muted-foreground">{stock.sector}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono-data text-sm text-foreground">{stock.price}</p>
              <p className="font-mono-data text-xs text-loss">{stock.change}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
