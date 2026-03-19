import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, TrendingUp, LogOut, Settings as SettingsIcon, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function TopNavbar() {
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState<{ is_open: boolean; status: string }>({ is_open: false, status: "CLOSED" });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchTimeout = useRef<any>(null);

  // ── Market Status ──────────────────────────────────────────────
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/market/status");
        const json = await res.json();
        if (json.success) setMarketStatus(json.data);
      } catch (err) {
        console.error("Market status fetch failed", err);
      }
    };

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  // ── Notifications ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/notifications?user_id=${user.id}`);
        const json = await res.json();
        if (json.success) setNotifications(json.data);
      } catch (err) {
        console.error("Notifications fetch failed", err);
      }
    };
    fetchNotifications();
  }, [user]);

  const markRead = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {}
  };

  // ── Search ─────────────────────────────────────────────────────
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/search/stocks?q=${searchQuery}`);
        const json = await res.json();
        if (json.success) setSearchResults(json.data);
      } catch (err) {}
      setIsSearching(false);
    }, 400);

    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  return (
    <header className="h-16 bg-card border-b border-white/[0.05] flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-card/80">
      
      {/* Search Section */}
      <div className="relative group">
        <div className="flex items-center gap-3 bg-accent/50 hover:bg-accent rounded-lg px-3 py-2 w-80 border border-white/5 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20 transition-all duration-200">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks: RELIANCE, TCS..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
          {isSearching ? (
            <Loader2 className="w-3 h-3 text-gold animate-spin" />
          ) : (
            <kbd className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded font-mono border border-white/5">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 w-full bg-card border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {searchResults.map((s) => (
              <button
                key={s.symbol}
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                <div>
                  <p className="text-xs font-bold text-white">{s.symbol}</p>
                  <p className="text-[10px] text-muted-foreground">{s.name}</p>
                </div>
                <TrendingUp className="w-3 h-3 text-profit opacity-50" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Market Status */}
        <div className={`hidden sm:flex items-center gap-2 border rounded-lg px-3 py-1.5 transition-all ${marketStatus.is_open ? 'bg-profit/5 border-profit/10' : 'bg-muted/10 border-white/5'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${marketStatus.is_open ? 'bg-profit animate-pulse' : 'bg-muted-foreground'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${marketStatus.is_open ? 'text-profit' : 'text-muted-foreground'}`}>
            Market {marketStatus.status}
          </span>
          {marketStatus.is_open && <TrendingUp className="w-3 h-3 text-profit" />}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative p-2 transition-all rounded-full group ${notifOpen ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5 group-hover:rotate-6 transition-transform" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crimson rounded-full ring-2 ring-card animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-white/5 bg-accent/30 flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Notifications</h3>
                <span className="text-[10px] text-muted-foreground">{notifications.filter(n => !n.read).length} Unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">No alerts yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markRead(n.id)}
                      className={`p-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer relative ${!n.read ? 'bg-white/[0.03]' : ''}`}
                    >
                      {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold" />}
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-profit' : n.type === 'warning' ? 'bg-gold' : 'bg-crimson'}`} />
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                      </div>
                      <p className="text-[9px] text-muted-foreground/50 mt-2 font-mono">{new Date(n.created_at).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${userMenuOpen ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/20 to-crimson/20 flex items-center justify-center border border-white/10 overflow-hidden">
              <User className="w-4 h-4 text-gold" />
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in duration-200">
              <div className="px-3 py-3 border-b border-white/5 mb-1 bg-white/[0.02] rounded-t-lg">
                <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">Trading Account</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{user?.email || "Premium Trader"}</p>
              </div>
              <button 
                onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
              <button 
                onClick={() => { signOut(); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-crimson hover:bg-crimson/10 rounded-lg transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
