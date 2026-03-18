import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Search, 
  Newspaper, 
  TrendingUp, 
  Target, 
  ShieldAlert,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Brain,
  ArrowDown,
  BarChart3
} from "lucide-react";

const logs = [
  { agent: "Radar Agent", message: "Scanning 500+ stocks for institutional footprint...", type: "radar" },
  { agent: "Radar Agent", message: "Abnormal volume spike detected in RELIANCE (Something is cooking...)", type: "radar" },
  { agent: "News Agent", message: "Scraping global energy news and insider trade filings...", type: "news" },
  { agent: "News Agent", message: "Positive sentiment mismatch: News is good, but price hasn't reacted yet.", type: "news" },
  { agent: "Chart Agent", message: "Analyzing Fibonacci levels & RSI divergence...", type: "chart" },
  { agent: "Chart Agent", message: "Breakout confirm ho raha hai. Support strong hai at ₹2410.", type: "chart" },
  { agent: "Decision Agent", message: "Synthesizing signals. Match rate: 91.4%. Probability is High.", type: "decision" },
  { agent: "Action Agent", message: "Finalizing risk-adjusted entry/exit plan. Ready for reveal.", type: "action" },
];

export function AutoAnalyzeEngine() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setScannedCount(prev => {
          if (prev >= 542) {
            clearInterval(interval);
            return 542;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (isAnalyzing && currentStep < logs.length) {
      const timer = setTimeout(() => {
        if (currentStep === logs.length - 1) {
          setTimeout(() => {
            setIsAnalyzing(false);
            setIsRevealing(true);
            setTimeout(() => {
              setIsRevealing(false);
              setShowResult(true);
            }, 2000);
          }, 1000);
        }
        setCurrentStep(prev => prev + 1);
      }, 700 + Math.random() * 900);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, currentStep]);

  const handleStart = () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    setShowResult(false);
    setScannedCount(0);
    setIsRevealing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!isAnalyzing && !showResult && !isRevealing ? (
          <motion.div
            key="start-button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <button
              onClick={handleStart}
              className="group relative px-10 py-5 rounded-2xl gradient-crimson-gold text-white font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all glow-crimson flex items-center gap-4"
            >
              <Zap className="w-7 h-7 fill-white animate-pulse" />
              AI AUTO-ANALYZE MARKET
              <div className="absolute -inset-0.5 bg-gradient-to-r from-crimson to-gold rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            </button>
            <p className="text-muted-foreground text-sm font-medium">
              Start autonomous decision flow across 500+ real-time assets
            </p>
          </motion.div>
        ) : isAnalyzing ? (
          <motion.div
            key="analyzing-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-card p-6 min-h-[450px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  <Zap className="w-4 h-4 text-crimson absolute top-2 left-2 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg italic">Decision Engine Reasoning</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-profit animate-pulse">● LIVE</span>
                    <span className="text-xs text-muted-foreground font-mono">STOCKS SCANNED: <span className="text-gold tracking-widest font-black">{scannedCount}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-1">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">
                    NEURAL LINK: ACTIVE
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">LATENCY: 12ms</span>
              </div>
            </div>

            <div className="flex-1 space-y-5 font-mono-data overflow-y-auto max-h-[300px] custom-scrollbar px-2">
              {logs.slice(0, currentStep + 1).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  className="flex gap-4 items-start border-l-2 border-white/5 pl-4 py-1"
                >
                  <span className="text-muted-foreground/30 whitespace-nowrap text-[10px] mt-1">
                    [{new Date().toLocaleTimeString([], { hour12: false })}]
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${
                        log.agent === 'Radar Agent' ? 'text-blue-400' :
                        log.agent === 'News Agent' ? 'text-green-400' :
                        log.agent === 'Chart Agent' ? 'text-purple-400' :
                        'text-gold'
                      }`}>
                        {log.agent}
                      </span>
                      <div className="h-[1px] w-4 bg-white/10" />
                    </div>
                    <span className="text-base text-foreground/90 font-medium tracking-tight leading-snug">
                      {log.message}
                    </span>
                  </div>
                </motion.div>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>
          </motion.div>
        ) : isRevealing ? (
          <motion.div
            key="reveal-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-card p-6 min-h-[450px] flex flex-col items-center justify-center text-center gap-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full border-4 border-dashed border-gold flex items-center justify-center"
            >
              <Brain className="w-12 h-12 text-gold" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white italic tracking-tighter">SYNTHESIZING FINAL DECISION</h3>
              <p className="text-muted-foreground animate-pulse font-mono tracking-widest text-xs">
                CALCULATING OPTIMAL RISK-REWARD RATIO...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis-result"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="ai-card overflow-hidden border-gold/40 ring-2 ring-gold/10 shadow-[0_0_50px_-12px_hsl(var(--gold)/0.3)]"
          >
            <div className="bg-gradient-to-r from-gold/20 via-gold/5 to-transparent p-8 border-b border-gold/20 relative">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex flex-col items-end">
                  <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">AI Confidence</div>
                  <div className="text-4xl font-black text-profit drop-shadow-[0_0_15px_hsl(var(--profit)/0.5)]">91.4%</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-profit animate-ping" />
                  <span className="text-xs font-black text-gold uppercase tracking-[0.3em]">Autonomous Alpha Signal</span>
                </div>
                <h2 className="text-6xl font-black text-white tracking-tighter flex items-end gap-3">
                  RELIANCE
                  <span className="text-2xl text-muted-foreground font-medium tracking-normal mb-1">/ NSE</span>
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-profit/20 border border-profit/40 shadow-inner">
                <Zap className="w-5 h-5 text-profit fill-profit" />
                <span className="text-lg font-black text-profit uppercase italic">Strong Buy Recommendation</span>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black text-gold uppercase tracking-widest mb-4">
                    <Brain className="w-4 h-4" /> Core Reasoning (Hinglish Analysis)
                  </h4>
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-transparent rounded-full" />
                    <p className="text-base text-foreground/90 font-medium leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10 italic shadow-xl">
                      "Market mein abhi tak confusion hai, par humare agents ne clear trend detect kiya hai. **Breaking out above ₹2,410** with volume 3x above average. Sector rotation energy ki taraf shift ho raha hai, and RSI clear bullish divergence dikha raha hai. **Yeh chance miss nahi karna chahiye.**"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="ai-card p-5 bg-white/[0.03] border-white/5 hover:border-gold/30 transition-all">
                    <div className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Entry Zone</div>
                    <div className="text-xl font-black text-white">₹2,450 - 2465</div>
                  </div>
                  <div className="ai-card p-5 bg-white/[0.03] border-white/5 hover:border-profit/30 transition-all">
                    <div className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Target Price</div>
                    <div className="text-xl font-black text-profit flex items-center gap-1">
                      ₹2,650 <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
                    <ShieldAlert className="w-4 h-4" /> Risk Protection System
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-loss/30 bg-loss/10 shadow-[0_0_20px_-5px_hsl(var(--loss)/0.2)]">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-loss/80 uppercase">Mandatory Stop</span>
                        <span className="text-lg font-black text-white">₹2,380</span>
                      </div>
                      <div className="p-2 rounded-lg bg-loss/20">
                        <ArrowDown className="w-5 h-5 text-loss" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Recommended Size</span>
                        <span className="text-lg font-black text-white font-mono">8.5% Portfolio</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <button className="group relative w-full py-5 rounded-2xl gradient-crimson-gold text-white font-black text-xl hover:scale-[1.02] transition-all glow-crimson flex items-center justify-center gap-3">
                    <BarChart3 className="w-6 h-6 animate-bounce" />
                    SIMULATE TRADE PLAN
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => {
                      setShowResult(false);
                      setIsAnalyzing(false);
                      setIsRevealing(false);
                    }}
                    className="text-xs font-black text-muted-foreground hover:text-gold uppercase tracking-[0.2em] transition-colors"
                  >
                    RESET AGENT ENGINE
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
