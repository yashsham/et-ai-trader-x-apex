import { AppLayout } from "@/components/AppLayout";
import { useState, useRef, useEffect } from "react";
import { Send, Zap, TrendingUp, BarChart3, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

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
];

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    const newMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    const loadingMsgId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMsgId,
        role: "ai",
        content: "",
      },
    ]);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/chat/stream?user_id=${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;

            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                accumulatedContent += data.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === loadingMsgId ? { ...m, content: accumulatedContent } : m
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing SSE chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat streaming error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId ? { ...m, content: `Error: ${error}` } : m
        )
      );
      toast.error("Assistant disconnected");
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex gap-2 py-3 overflow-x-auto nice-scrollbar">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 bg-card border border-white/[0.08] rounded-xl p-3 focus-within:border-gold/30 focus-within:ring-1 focus-within:ring-gold/20 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about any stock, trend, or strategy..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-lg gradient-crimson-gold text-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:grayscale"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : <Send className="w-4 h-4 flex-shrink-0" />}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIAssistant;
