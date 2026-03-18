import { AppLayout } from "@/components/AppLayout";
import { AIDecisionStrip } from "@/components/dashboard/AIDecisionStrip";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { AIAlerts } from "@/components/dashboard/AIAlerts";
import { SentimentGauge } from "@/components/dashboard/SentimentGauge";

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <AIDecisionStrip />
        <HeroSection />
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
