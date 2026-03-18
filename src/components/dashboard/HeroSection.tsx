import { Zap, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <div className="ai-card p-10 relative overflow-hidden ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
      {/* Background gradient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-crimson/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gold/10 rounded-full blur-[100px]" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-crimson-gold flex items-center justify-center shadow-lg shadow-crimson/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gold/80 border-l border-white/20 pl-3">
            Elite Execution Engine
          </span>
        </div>

        <h1 className="font-display text-5xl font-black text-white mb-6 tracking-tight italic leading-[1.1]">
          ET AI Trader X: <span className="text-gold drop-shadow-[0_0_30px_rgba(212,163,47,0.4)]">Decision Engine</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mb-10 font-medium leading-relaxed opacity-90">
          “We are not helping users analyze markets… <span className="text-white font-extrabold underline decoration-gold/50 underline-offset-4">we are helping them take decisions instantly.</span>”
        </p>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            System Status: <span className="text-profit pulse-live ml-1">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
