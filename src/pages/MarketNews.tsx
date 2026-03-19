import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api-config";
import { ArrowUpRight, Clock, Loader2 } from "lucide-react";

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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/market/news`);
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
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Market News</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live AI-curated news with impact analysis
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
                No recent news found.
              </div>
            )}
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url && item.url !== '#' ? item.url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="ai-card p-5 group cursor-pointer block no-underline"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${impactColors[item.impact] || impactColors["Medium"]}`}>
                        {item.impact} Impact
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {item.sector}
                      </span>
                    </div>

                    <h3 className="font-editorial text-base font-semibold text-foreground mb-2 group-hover:text-gold transition-colors">
                      {item.headline}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
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
              </a>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MarketNews;
