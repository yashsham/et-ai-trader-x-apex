import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api-config";
import { Cpu, ShieldCheck } from "lucide-react";

interface ProviderStatus {
  id: string;
  name: string;
  provider: string;
  model: string;
  status: "Active" | "Standby" | "Offline" | string;
  configured: boolean;
}

export const LLMModelStatusCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [providers, setProviders] = useState<ProviderStatus[]>([
    {
      id: "groq",
      name: "Groq (openai/gpt-oss-20b)",
      provider: "Groq",
      model: "openai/gpt-oss-20b",
      status: "Active",
      configured: true
    },
    {
      id: "nvidia",
      name: "NVIDIA NIM (meta/llama-3.3-70b)",
      provider: "NVIDIA NIM",
      model: "meta/llama-3.3-70b",
      status: "Standby",
      configured: true
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/llm/status`);
        const json = await res.json();
        if (json.success && json.data?.providers && json.data.providers.length > 0) {
          setProviders(json.data.providers);
        }
      } catch (e) {
        console.error("Failed to fetch LLM failover status:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className={`ai-card p-5 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-gold" />
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground font-mono">
            Status
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-profit bg-profit/10 px-2 py-0.5 rounded border border-profit/20">
          <ShieldCheck className="w-3 h-3" />
          Failover Ready
        </div>
      </div>

      <div className="space-y-2">
        {providers.map((p) => {
          const isActive = p.status === "Active";
          const isStandby = p.status === "Standby";

          return (
            <div
              key={p.id}
              className="flex items-center justify-between py-2 px-3 rounded bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-mono font-semibold text-foreground/90">
                {p.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-profit animate-pulse' : isStandby ? 'bg-gold' : 'bg-muted-foreground'}`} />
                <span
                  className={`text-xs font-mono font-bold ${
                    isActive
                      ? "text-profit"
                      : isStandby
                      ? "text-gold opacity-90"
                      : "text-muted-foreground opacity-60"
                  }`}
                >
                  — {p.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
