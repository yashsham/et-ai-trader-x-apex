import { Zap, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <div className="ai-card p-8 relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-crimson/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded gradient-crimson-gold flex items-center justify-center">
            <Zap className="w-3 h-3 text-foreground" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-gold">
            AI-Powered Intelligence
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          AI Market Intelligence Engine
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mb-6">
          Find opportunities before the market does. Real-time AI analysis across 5,000+ stocks
          with 84.2% accuracy over the last 200 sessions.
        </p>

        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-crimson-gold text-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-crimson">
          Analyze Market Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
