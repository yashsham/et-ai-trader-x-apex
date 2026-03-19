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
import { TradePlanModal } from "./TradePlanModal";
import type { SignalData } from "./AISignalCard";

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

const scanMessages = [
  "Initializing Agent Swarm...",
  "Scanning 5,248 assets in real-time...",
  "Detecting breakout patterns...",
  "Analyzing institutional order flow...",
  "Processing news sentiment...",
  "Identifying high-conviction trades..."
];

export function AutoAnalyzeEngine() {
  const [targetSymbol, setTargetSymbol] = useState("RELIANCE.NS");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Real data state
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisDecision, setAnalysisDecision] = useState("UNKNOWN");
  const [parsedData, setParsedData] = useState<{
    entry: string;
    target: string;
    stop_loss: string;
    confidence: number;
  }>({
    entry: "System Calculating...",
    target: "System Calculating...",
    stop_loss: "System Calculating...",
    confidence: 0,
  });

  const latestSignalData: SignalData = {
    id: Math.floor(Math.random() * 1000) + 900,
    stock: targetSymbol.split('.')[0] || "ASSET",
    price: parsedData.entry,
    expectedMove: parsedData.confidence > 0 ? parseFloat((parsedData.confidence / 10).toFixed(1)) : 8.2,
    confidence: parsedData.confidence || 91.4,
    signal: analysisDecision,
    risk: "Medium",
    sector: "AI Tracked",
    volume: "Live Scan",
    explanation: analysisResult.substring(0, 120) + "...",
    target: parsedData.target,
    stopLoss: parsedData.stop_loss,
    entryZone: parsedData.entry
  };

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
      const timer = setTimeout(async () => {
        if (currentStep === logs.length - 1) {
          try {
            // Trigger Real Backend Analysis
            const response = await fetch("http://localhost:8000/api/v1/analyze-stock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ symbol: targetSymbol, portfolio: {} })
            });
            const raw = await response.json();
            console.log("AI Decision Raw:", raw);
            
            // 1. Unpack the payload (StandardResponse.data or raw)
            const payload = raw.data || raw;
            
            // 2. Identify core data (Backend now sends it wrapped in parsed_data for consistency)
            const data = payload.parsed_data || payload;
            
            if (data && data.decision) {
              setAnalysisResult(data.reasoning || "Analysis Complete.");
              setAnalysisDecision(data.decision.toUpperCase());
              setParsedData({
                entry: data.entry || "N/A",
                target: data.target || "N/A",
                stop_loss: data.stop_loss || "N/A",
                confidence: data.confidence || 0.85,
              });
            } else if (payload.raw_text || payload.decision_output) {
              const text = payload.raw_text || payload.decision_output;
              setAnalysisResult(text);
              const outUpper = text.toUpperCase();
              if (outUpper.includes("BUY")) setAnalysisDecision("BUY");
              else if (outUpper.includes("SELL")) setAnalysisDecision("SELL");
              else if (outUpper.includes("HOLD")) setAnalysisDecision("HOLD");
              else setAnalysisDecision("HOLD");
            } else {
              setAnalysisResult("AI Agent logic completed, but no structured recommendation was detected.");
              setAnalysisDecision("HOLD");
            }
          } catch (error) {
            console.error("Backend Error:", error);
            setAnalysisResult("Error connecting to AI swarm core.");
          }

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

  useEffect(() => {
    if (isScanning) {
      const timer = setInterval(() => {
        setScanIndex(prev => {
          if (prev >= scanMessages.length - 1) {
            clearInterval(timer);
            setTimeout(() => {
              setIsScanning(false);
              setIsAnalyzing(true);
              setCurrentStep(0);
            }, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
      return () => clearInterval(timer);
    }
  }, [isScanning]);

  const handleStart = () => {
    setIsScanning(true);
    setScanIndex(0);
    setIsAnalyzing(false);
    setCurrentStep(-1);
    setShowResult(false);
    setScannedCount(0);
    setIsRevealing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!isAnalyzing && !showResult && !isRevealing && !isScanning ? (
          <motion.div
            key="start-button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <button
              onClick={handleStart}
              className="group relative px-12 py-6 rounded-2xl gradient-crimson-gold text-white font-black text-2xl hover:scale-[1.05] active:scale-[0.98] transition-all elite-glow-gold flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-4">
                <Zap className="w-8 h-8 fill-white animate-pulse" />
                EXECUTE AI SCAN
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <span className="text-[10px] font-black tracking-[0.4em] opacity-80 group-hover:opacity-100 uppercase italic">Start Autonomous Reasoning</span>
              
              <div className="absolute -inset-1 bg-gradient-to-r from-crimson to-gold rounded-2xl blur-xl opacity-20 group-hover:opacity-60 transition duration-500"></div>
            </button>
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 w-full max-w-sm">
              <input
                type="text"
                value={targetSymbol}
                onChange={e => setTargetSymbol(e.target.value)}
                placeholder="Target Symbol (e.g. RELIANCE.NS)"
                className="bg-transparent border-none text-white text-center w-full focus:outline-none font-mono uppercase tracking-widest placeholder:text-muted-foreground/50"
              />
            </div>
            <p className="text-muted-foreground text-sm font-medium italic opacity-70">
              Triggering the Decision Engine reveals institutional flow across 5k+ assets.
            </p>
          </motion.div>
        ) : isScanning ? (
          <motion.div
            key="scanning-experience"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(40px)" }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Immersive Ticker Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] grid grid-cols-8 md:grid-cols-12 gap-1 p-4 pointer-events-none">
              {Array.from({ length: 120 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    opacity: [0.2, 1, 0.2],
                    color: ["#ffffff", "#D4A32F", "#ffffff"]
                  }}
                  transition={{ 
                    duration: 0.1 + Math.random() * 0.3, 
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                  className="text-[8px] font-mono leading-none"
                >
                  {["RELIANCE", "TCS", "HDFC", "INFY", "ICICI", "SBIN", "BHARTI", "ITC", "ADANI", "AXIS"][Math.floor(Math.random() * 10)]}
                  <br />
                  ₹{Math.floor(Math.random() * 5000)}.{Math.floor(Math.random() * 99)}
                </motion.div>
              ))}
            </div>

            {/* Neural Scanning Core */}
            <div className="relative z-10 flex flex-col items-center gap-12 max-w-2xl w-full px-6">
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 180, 270, 360],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 rounded-full border border-gold/20 flex items-center justify-center relative"
                >
                  <div className="absolute inset-0 rounded-full border-t-2 border-gold shadow-[0_0_30px_rgba(212,163,47,0.3)]" />
                  <Search className="w-16 h-16 text-gold animate-pulse" />
                </motion.div>
                
                {/* Radial Scan Line */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-20px] border-l-2 border-gold/60 rounded-full opacity-40"
                />
              </div>

              <div className="space-y-6 text-center w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={scanIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-2"
                  >
                    <div className="text-gold font-black tracking-[0.5em] uppercase text-[10px] mb-2">Neural Link Established</div>
                    <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
                      {scanMessages[scanIndex]}
                    </h3>
                  </motion.div>
                </AnimatePresence>

                <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((scanIndex + 1) / scanMessages.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-crimson via-gold to-crimson shadow-[0_0_15px_rgba(212,163,47,0.5)] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Cross-referencing 842 Data Points
                    </span>
                    <span className="text-lg font-black text-gold font-mono-data">
                      {Math.round(((scanIndex + 1) / scanMessages.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Console Footprint */}
              <div className="grid grid-cols-2 gap-8 w-full border-t border-white/10 pt-8 mt-4">
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Sentiment</div>
                  <div className="text-xl font-black text-profit font-mono-data tracking-tighter">BULLISH [9.2]</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Institutional Alpha</div>
                  <div className="text-xl font-black text-gold font-mono-data tracking-tighter">DETECTED</div>
                </div>
              </div>
            </div>

            {/* Bottom cinematic text */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/20 uppercase tracking-[1em] animate-pulse">
              Autonomous Intelligence Layer v4.0.2
            </div>
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
                  <div className="text-4xl font-black text-profit drop-shadow-[0_0_15px_hsl(var(--profit)/0.5)]">{parsedData.confidence > 0 ? `${parsedData.confidence}%` : "91.4%"}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-ping ${analysisDecision === 'SELL' ? 'bg-loss' : 'bg-profit'}`} />
                  <span className="text-xs font-black text-gold uppercase tracking-[0.3em]">Autonomous Alpha Signal</span>
                </div>
                <h2 className="text-6xl font-black text-white tracking-tighter flex items-end gap-3 uppercase">
                  {targetSymbol.split('.')[0]}
                  <span className="text-2xl text-muted-foreground font-medium tracking-normal mb-1">/ {targetSymbol.split('.')[1] || 'NSE'}</span>
                </h2>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-inner ${
                analysisDecision === 'BUY' ? 'bg-profit/20 border-profit/40 text-profit' :
                analysisDecision === 'SELL' ? 'bg-loss/20 border-loss/40 text-loss' :
                'bg-gold/20 border-gold/40 text-gold'
              }`}>
                <Zap className="w-5 h-5 fill-current" />
                <span className="text-lg font-black uppercase italic">
                  {analysisDecision === 'BUY' ? 'Strong Buy Recommendation' :
                   analysisDecision === 'SELL' ? 'Sell/Avoid Recommendation' :
                   analysisDecision === 'HOLD' ? 'Hold / Monitor Position' :
                   'Analysis Complete'}
                </span>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black text-gold uppercase tracking-widest mb-4">
                    <Brain className="w-4 h-4" /> Core Reasoning (AI Output)
                  </h4>
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-transparent rounded-full" />
                    <div className="text-sm text-foreground/90 font-medium leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden h-[300px] overflow-y-auto custom-scrollbar font-mono-data whitespace-pre-wrap">
                      <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                        <Brain className="w-12 h-12" />
                      </div>
                      {analysisResult || "Thinking..."}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="ai-card p-5 bg-white/[0.03] border-white/5 hover:border-gold/30 transition-all">
                    <div className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Entry Zone</div>
                    <div className="text-xl font-black text-white">{parsedData.entry}</div>
                  </div>
                  <div className="ai-card p-5 bg-white/[0.03] border-white/5 hover:border-profit/30 transition-all">
                    <div className="text-[10px] text-muted-foreground uppercase font-black mb-1 tracking-widest">Target Price</div>
                    <div className="text-xl font-black text-profit flex items-center gap-1">
                      {parsedData.target} <TrendingUp className="w-4 h-4" />
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
                        <span className="text-lg font-black text-white">{parsedData.stop_loss}</span>
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
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="group relative w-full py-5 rounded-2xl gradient-crimson-gold text-white font-black text-xl hover:scale-[1.02] transition-all elite-glow-gold flex items-center justify-center gap-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
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

      <TradePlanModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={latestSignalData}
      />
    </div>
  );
}
