import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time Intelligence Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analysis_results',
        },
        (payload) => {
          const newSignal = payload.new;
          console.log("[Intelligence] New Signal Detected:", newSignal);

          if (newSignal.decision === 'BUY' || newSignal.decision === 'SELL') {
             toast.custom((t) => (
                <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl animate-in slide-in-from-right-8 ${
                   newSignal.decision === 'BUY' ? 'bg-profit/10 border-profit/20' : 'bg-loss/10 border-loss/20'
                }`}>
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      newSignal.decision === 'BUY' ? 'bg-profit text-white' : 'bg-loss text-white'
                   }`}>
                      <Zap className="w-5 h-5 fill-current" />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-black text-sm text-foreground uppercase tracking-tight">AI Signal Alert: {newSignal.symbol}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">Structured decision: {newSignal.decision}. Analysis complete.</p>
                      <button 
                         onClick={() => {
                            toast.dismiss(t);
                            navigate('/history');
                         }}
                         className="mt-2 text-[10px] font-bold text-gold uppercase flex items-center gap-1 hover:underline"
                      >
                         View Intelligence <ArrowRight className="w-3 h-3" />
                      </button>
                   </div>
                </div>
             ), { duration: 6000, position: 'top-right' });
          }

          // Trigger UI refresh for components like the AIDecisionStrip
          window.dispatchEvent(new CustomEvent('new-ai-signal', { detail: newSignal }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

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
