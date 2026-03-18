import { useState } from "react";
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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Opportunity Radar", icon: Radar, path: "/radar" },
  { title: "Chart Intelligence", icon: BarChart3, path: "/charts" },
  { title: "Portfolio Brain", icon: Brain, path: "/portfolio" },
  { title: "AI Assistant", icon: MessageSquare, path: "/assistant" },
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
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-white/[0.05] flex flex-col z-50 transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-crimson-gold flex items-center justify-center">
            <Zap className="w-4 h-4 text-foreground" />
          </div>
          {!collapsed && (
            <div className="font-display">
              <span className="text-sm font-bold text-foreground">ET AI</span>
              <span className="text-sm font-bold text-gold ml-1">Trader X</span>
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
