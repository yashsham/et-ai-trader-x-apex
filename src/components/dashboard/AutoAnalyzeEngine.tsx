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
  CheckCircle2
} from "lucide-react";

const logs = [
  { agent: "Radar Agent", message: "Scanning NIFTY 50 volume anomalies...", type: "radar" },
  { agent: "Radar Agent", message: "Found breakout pattern in RELIANCE (15m chart)", type: "radar" },
  { agent: "News Agent", message: "Analyzing recent press releases and sector news...", type: "news" },
  { agent: "News Agent", message: "Positive sentiment mismatch detected in energy sector", type: "news" },
  { agent: "Chart Agent", message: "Calculating RSI, MACD, and Fibonacci retracements...", type: "chart" },
  { agent: "Chart Agent", message: "Confirming support at ₹2410 with high buyer interest", type: "chart" },
  { agent: "Decision Agent", message: "Synthesizing signals. Confidence score: 91.4%", type: "decision" },
  { agent: "Action Agent", message: "Generating optimal trade plan with risk protection...", type: "action" },
];

export function AutoAnalyzeEngine() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isAnalyzing && currentStep < logs.length) {
      const timer = setTimeout(() => {
        if (currentStep === logs.length - 1) {
          setTimeout(() => {
            setIsAnalyzing(false);
            setShowResult(true);
          }, 1000);
        }
        setCurrentStep(prev => prev + 1);
      }, 600 + Math.random() * 800);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, currentStep]);

  const handleStart = () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    setShowResult(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!isAnalyzing && !showResult ? (
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
              Start autonomous decision flow across real-time signals
            </p>
          </motion.div>
        ) : isAnalyzing ? (
          <motion.div
            key="analyzing-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-card p-6 min-h-[400px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-gold animate-spin" />
                <h3 className="font-display font-bold text-foreground">Decision Engine in Progress</h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">
                  Reasoning Mode: ACTIVE
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4 font-mono-data overflow-y-auto max-h-[300px] custom-scrollbar px-2">
              {logs.slice(0, currentStep + 1).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 items-start"
                >
                  <span className="text-muted-foreground/30 whitespace-nowrap text-[10px] mt-1">
                    [{new Date().toLocaleTimeString([], { hour12: false })}]
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      log.agent === 'Radar Agent' ? 'text-blue-400' :
                      log.agent === 'News Agent' ? 'text-green-400' :
                      log.agent === 'Chart Agent' ? 'text-purple-400' :
                      'text-gold'
                    }`}>
                      {log.agent}
                    </span>
                    <span className="text-sm text-foreground/90">{log.message}</span>
                  </div>
                </motion.div>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>
            
            <div className="mt-8 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((s) => (
                <div key={s} className="h-1 rounded-full bg-white/5 overflow-hidden">
                  {currentStep >= (s * 2) && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      className="h-full gradient-crimson-gold"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis-result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="ai-card overflow-hidden border-gold/30 ring-1 ring-gold/10"
          >
            <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-6 border-b border-gold/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-profit" />
                  <span className="text-xs font-bold text-gold uppercase tracking-widest">Autonomous Decision Ready</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">Confidence</div>
                  <div className="text-xl font-black text-profit">91.4%</div>
                </div>
              </div>
              <div className="flex items-end gap-4">
                <h2 className="text-4xl font-black text-foreground tracking-tight">RELIANCE</h2>
                <div className="px-3 py-1 rounded-lg bg-profit/20 border border-profit/30 mb-1">
                  <span className="text-sm font-bold text-profit">STRONG BUY</span>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-3">
                    <Brain className="w-3.5 h-3.5" /> Core Reasoning
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic">
                    "Sustained breakout above ₹2,410 confirmed by 3x average volume. News catalysts in energy sector create a 48h tactical window. Low correlation with NIFTY volatility provides defensive cushion."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="ai-card p-4 bg-white/5 border-none">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Entry Range</div>
                    <div className="text-lg font-bold">₹2,450 - 2,465</div>
                  </div>
                  <div className="ai-card p-4 bg-white/5 border-none">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Target Price</div>
                    <div className="text-lg font-bold text-profit">₹2,650</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-3">
                    <ShieldAlert className="w-3.5 h-3.5" /> Risk Management
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-loss/20 bg-loss/5">
                      <span className="text-sm font-medium">Mandatory Stop Loss</span>
                      <span className="text-sm font-bold text-loss">₹2,380</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                      <span className="text-sm font-medium">Position Size</span>
                      <span className="text-sm font-bold text-foreground">8.5% Portfolio</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full py-4 rounded-xl gradient-crimson-gold text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity glow-crimson">
                    Execute Trade Plan <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowResult(false)}
                    className="w-full mt-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Return to Engine
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
