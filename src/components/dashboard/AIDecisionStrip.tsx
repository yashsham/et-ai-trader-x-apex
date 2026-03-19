import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, BarChart3, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AIDecisionStrip() {
  const navigate = useNavigate();
  const [buyCount, setBuyCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function checkTodayOpportunities() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/history/daily?decision=BUY");
        const data = await response.json();
        if (data.status === "success") {
          setBuyCount(data.data.count);
        }
      } catch (error) {
        console.error("Failed to check daily signals:", error);
      }
    }
    
    checkTodayOpportunities();

    const handleNewSignal = () => {
      checkTodayOpportunities();
      setIsVisible(true); // Re-show if a new signal comes in
    };
    window.addEventListener('new-ai-signal', handleNewSignal);
    
    return () => window.removeEventListener('new-ai-signal', handleNewSignal);
  }, []);

  const isAlert = buyCount > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isAlert ? 'alert' : 'monitoring'}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden rounded-xl shadow-lg mt-4"
      >
        {/* Vibrant Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${
          isAlert 
            ? 'from-[#10b981] via-[#10b981] to-[#f59e0b]' 
            : 'from-[#10b981]/80 via-[#10b981]/60 to-[#f59e0b]/60'
        }`} />
        
        <div className="absolute inset-0 signal-shimmer opacity-30 pointer-events-none" />
  
        <div className="relative z-10 flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-white fill-current animate-pulse" />
            <span className="text-sm font-bold text-white">
              {isAlert 
                ? `🔥 AI ALERT: ${buyCount} high-confidence BUY ${buyCount === 1 ? 'opportunity' : 'opportunities'} detected today` 
                : "⚡ AI PULSE: Monitoring Indian markets for high-confidence breakouts..."}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAlert && (
              <button
                onClick={() => navigate("/history")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/10"
              >
                View Signals →
              </button>
            )}
            <button
              onClick={() => navigate("/radar")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/5"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Auto-Analyze Top Movers
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
