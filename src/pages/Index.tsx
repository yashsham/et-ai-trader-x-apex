import { AppLayout } from "@/components/AppLayout";
import { AIDecisionStrip } from "@/components/dashboard/AIDecisionStrip";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { AIAlerts } from "@/components/dashboard/AIAlerts";
import { SentimentGauge } from "@/components/dashboard/SentimentGauge";
import { AgentsActivity } from "@/components/dashboard/AgentsActivity";
import { AutoAnalyzeEngine } from "@/components/dashboard/AutoAnalyzeEngine";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
        <AIDecisionStrip />
        
        <section className="space-y-12 mb-16">
          <HeroSection />
          <AgentsActivity />
        </section>

        <section className="py-20 border-y border-white/[0.05] bg-white/[0.01] -mx-6 px-10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-crimson/5 blur-[120px] pointer-events-none" />
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl font-black text-foreground mb-4 font-display tracking-tight uppercase italic">Autonomous Market Reasoning</h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium opacity-80">
              Engage the multi-agent swarm to detect institutional flow and high-conviction breakout patterns before they hit the mainstream.
            </p>
          </div>
          <div className="relative z-10">
            <AutoAnalyzeEngine />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketOverview />
          </div>
          <SentimentGauge />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopMovers />
          <AIAlerts />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
