import { AppLayout } from "@/components/AppLayout";
import { AIDecisionStrip } from "@/components/dashboard/AIDecisionStrip";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { AIAlerts } from "@/components/dashboard/AIAlerts";
import { SentimentGauge } from "@/components/dashboard/SentimentGauge";
import { AgentsActivity } from "@/components/dashboard/AgentsActivity";
import { AutoAnalyzeEngine } from "@/components/dashboard/AutoAnalyzeEngine";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { AnalysisHistory } from "@/components/dashboard/AnalysisHistory";
import { ExecutiveSummaryCard } from "@/components/dashboard/ExecutiveSummaryCard";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
        <AIDecisionStrip />
        <div className="flex items-center gap-2 mb-2 group">
          <span className="demo-step-badge animate-pulse">{t('phase')} 1</span>
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] group-hover:text-gold transition-colors">{t('live_stream')}</span>
        </div>
        
        <section className="space-y-12 mb-16 relative">
          <div className="absolute -left-8 top-0 hidden xl:block">
            <div className="flex flex-col items-center gap-2">
              <span className="demo-step-badge rotate-90 origin-left mt-8">{t('phase')} 2</span>
              <div className="w-[1px] h-32 bg-gradient-to-b from-gold/50 to-transparent" />
            </div>
          </div>
          <ExecutiveSummaryCard />
          <HeroSection />
          <AgentsActivity />
        </section>

        {/* Database integrated Watchlist and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Watchlist />
          <AnalysisHistory />
        </div>

        <section className="py-20 border-y border-white/[0.05] bg-white/[0.01] -mx-6 px-10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-crimson/5 blur-[120px] pointer-events-none" />
          
          <div className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="demo-step-badge">{t('phase')} 3</span>
              <span className="text-[10px] font-black uppercase text-gold tracking-widest">{t('decision_agent')}</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-4 font-display tracking-tight uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{t('autonomous_reasoning')}</h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium opacity-80 leading-relaxed">
              {t('autonomous_desc')} <span className="text-white underline decoration-gold/40 underline-offset-4">{t('mission_sub')}</span>
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
