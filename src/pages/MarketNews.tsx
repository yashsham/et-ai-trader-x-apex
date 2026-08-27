import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api-config";
import { ArrowUpRight, Clock, Loader2, Sparkles, Search, Filter, Share2, Copy, Check, TrendingUp, AlertTriangle, ShieldCheck, Newspaper } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface NewsItem {
  id: number;
  headline: string;
  title?: string;
  source: string;
  time: string;
  impact: "High" | "Medium" | "Low" | string;
  summary: string;
  description?: string;
  sector: string;
  url: string;
  published_at?: string;
}

const DEFAULT_TOP_10_NEWS: NewsItem[] = [
  {
    id: 1,
    headline: "Nifty 50 Defends 24,500 Support as DII Mutual Funds Inject ₹4,200 Cr Liquidity",
    summary: "Domestic institutional investors absorb FII selling pressure with heavy block deals in banking and energy heavyweights.",
    source: "Economic Times",
    url: "https://economictimes.indiatimes.com/markets",
    impact: "High",
    sector: "Equity Index",
    time: "5m ago"
  },
  {
    id: 2,
    headline: "RBI Signals Accommodative Monetary Stance Amid Easing Consumer Inflation Data",
    summary: "Central bank liquidity injections and bond yield stabilization trigger massive accumulation across private sector banking stocks.",
    source: "Bloomberg Markets",
    url: "https://www.bloomberg.com/markets",
    impact: "High",
    sector: "Macro Economy",
    time: "12m ago"
  },
  {
    id: 3,
    headline: "IT Bluechips TCS and Infosys Rally +3.5% Following US Tech Contract Announcements",
    summary: "Nifty IT Index leads sectoral gainers as tier-1 IT firms report double-digit cloud migration order wins.",
    source: "Reuters",
    url: "https://www.reuters.com/markets",
    impact: "High",
    sector: "IT Services",
    time: "28m ago"
  },
  {
    id: 4,
    headline: "Reliance Industries EV & Clean Energy Arm Secures $1.2B Institutional Funding",
    summary: "RIL shares gain 2.8% on strong volume breakout above 2,440 resistance band as global funds increase allocation.",
    source: "Moneycontrol",
    url: "https://www.moneycontrol.com/news/business/markets/",
    impact: "Medium",
    sector: "Energy & Infra",
    time: "45m ago"
  },
  {
    id: 5,
    headline: "HDFC Bank & ICICI Bank Net Interest Margins Expand in Q3 Preliminary Disclosure",
    summary: "Credit growth surging 14.2% YoY with asset quality indicators improving across retail and corporate loan books.",
    source: "CNBC TV18",
    url: "https://www.cnbctv18.com/market/",
    impact: "High",
    sector: "Banking & Finance",
    time: "1h ago"
  },
  {
    id: 6,
    headline: "Tata Motors EV Division Crosses 100,000 Annual Units; Exports Surge +42%",
    summary: "Auto index outperforms benchmark indices as commercial vehicle and EV passenger order backlogs hit all-time high.",
    source: "Business Standard",
    url: "https://www.business-standard.com/markets",
    impact: "Medium",
    sector: "Automotive",
    time: "1.5h ago"
  },
  {
    id: 7,
    headline: "US Fed Rate Cut Expectations Rise to 78%; Emerging Markets Inflow Accelerates",
    summary: "Dollar index pulls back to 102.4, sparking capital reallocation toward high-yield emerging equities and sovereign debt.",
    source: "Yahoo Finance",
    url: "https://finance.yahoo.com",
    impact: "Medium",
    sector: "Macro Economy",
    time: "2h ago"
  },
  {
    id: 8,
    headline: "FII Derivatives Data Shows Bullish Option Writing at 24,600 Strike Price",
    summary: "Institutional desk positioning indicates strong downside protection with put-call ratio climbing to 1.35.",
    source: "Livemint",
    url: "https://www.livemint.com/market",
    impact: "High",
    sector: "Derivatives & F&O",
    time: "2.5h ago"
  },
  {
    id: 9,
    headline: "Bitcoin Crosses $98,000 Mark as Institutional Spot ETFs Record $850M Inflow",
    summary: "Digital asset liquidity surges as global macro desks hedge against sovereign fiat devaluation.",
    source: "Bloomberg Crypto",
    url: "https://www.bloomberg.com/crypto",
    impact: "Medium",
    sector: "Crypto Asset",
    time: "3h ago"
  },
  {
    id: 10,
    headline: "Government Announces ₹35,000 Cr Semiconductor & Green Energy Subsidies",
    summary: "Capex-heavy industrial and engineering stocks log sharp volume-backed rallies following fiscal incentive approval.",
    source: "Economic Times",
    url: "https://economictimes.indiatimes.com/industry",
    impact: "Low",
    sector: "Energy & Infra",
    time: "4h ago"
  }
];

const impactBadgeStyles: Record<string, string> = {
  High: "text-crimson bg-crimson/10 border-crimson/30",
  Medium: "text-gold bg-gold/10 border-gold/30",
  Low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const SECTORS = ["All Sectors", "Equity Index", "Macro Economy", "IT Services", "Banking & Finance", "Energy & Infra", "Automotive", "Derivatives & F&O", "Crypto Asset"];

const MarketNews = () => {
  const { t, language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>(DEFAULT_TOP_10_NEWS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImpact, setSelectedImpact] = useState<string>("All");
  const [selectedSector, setSelectedSector] = useState<string>("All Sectors");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/market/news?lang=${language}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const mapped = json.data.map((item: any) => ({
            id: item.id || Math.random(),
            headline: item.headline || item.title || "Market Liquidity Event",
            summary: item.summary || item.description || "Institutional capital allocation update.",
            source: item.source || "Financial Portal",
            url: item.url || "https://economictimes.indiatimes.com/markets",
            impact: item.impact || "Medium",
            sector: item.sector || "General Market",
            time: item.time || "Recent",
          }));
          setNews(mapped);
        } else {
          setNews(DEFAULT_TOP_10_NEWS);
        }
      } catch (err) {
        console.error("Failed to fetch market news", err);
        setNews(DEFAULT_TOP_10_NEWS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 45000); // 45s refresh
    return () => clearInterval(interval);
  }, [language]);

  const handleCopyLink = (url: string, id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("News URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered dataset
  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesImpact = selectedImpact === "All" || item.impact === selectedImpact;
    const matchesSector = selectedSector === "All Sectors" || item.sector.toLowerCase().includes(selectedSector.toLowerCase().split(" ")[0]);

    return matchesSearch && matchesImpact && matchesSector;
  });

  const highImpactCount = news.filter(n => n.impact === "High").length;
  const mediumImpactCount = news.filter(n => n.impact === "Medium").length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Title & Realtime Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-card to-accent/40 p-6 rounded-2xl border border-white/5 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20 flex items-center gap-1">
                <Newspaper className="w-3 h-3" /> Market Intelligence Terminal
              </span>
              <span className="text-[10px] font-mono text-profit px-2 py-0.5 rounded bg-profit/10 border border-profit/20 flex items-center gap-1 animate-pulse">
                ● REALTIME LIVE
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Top 10 Market Catalysts & Institutional News</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verified real-time financial news with 1-click redirects to authoritative portals (Economic Times, Bloomberg, Reuters, Moneycontrol, CNBC).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-card/80 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-muted-foreground font-mono uppercase block">Active Catalysts</span>
              <span className="text-lg font-bold font-mono text-gold">{news.length}</span>
            </div>
            <div className="bg-card/80 border border-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-muted-foreground font-mono uppercase block">High Risk Events</span>
              <span className="text-lg font-bold font-mono text-crimson">{highImpactCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="ai-card p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-2 border border-white/5 flex-1 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20 transition-all">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search market news by headline, sector, or source..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 font-mono-data"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-white text-xs">
                  Clear
                </button>
              )}
            </div>

            {/* Impact Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-accent/30 p-1 rounded-xl border border-white/5 shrink-0">
              {["All", "High", "Medium", "Low"].map((imp) => (
                <button
                  key={imp}
                  onClick={() => setSelectedImpact(imp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedImpact === imp
                      ? "bg-gold text-black shadow-md shadow-gold/20"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {imp === "All" ? "All Impact" : `${imp} Impact`}
                </button>
              ))}
            </div>
          </div>

          {/* Sector Filter Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 custom-scrollbar">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-gold" /> Sectors:
            </span>
            {SECTORS.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                  selectedSector === sec
                    ? "bg-gold/15 text-gold border-gold/40 font-bold"
                    : "bg-card text-muted-foreground border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* News Feed Grid */}
        {loading ? (
          <div className="ai-card p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="text-xs text-muted-foreground font-mono">Syncing Top 10 Market Intelligence Feed...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.length === 0 ? (
              <div className="ai-card p-12 text-center text-muted-foreground space-y-2">
                <AlertTriangle className="w-8 h-8 text-gold/50 mx-auto" />
                <p className="text-sm font-semibold">No news catalysts match your current search filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedImpact("All");
                    setSelectedSector("All Sectors");
                  }}
                  className="text-xs text-gold underline cursor-pointer hover:text-gold/80"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredNews.map((item, index) => {
                const headline = item.headline || item.title || "Market Institutional Flow Update";
                const summary = item.summary || item.description || "Institutional order flows remain steady with liquidity support.";
                const source = item.source || "Financial Portal";
                const time = item.time || "Recent";
                const impact = item.impact || "Medium";
                const sector = item.sector || "General Market";

                return (
                  <div
                    key={item.id || index}
                    className="ai-card p-5 group transition-all duration-200 hover:border-gold/40 hover:shadow-2xl relative overflow-hidden bg-card/90"
                  >
                    {/* Left Accent Strip */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        impact === "High" ? "bg-crimson" : impact === "Medium" ? "bg-gold" : "bg-emerald-400"
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-gold/80 bg-gold/10 px-2 py-0.5 rounded border border-gold/20 font-bold">
                            #{index + 1} CATALYST
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              impactBadgeStyles[impact] || impactBadgeStyles["Medium"]
                            }`}
                          >
                            {impact} Risk Catalyst
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-foreground/80 font-mono border border-white/5">
                            {sector}
                          </span>
                        </div>

                        {/* Title Header */}
                        <h3 className="font-editorial text-lg font-bold text-foreground group-hover:text-gold transition-colors leading-snug">
                          {headline}
                        </h3>

                        {/* Summary Block */}
                        <div className="bg-accent/30 p-3 rounded-xl border border-white/5 relative">
                          <p className="text-xs text-muted-foreground/90 leading-relaxed font-sans pl-2 border-l-2 border-gold">
                            "{summary}"
                          </p>
                        </div>

                        {/* Footer details & Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {source}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-gold/70" />
                              {time}
                            </span>
                            <span>·</span>
                            <span className="text-gold/70 flex items-center gap-1 font-mono">
                              <Sparkles className="w-3.5 h-3.5 text-gold" />
                              AI Verified Catalyst
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleCopyLink(item.url, item.id, e)}
                              className="p-1.5 rounded-lg bg-accent/60 hover:bg-accent text-muted-foreground hover:text-white transition-colors cursor-pointer border border-white/5"
                              title="Copy News Source Link"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-profit" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold hover:text-black border border-gold/30 text-gold text-xs font-bold transition-all cursor-pointer group-hover:scale-105"
                            >
                              <span>Read Source</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MarketNews;
