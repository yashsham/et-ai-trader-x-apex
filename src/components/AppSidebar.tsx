import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Radar,
  BarChart3,
  Brain,
  MessageSquare,
  Newspaper,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Opportunity Radar", icon: Radar, path: "/radar" },
  { title: "Chart Intelligence", icon: BarChart3, path: "/charts" },
  { title: "Portfolio Brain", icon: Brain, path: "/portfolio" },
  { title: "AI Trading Assistant", icon: MessageSquare, path: "/assistant" },
  { title: "Market News", icon: Newspaper, path: "/news" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { user, signOut } = useAuth();
  const userName = user?.email?.split("@")[0] || "Trader";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-white/[0.05] flex flex-col z-50 transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }}
    >
      <div className="h-16 flex items-center px-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <img src="logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-[0_0_15px_-3px_var(--gold)]" />
          {!collapsed && (
            <div className="font-display flex flex-col">
              <span className="text-xs font-black text-foreground tracking-tighter uppercase opacity-80">ET AI</span>
              <span className="text-sm font-black text-gold tracking-tight -mt-1">Trader X</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors duration-150 group"
            activeClassName="bg-accent text-foreground border-l-[3px] border-crimson"
          >
            <item.icon className="w-5 h-5 shrink-0 group-hover:text-gold transition-colors" />
            {!collapsed && (
              <span className="text-sm font-medium truncate">{item.title}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="px-2 py-4 border-t border-white/[0.05]">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] ${collapsed ? "justify-center" : ""}`}>
           <div className="w-8 h-8 rounded-full bg-crimson/20 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4 text-crimson" />
           </div>
           {!collapsed && (
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-foreground truncate capitalize">{userName}</p>
               <p className="text-[10px] text-muted-foreground truncate opacity-60">Verified Alpha</p>
             </div>
           )}
           {!collapsed && (
             <button 
               onClick={signOut}
               className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-crimson transition-colors"
               title="Sign Out"
             >
               <LogOut className="w-4 h-4" />
             </button>
           )}
        </div>
        {collapsed && (
          <button 
            onClick={signOut}
            className="w-full mt-2 flex justify-center py-2 text-muted-foreground hover:text-crimson transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="h-12 flex items-center justify-center border-t border-white/[0.05] text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
