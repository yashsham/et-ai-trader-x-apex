import { AppLayout } from "@/components/AppLayout";
import { ArrowUpRight, Clock, TrendingUp } from "lucide-react";

const news = [
  {
    id: 1,
    headline: "RBI Keeps Repo Rate Unchanged — Banking Stocks Rally",
    source: "Economic Times",
    time: "15 min ago",
    impact: "High",
    summary: "RBI maintains status quo on rates. HDFC Bank, ICICI Bank, and SBI see buying interest as credit growth expectations remain intact.",
    sector: "Banking",
  },
  {
    id: 2,
    headline: "Reliance Jio Plans 5G Expansion to Tier-3 Cities",
    source: "Mint",
    time: "42 min ago",
    impact: "Medium",
    summary: "Jio announces ₹25,000 crore investment in 5G infra for smaller cities. Positive for Reliance but capex concerns remain.",
    sector: "Telecom",
  },
  {
    id: 3,
    headline: "IT Sector Faces Headwinds — US Recession Fears Resurface",
    source: "Business Standard",
    time: "1 hr ago",
    impact: "High",
    summary: "Weak US jobs data triggers sell-off in IT stocks. Infosys, TCS, and Wipro down 1-2%. AI adoption may offset revenue concerns.",
    sector: "IT",
  },
  {
    id: 4,
    headline: "Tata Motors EV Sales Jump 45% YoY",
    source: "CNBC-TV18",
    time: "2 hr ago",
    impact: "Medium",
    summary: "Strong EV numbers boost sentiment. Nexon EV and Punch EV lead sales. Market share grows to 68% in domestic EV segment.",
    sector: "Auto",
  },
  {
    id: 5,
    headline: "SEBI Proposes New F&O Margin Rules",
    source: "Moneycontrol",
    time: "3 hr ago",
    impact: "Low",
    summary: "Draft circular suggests higher margins for weekly expiry options. Impact expected to be limited for institutional traders.",
    sector: "Regulatory",
  },
];

const impactColors: Record<string, string> = {
  High: "text-crimson bg-crimson/10",
  Medium: "text-gold bg-gold/10",
  Low: "text-muted-foreground bg-muted",
};

const MarketNews = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Market News</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-curated news with impact analysis
          </p>
        </div>

        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="ai-card p-5 group cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${impactColors[item.impact]}`}>
                      {item.impact} Impact
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {item.sector}
                    </span>
                  </div>

                  <h3 className="font-editorial text-base font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                    {item.headline}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketNews;
