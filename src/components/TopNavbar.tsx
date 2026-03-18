import { Search, Bell, User, TrendingUp } from "lucide-react";

export function TopNavbar() {
  return (
    <header className="h-16 bg-card border-b border-white/[0.05] flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-3 bg-accent rounded-lg px-3 py-2 w-80">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stocks: RELIANCE, TCS..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
        />
        <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Market Status */}
        <div className="flex items-center gap-2 bg-accent rounded-lg px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-profit pulse-live" />
          <span className="text-xs font-medium text-foreground">Market Live</span>
          <TrendingUp className="w-3 h-3 text-profit" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-crimson rounded-full" />
        </button>

        {/* Profile */}
        <button className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
