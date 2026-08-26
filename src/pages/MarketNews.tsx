import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api-config";
import { ArrowUpRight, Clock, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsItem {
  id: number;
  headline: string;
  source: string;
  time: string;
  impact: string;
  summary: string;
  sector: string;
  url: string;
}

const impactColors: Record<string, string> = {
  High: "text-crimson bg-crimson/10",
  Medium: "text-gold bg-gold/10",
  Low: "text-muted-foreground bg-muted",
};

const MarketNews = () => {
  const { t, language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/market/news?lang=${language}`);
        const json = await res.json();
        if (json.success && json.data) {
          setNews(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch market news", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [language]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t('news')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('news_desc')}
          </p>
        </div>

        {loading ? (
          <div className="ai-card p-12 flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
          </div>
        ) : (
          <div className="space-y-4">
            {news.length === 0 && (
              <div className="ai-card p-8 text-center text-muted-foreground">
                {t('no_insights')}
              </div>
            )}
            {(news || []).map((item: any) => {
              const headline = item.headline || item.title || "Market Institutional Flow Update";
              const summary = item.summary || item.description || "Institutional order flows remain steady with liquidity support.";
              const source = item.source || "Market Intel";
              const time = item.time || (item.published_at ? new Date(item.published_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Recent");
              const impact = item.impact || "Medium";
              const sector = item.sector || "General Market";

              return (
                <a
                  key={item.id || headline}
                  href={item.url && item.url !== '#' ? item.url : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ai-card p-5 group cursor-pointer block no-underline"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${impactColors[impact] || impactColors["Medium"]}`}>
                          {impact} {t('risk_label')}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {sector}
                        </span>
                      </div>

                      <h3 className="font-editorial text-base font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                        {headline}
                      </h3>

                      <p className="text-sm text-muted-foreground/80 leading-relaxed mb-4 italic border-l-2 border-gold/30 pl-3">
                        {summary}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="font-semibold text-foreground/60">{source}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {time}
                          </span>
                          <span>·</span>
                          <span className="text-gold/50 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Summarized
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-[10px] text-gold font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          Read Source <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MarketNews;
