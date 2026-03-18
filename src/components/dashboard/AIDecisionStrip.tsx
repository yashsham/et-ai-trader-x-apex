import { motion } from "framer-motion";
import { Zap, ArrowRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AIDecisionStrip() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--crimson))] via-[hsl(var(--crimson)/0.8)] to-[hsl(var(--gold)/0.9)]" />
      
      {/* Shimmer overlay */}
      <div className="absolute inset-0 signal-shimmer opacity-40" />

      <div className="relative z-10 flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-sm font-bold text-white">
            🔥 AI ALERT: 3 high-confidence opportunities detected today
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/opportunity-radar")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-bold hover:bg-white/30 transition-colors"
          >
            View Signals <ArrowRight className="w-3 h-3" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/portfolio-brain")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white/90 text-xs font-bold hover:bg-white/20 transition-colors"
          >
            <BarChart3 className="w-3 h-3" /> Auto-Analyze Portfolio
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
