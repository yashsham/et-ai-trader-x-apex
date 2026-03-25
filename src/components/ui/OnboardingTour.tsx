import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check } from "lucide-react";

export const OnboardingTour = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Only show once per user
    const hasSeenTour = localStorage.getItem("has_seen_onboarding");
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem("has_seen_onboarding", "true");
  };

  const steps = [
    {
      title: "Welcome to ET AI Trader",
      content: "Let's take a quick tour! Start your journey on the Opportunity Radar to find live, AI-analyzed trading signals.",
    },
    {
      title: "Add to Watchlist",
      content: "Found a good stock? Click the bookmark icon to add it to your Portfolio Brain for continuous AI monitoring.",
    },
    {
      title: "Ask the AI Anything",
      content: "Got questions? Head over to the AI Assistant to ask about live prices, news sentiment, and technicals.",
    }
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
        {/* Semi-transparent backdrop that blocks clicks but looks clean */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/50 backdrop-blur-sm pointer-events-auto"
          onClick={completeTour}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-sm ai-card p-6 border border-gold/20 shadow-[-10px_-10px_30px_4px_rgba(255,215,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.05)] pointer-events-auto"
        >
          <button 
            onClick={completeTour}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mb-6">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? "gradient-crimson-gold" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            
            <h3 className="font-display text-lg font-bold text-transparent bg-clip-text gradient-crimson-gold mb-2">
              {steps[step - 1].title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {steps[step - 1].content}
            </p>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={completeTour}
              className="text-xs text-muted-foreground hover:text-foreground underline decoration-white/20 underline-offset-4 transition-all"
            >
              Skip tour
            </button>
            
            <button
              onClick={() => step < 3 ? setStep(step + 1) : completeTour()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-crimson-gold text-foreground text-xs font-bold glow-crimson transition-opacity hover:opacity-90 shadow-lg"
            >
              {step < 3 ? (
                <>Next <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Get Started <Check className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
