import { useEffect, useState } from "react";
import { getWatchlist, addToWatchlist, removeFromWatchlist, WatchlistItem } from "@/lib/supabase";
import { Trash2, Plus, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export function Watchlist() {
  const { t } = useLanguage();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState("");
  const [adding, setAdding] = useState(false);

  async function loadWatchlist() {
    setLoading(true);
    const data = await getWatchlist();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol) return;
    
    setAdding(true);
    const result = await addToWatchlist(symbol);
    if (result) {
      toast.success(`${symbol} added to watchlist`);
      setNewSymbol("");
      await loadWatchlist();
    } else {
      toast.error("Failed to add to watchlist. Code: DB_SYNC_ERROR");
    }
    setAdding(false);
  }

  async function handleRemove(symbol: string) {
    const success = await removeFromWatchlist(symbol);
    if (success) {
      toast.success(`${symbol} removed from watchlist`);
      setItems(items.filter(i => i.symbol !== symbol));
    } else {
      toast.error("Failed to remove item");
    }
  }

  return (
    <div className="ai-card p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-gold" />
          <h3 className="font-display font-bold text-lg text-white">{t('active_watchlist')}</h3>
        </div>
        <button onClick={loadWatchlist} className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
          <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder={t('add_symbol_placeholder')}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors uppercase"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/20 rounded-lg px-4 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm opacity-60">
            <Eye className="w-8 h-8 mb-2 opacity-20" />
            {t('watchlist_empty')}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-colors">
              <div className="flex flex-col">
                <span className="font-black tracking-wider text-white">{item.symbol}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(item.added_at).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => handleRemove(item.symbol)}
                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-loss/20 rounded-lg text-loss"
                title={t('remove')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
