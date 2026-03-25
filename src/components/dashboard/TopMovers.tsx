import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { useLanguage } from "@/contexts/LanguageContext";

interface Mover {
  symbol: string;
  name: string;
  company_name: string;
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
        // Backend returns the movers inside 'data' or directly? 
        // Based on dashboard_service.py: payload = {"gainers": gainers, "losers": losers}
        // Let's check main.py route for /movers
        if (json.gainers || json.losers) {
          setData(json);
        } else if (json.data) {
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
      <div className="ai-card p-6 min-h-[350px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
      </div>
    );
  }

  const renderStockRow = (stock: Mover, type: 'up' | 'down') => (
    <div
      key={stock.symbol}
      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-full ${type === 'up' ? 'bg-profit/10' : 'bg-loss/10'}`}>
          {type === 'up' ? 
            <TrendingUp className="w-3.5 h-3.5 text-profit" /> : 
            <TrendingDown className="w-3.5 h-3.5 text-loss" />
          }
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground group-hover:text-gold transition-colors">
            {stock.company_name || stock.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">{stock.symbol.split('.')[0]}</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[10px] text-muted-foreground/70 uppercase tracking-tighter">{stock.sector}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono-data text-sm font-semibold text-foreground">{stock.price}</p>
        <p className={`font-mono-data text-xs font-bold ${type === 'up' ? 'text-profit' : 'text-loss'}`}>
          {stock.change}
        </p>
      </div>
    </div>
  );

  return (
    <div className="ai-card p-6 border-white/[0.05] bg-gradient-to-br from-white/[0.02] to-transparent">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span className="w-1 h-4 bg-crimson rounded-full" />
          {t('live_movers') || 'Live Movers'}
        </h3>
        <span className="text-[10px] text-gold/50 font-mono italic animate-pulse">LIVE REFRESH</span>
      </div>

      <div className="space-y-1">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-2 px-3">Top Gainers</div>
        {data.gainers.slice(0, 3).map((stock) => renderStockRow(stock, 'up'))}

        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent my-4" />

        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-2 px-3">Top Losers</div>
        {data.losers.slice(0, 3).map((stock) => renderStockRow(stock, 'down'))}
      </div>
    </div>
  );
}
