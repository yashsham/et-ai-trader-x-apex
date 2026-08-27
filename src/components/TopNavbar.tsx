import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, TrendingUp, LogOut, Settings as SettingsIcon, ChevronDown, Loader2, Globe, CheckCheck, X, Sparkles, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface StockResult {
  symbol: string;
  name: string;
  sector: string;
}

const LOCAL_STOCKS: StockResult[] = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy & Retail" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors Ltd", sector: "Auto & EV" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", sector: "IT Services" },
  { symbol: "INFY.NS", name: "Infosys Ltd", sector: "IT Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd", sector: "Banking & Finance" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd", sector: "Banking & Finance" },
  { symbol: "SBIN.NS", name: "State Bank of India", sector: "Banking & Finance" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd", sector: "Telecom" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance Ltd", sector: "Financials" },
  { symbol: "ITC.NS", name: "ITC Ltd", sector: "FMCG" },
  { symbol: "AXISBANK.NS", name: "Axis Bank Ltd", sector: "Banking & Finance" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", sector: "Banking & Finance" },
  { symbol: "WIPRO.NS", name: "Wipro Ltd", sector: "IT Services" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki India", sector: "Automotive" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical", sector: "Healthcare" },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints Ltd", sector: "Consumer Goods" },
  { symbol: "TITAN.NS", name: "Titan Company Ltd", sector: "Consumer Luxury" },
  { symbol: "LT.NS", name: "Larsen & Toubro Ltd", sector: "Engineering & Infra" },
  { symbol: "NIFTY50", name: "Nifty 50 Index", sector: "Equity Index" },
  { symbol: "BTC-USD", name: "Bitcoin USD", sector: "Crypto Asset" },
  { symbol: "ETH-USD", name: "Ethereum USD", sector: "Crypto Asset" },
];

export function TopNavbar() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, languageLabel, t } = useLanguage();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [marketStatus, setMarketStatus] = useState<{ is_open: boolean; status: string }>({ is_open: true, status: "LIVE" });
  
  // Realtime Notifications
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "n1",
      type: "success",
      message: "🚨 High Conviction Signal: BUY RELIANCE at ₹2,450 (Target: ₹2,620)",
      created_at: new Date().toISOString(),
      read: false,
      action_url: "/radar"
    },
    {
      id: "n2",
      type: "warning",
      message: "📈 Breakout Alert: TATAMOTORS crossed 50-EMA with +8.2% upside potential",
      created_at: new Date(Date.now() - 600000).toISOString(),
      read: false,
      action_url: "/chart?symbol=TATAMOTORS.NS"
    },
    {
      id: "n3",
      type: "info",
      message: "⚡ AI Engine: Groq Active (openai/gpt-oss-20b) · NVIDIA NIM Standby",
      created_at: new Date(Date.now() - 1800000).toISOString(),
      read: true,
      action_url: "/settings"
    },
    {
      id: "n4",
      type: "success",
      message: "✅ Target Achieved: HDFCBANK reached +6.2% target level",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      action_url: "/history"
    }
  ]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const searchTimeout = useRef<any>(null);

  // ── Keyboard Shortcut ⌘K / Ctrl+K ──────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchResults([]);
        setNotifOpen(false);
        setUserMenuOpen(false);
        setLangMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Outside Click Listener ────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Market Status Polling ──────────────────────────────────────
  useEffect(() => {
    const fetchMarketStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/market/status`);
        const json = await res.json();
        if (json.success && json.data) {
          setMarketStatus(json.data);
        }
      } catch (err) {
        console.error("Market status fetch failed", err);
      }
    };

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Realtime Notifications Polling (Every 10 seconds) ──────────
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const url = user ? `${API_BASE_URL}/api/v1/notifications?user_id=${user.id}` : `${API_BASE_URL}/api/v1/notifications`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setNotifications(json.data);
        }
      } catch (err) {
        console.error("Notifications fetch failed", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s Realtime Polling
    return () => clearInterval(interval);
  }, [user]);

  const markRead = async (id: string) => {
    try {
      fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, { method: "POST" }).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {}
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setNotifOpen(false);
    toast.info("Notifications cleared.");
  };

  // ── Search & Filter Logic ──────────────────────────────────────
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    const q = searchQuery.trim().toLowerCase();
    if (q.length < 1) {
      setSearchResults([]);
      setSelectedIndex(-1);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Instant Local Search Filter
    const localMatches = LOCAL_STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
    );

    setSearchResults(localMatches);
    setSelectedIndex(-1);

    // Asynchronous Backend Search Call
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/search/stocks?q=${encodeURIComponent(q)}&lang=${language}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          // Merge local and backend results without duplicates
          const mergedMap = new Map<string, StockResult>();
          localMatches.forEach(item => mergedMap.set(item.symbol, item));
          json.data.forEach((item: StockResult) => mergedMap.set(item.symbol, item));
          setSearchResults(Array.from(mergedMap.values()));
        }
      } catch (err) {}
      setIsSearching(false);
    }, 200);

    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery, language]);

  const handleSelectSymbol = (sym: string) => {
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/chart?symbol=${encodeURIComponent(sym)}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleSelectSymbol(searchResults[selectedIndex].symbol);
      } else if (searchQuery.trim() !== "") {
        handleSelectSymbol(searchQuery.trim().toUpperCase());
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-card border-b border-white/[0.05] flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-card/80">
      
      {/* Search Section */}
      <div className="relative group" ref={searchContainerRef}>
        <div className="flex items-center gap-3 bg-accent/50 hover:bg-accent rounded-lg px-3 py-2 w-72 sm:w-80 md:w-96 border border-white/5 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20 transition-all duration-200">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t('search_placeholder') || "Search Stock / Token..."}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-mono-data"
          />
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 text-gold animate-spin shrink-0" />
          ) : (
            <kbd className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded font-mono border border-white/5 shrink-0 hidden sm:inline">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 w-full bg-card border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto custom-scrollbar">
            <div className="px-3 py-1.5 text-[9px] font-black text-gold uppercase tracking-widest border-b border-white/5 flex items-center justify-between">
              <span>Matching Tickers</span>
              <span>Press Enter to Select</span>
            </div>
            {searchResults.map((s, idx) => (
              <button
                key={s.symbol}
                onClick={() => handleSelectSymbol(s.symbol)}
                className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left border-b border-white/[0.02] last:border-0 ${
                  selectedIndex === idx ? "bg-gold/15 text-white" : "hover:bg-white/5 text-foreground/90"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold font-mono text-white">{s.symbol}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-accent text-muted-foreground font-mono">
                      {s.sector}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.name}</p>
                </div>
                <div className="flex items-center gap-1 text-gold text-xs font-semibold opacity-70 group-hover:opacity-100">
                  <span className="text-[10px]">Analyze</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Market Status */}
        <div className={`hidden sm:flex items-center gap-2 border rounded-lg px-3 py-1.5 transition-all ${marketStatus.is_open ? 'bg-profit/5 border-profit/10' : 'bg-muted/10 border-white/5'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${marketStatus.is_open ? 'bg-profit animate-pulse' : 'bg-muted-foreground'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${marketStatus.is_open ? 'text-profit' : 'text-muted-foreground'}`}>
            {marketStatus.is_open ? t('market_open') || "MARKET LIVE" : t('market_closed') || "MARKET CLOSED"}
          </span>
          {marketStatus.is_open && <TrendingUp className="w-3 h-3 text-profit" />}
        </div>

        {/* Realtime Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative p-2 transition-all rounded-full group cursor-pointer ${
              notifOpen ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
            title="Realtime AI Alerts"
          >
            <Bell className="w-5 h-5 group-hover:rotate-6 transition-transform text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-crimson rounded-full ring-2 ring-card animate-pulse shadow-[0_0_8px_hsl(var(--crimson))]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-white/5 bg-accent/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('notifications') || "Realtime AI Alerts"}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-gold hover:underline font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark Read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-muted-foreground hover:text-crimson font-mono cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                    <Bell className="w-6 h-6 text-muted-foreground/40" />
                    <span>No active alerts right now.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        markRead(n.id);
                        if (n.action_url) navigate(n.action_url);
                      }}
                      className={`p-3.5 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer relative ${!n.read ? 'bg-white/[0.03]' : 'opacity-70'}`}
                    >
                      {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gold" />}
                      <div className="flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${n.type === 'success' ? 'bg-profit' : n.type === 'warning' ? 'bg-gold' : 'bg-crimson'}`} />
                        <div className="flex-1">
                          <p className="text-xs text-foreground/90 font-medium leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-muted-foreground mt-1 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border cursor-pointer ${
              langMenuOpen ? 'bg-accent border-gold/30 text-white' : 'text-muted-foreground border-white/5 hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4 text-gold" />
            <span className="text-[11px] font-bold">{languageLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/5 mb-1 bg-white/[0.02] rounded-t-lg">
                <p className="text-[9px] font-black text-gold uppercase tracking-widest">{t('select_language') || "Select Language"}</p>
              </div>
              <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                {(['English', 'Hindi', 'Gujarati', 'Marathi', 'Bengali', 'Kannada', 'Tamil', 'Telugu'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangMenuOpen(false);
                      toast.success(`Language changed to ${lang}`);
                    }}
                    className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all cursor-pointer ${
                      language === lang ? 'bg-gold/10 text-gold font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{lang}</span>
                    {language === lang && <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(255,184,0,0.5)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all cursor-pointer ${
              userMenuOpen ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/20 to-crimson/20 flex items-center justify-center border border-white/10 overflow-hidden">
              <User className="w-4 h-4 text-gold" />
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="px-3 py-3 border-b border-white/5 mb-1 bg-white/[0.02] rounded-t-lg">
                <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">{t('trading_account') || "Trading Account"}</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{user?.email || "Premium Trader"}</p>
              </div>
              <button 
                onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>{t('account_settings') || "Account Settings"}</span>
              </button>
              <button 
                onClick={() => { signOut(); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-crimson hover:bg-crimson/10 rounded-lg transition-colors mt-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout') || "Log Out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
