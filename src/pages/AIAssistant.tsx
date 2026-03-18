import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Send, Zap, TrendingUp, BarChart3, Brain } from "lucide-react";

const suggestedPrompts = [
  "Should I buy RELIANCE now?",
  "What's the best IT stock today?",
  "Analyze TATAMOTORS chart",
  "Is Nifty going to crash?",
];

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  analysis?: { risk: string; recommendation: string; target: string };
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content:
      "Namaste! I'm your AI Trading Assistant. Ask me about any stock, market trend, or portfolio strategy. I analyze real-time data to give you actionable insights.",
  },
  {
    id: 2,
    role: "user",
    content: "Should I buy HDFC Bank now?",
  },
  {
    id: 3,
    role: "ai",
    content:
      "HDFC Bank is currently trading at ₹1,598.20, down 1.8% today. Here's my analysis:",
    analysis: {
      risk: "Medium — consolidating near support, but banking sector faces NPA concerns",
      recommendation: "Wait for ₹1,570 support test before entry. If it holds, strong buy signal.",
      target: "₹1,720 (7.6% upside) in 30 trading sessions",
    },
  },
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          content: "Analyzing your query... I'll provide a detailed response with actionable insights shortly. This is a demo — in production, this connects to our AI engine.",
        },
      ]);
    }, 800);
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-112px)] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-crimson-gold flex items-center justify-center">
            <Brain className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">AI Trading Assistant</h1>
            <p className="text-xs text-muted-foreground">Powered by ET AI Engine</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] p-4 rounded-xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-crimson/20 text-foreground"
                    : "ai-card"
                }`}
              >
                <p className="text-foreground">{msg.content}</p>
                {msg.analysis && (
                  <div className="mt-3 space-y-2 border-t border-white/[0.05] pt-3">
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-gold font-semibold uppercase">Risk</p>
                        <p className="text-xs text-muted-foreground">{msg.analysis.risk}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-crimson shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-crimson font-semibold uppercase">Recommendation</p>
                        <p className="text-xs text-muted-foreground">{msg.analysis.recommendation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-profit shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-profit font-semibold uppercase">Target</p>
                        <p className="text-xs text-muted-foreground">{msg.analysis.target}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested prompts */}
        <div className="flex gap-2 py-3 overflow-x-auto">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 bg-card border border-white/[0.08] rounded-xl p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about any stock, trend, or strategy..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-lg gradient-crimson-gold text-foreground hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIAssistant;
