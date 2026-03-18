import { Zap, ArrowUpRight } from "lucide-react";

const alerts = [
  {
    id: 1,
    stock: "RELIANCE",
    signal: "Breakout detected above ₹2,450 resistance",
    confidence: 92,
    time: "2 min ago",
    type: "Breakout",
  },
  {
    id: 2,
    stock: "HDFCBANK",
    signal: "Unusual volume spike — insider activity suspected",
    confidence: 78,
    time: "12 min ago",
    type: "Volume",
  },
  {
    id: 3,
    stock: "TATASTEEL",
    signal: "AI predicts 6.2% upside in 5 trading sessions",
    confidence: 85,
    time: "28 min ago",
    type: "AI Prediction",
  },
  {
    id: 4,
    stock: "INFY",
    signal: "Positive earnings surprise — EPS beat by 12%",
    confidence: 88,
    time: "45 min ago",
    type: "News Impact",
  },
];

export function AIAlerts() {
  return (
    <div className="ai-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">AI Alerts</h3>
        <span className="flex items-center gap-1 text-xs text-crimson">
          <Zap className="w-3 h-3" /> Live
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg bg-accent border transition-all duration-150 hover:border-white/20 cursor-pointer ${
              alert.confidence > 85
                ? "border-crimson/30 hover:glow-crimson"
                : "border-white/[0.05]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono-data text-sm font-bold text-foreground">
                  {alert.stock}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-gold font-medium">
                  {alert.type}
                </span>
              </div>
              <span className="font-mono-data text-xs text-gold font-semibold">
                {alert.confidence}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{alert.signal}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">{alert.time}</span>
              <button className="text-[10px] text-crimson flex items-center gap-0.5 hover:underline">
                View <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
