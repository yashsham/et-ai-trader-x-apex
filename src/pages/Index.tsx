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
        
        <section className="space-y-6">
          <HeroSection />
          <AgentsActivity />
        </section>

        <section className="py-12 border-y border-white/[0.05] bg-white/[0.01] -mx-6 px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-display">Autonomous Market Reasoning</h2>
            <p className="text-muted-foreground text-sm">Trigger the full agent swarm to identify high-conviction institutional trades.</p>
          </div>
          <AutoAnalyzeEngine />
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
