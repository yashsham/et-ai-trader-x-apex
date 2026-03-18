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
          Autonomous AI Decision Engine
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mb-6">
          Beyond analysis. Direct execution intelligence. Our AGENTS scan, reason, and act across 5,000+ assets with unmatched precision.
        </p>
      </div>
    </div>
  );
}
