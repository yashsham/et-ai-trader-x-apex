import { useState } from "react";
import { Search, Bell, User, TrendingUp, LogOut, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TopNavbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-card border-b border-white/[0.05] flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-card/80">
      {/* Search */}
      <div className="flex items-center gap-3 bg-accent/50 hover:bg-accent rounded-lg px-3 py-2 w-80 border border-white/5 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20 transition-all duration-200">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stocks: RELIANCE, TCS..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
        />
        <kbd className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded font-mono border border-white/5">
          ⌘K
        </kbd>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Market Status */}
        <div className="hidden sm:flex items-center gap-2 bg-profit/5 border border-profit/10 rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-profit">Market Live</span>
          <TrendingUp className="w-3 h-3 text-profit" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-white/5 rounded-full group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crimson rounded-full ring-2 ring-card" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${userMenuOpen ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
          >
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center border border-white/10 overflow-hidden">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in duration-200">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Account</p>
                <p className="text-xs font-bold text-white truncate">Premium Trader</p>
              </div>
              <button 
                onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-crimson hover:bg-crimson/10 rounded-lg transition-colors mt-1">
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
