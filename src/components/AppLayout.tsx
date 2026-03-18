import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className="transition-all duration-200 flex flex-col min-h-screen"
        style={{
          marginLeft: collapsed ? 72 : 240,
          transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        <TopNavbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
