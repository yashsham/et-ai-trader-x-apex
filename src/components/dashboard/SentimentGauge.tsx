import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function SentimentGauge() {
  const [sentiment, setSentiment] = useState(50);
  const [label, setLabel] = useState("Neutral");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/market/sentiment");
        const json = await res.json();
        if (json.success && json.data) {
          setSentiment(json.data.score);
          setLabel(json.data.label);
        }
      } catch (err) {
        console.error("Failed to fetch sentiment", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="ai-card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-gold animate-spin opacity-50" />
      </div>
    );
  }

  // 0-100, 50 = neutral
  const angle = (sentiment / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="ai-card p-6 flex flex-col items-center justify-center">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
        Market Sentiment (Live News)
      </p>

      {/* Gauge */}
      <div className="relative w-48 h-24 mb-4">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(14 100% 50%)" />
              <stop offset="50%" stopColor="hsl(43 65% 53%)" />
              <stop offset="100%" stopColor="hsl(145 100% 39%)" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(220 20% 14%)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Active arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(sentiment / 100) * 251.2} 251.2`}
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 60 * Math.sin((-angle - 180 + 90) * Math.PI / 180)}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="4" fill="white" />
        </svg>
      </div>

      <div className="text-center">
        <span className={`font-mono-data text-2xl font-bold ${
          sentiment >= 65 ? "text-profit" : sentiment <= 35 ? "text-loss" : "text-gold"
        }`}>{sentiment}%</span>
        <p className={`text-sm font-medium mt-1 ${
          label === "Bullish" ? "text-profit" : label === "Bearish" ? "text-loss" : "text-gold"
        }`}>{label}</p>
      </div>

      <div className="flex justify-between w-full mt-3 px-2">
        <span className="text-[10px] text-loss">Bearish</span>
        <span className="text-[10px] text-gold">Neutral</span>
        <span className="text-[10px] text-profit">Bullish</span>
      </div>
    </div>
  );
}
