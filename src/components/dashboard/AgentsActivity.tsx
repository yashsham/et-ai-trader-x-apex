import { motion } from "framer-motion";
import { Radar, Brain, Zap, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function AgentsActivity() {
  const { t } = useLanguage();
  
  const agents = [
    {
      name: t('radar'),
      icon: Radar,
      status: t('scanning_assets').replace('...', ''),
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      description: t('autonomous_desc'), // Generic for now, or use specific if added
    },
    {
      name: t('decision_agent'),
      icon: Brain,
      status: t('analyzing_flow').replace('...', ''),
      color: "text-gold",
      bg: "bg-gold/10",
      description: t('mission_sub'),
    },
    {
      name: t('trader'),
      icon: Zap,
      status: t('optimal'),
      color: "text-crimson",
      bg: "bg-crimson/10",
      description: t('autonomous_reasoning'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {agents.map((agent, index) => (
        <motion.div
          key={agent.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="ai-card p-5 flex flex-col gap-3 relative overflow-hidden group"
        >
          <div className={`absolute top-0 right-0 w-24 h-24 ${agent.bg} rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`} />
          
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${agent.bg}`}>
              <agent.icon className={`w-5 h-5 ${agent.color}`} />
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-profit"></span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {agent.status}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">{agent.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {agent.description}
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Activity className="w-3 h-3 text-muted-foreground/30" />
            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className={`h-full w-1/3 bg-gradient-to-r from-transparent via-${agent.color === 'text-gold' ? 'gold' : agent.color === 'text-crimson' ? 'crimson' : 'blue-400'} to-transparent`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
