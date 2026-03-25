import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check, Zap, BarChart3, ShieldCheck, MessageSquareText } from "lucide-react";

export const OnboardingTour = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Show on every new session (standard for "every login" feel)
    const hasSeenTourThisSession = sessionStorage.getItem("has_seen_onboarding_session");
    if (!hasSeenTourThisSession) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    setIsVisible(false);
    sessionStorage.setItem("has_seen_onboarding_session", "true");
    // Also set localStorage just in case we need to track overall completion
    localStorage.setItem("has_seen_onboarding", "true");
  };

  const steps = [
    {
      title: "Alpha Intelligence Swarm",
      content: "Deploy a multi-agent Hive Mind trained on 15 years of institutional data. Our AI doesn't just scan; it reasons through news, charts, and sentiment in real-time.",
      icon: <Zap className="w-6 h-6 text-gold" />,
      color: "from-crimson to-gold"
    },
    {
      title: "Live Pattern Recognition",
      content: "Spot breakouts before they happen. Our visual recognition agents identify high-conviction flags, wedges, and trend reversals with 94.2% historical precision.",
      icon: <BarChart3 className="w-6 h-6 text-profit" />,
      color: "from-profit to-emerald-400"
    },
    {
      title: "Portfolio Autopilot",
      content: "Auto-balance your risk. The AI monitors your holdings 24/7, providing rebalancing signals and risk alerts straight to your dashboard.",
      icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
      color: "from-blue-600 to-cyan-400"
    },
    {
      title: "AI Market Copilot",
      content: "Ask the experts. Chat with our assistant in 10+ languages. Get deep insights, breaking news impact, and specific technical analysis instantly.",
      icon: <MessageSquareText className="w-6 h-6 text-gold" />,
      color: "from-gold to-orange-500"
    }
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Deeply blurred backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/60 backdrop-blur-md pointer-events-auto"
          onClick={completeTour}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative z-10 w-full max-w-md ai-card overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto"
        >
          {/* Animated decorative top bar */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${steps[step - 1].color} transition-all duration-500`} />

          <button 
            onClick={completeTour}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <motion.div 
                key={step}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[step - 1].color} opacity-20 absolute -top-4 -left-4 blur-2xl`}
              />
              
              <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] relative shadow-inner">
                {steps[step - 1].icon}
              </div>
              
              <h3 className="font-display text-2xl font-black text-foreground mb-3 tracking-tight">
                {steps[step - 1].title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                {steps[step - 1].content}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-10">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 === step ? "w-8 gradient-crimson-gold" : "w-1.5 bg-white/10"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={completeTour}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
              >
                Skip
              </button>
              
              <button
                onClick={() => step < steps.length ? setStep(step + 1) : completeTour()}
                className="group flex items-center gap-3 px-6 py-3 rounded-xl gradient-crimson-gold text-foreground text-xs font-black uppercase tracking-widest glow-crimson transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                {step < steps.length ? (
                  <>Next <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
                ) : (
                  <>Ignite Engine <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

