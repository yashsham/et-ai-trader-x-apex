import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { useLanguage } from "@/contexts/LanguageContext";

interface Mover {
  symbol: string;
  price: string;
  change: string;
  raw_pct: number;
  sector: string;
}

interface MoversData {
  gainers: Mover[];
  losers: Mover[];
}

export function TopMovers() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<MoversData>({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/market/movers?lang=${language}`);
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
  }, [language]);

  if (loading) {
    return (
      <div className="ai-card p-6 min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="ai-card p-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
        <span className="w-1 h-4 bg-crimson rounded-full" />
        {t('live_movers')}
      </h3>

      <div className="space-y-2">
        {data.gainers.slice(0, 3).map((stock) => (
          <div
            key={stock.symbol}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-profit" />
              <div>
                <p className="text-sm font-medium text-foreground">{stock.symbol}</p>
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
            key={stock.symbol}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-loss" />
              <div>
                <p className="text-sm font-medium text-foreground">{stock.symbol}</p>
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
