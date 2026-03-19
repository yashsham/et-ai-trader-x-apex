import React, { useState, useRef, useEffect } from "react";
import { Send, Zap, TrendingUp, BarChart3, Brain, X, Loader2 } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

const suggestedPrompts = [
  "Should I buy RELIANCE now?",
  "Analyze TATAMOTORS chart",
  "Is Nifty going to crash?",
  "What is the best risk management strategy?",
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content: "Namaste! I'm your ET AI Trader X Assistant. Ask me about any stock, market trend, or portfolio strategy. I use real-time data, News, and advanced RAG principles.",
  },
];

interface AIAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantSidebar({ isOpen, onClose }: AIAssistantSidebarProps) {
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
        content: "Running sequential CrewAI analysis...",
      },
    ]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId ? { ...m, content: data.data?.response || "No response received." } : m
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsgId ? { ...m, content: `Connection error: ${error}` } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 right-0 h-screen w-[400px] max-w-[90vw] bg-card border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-crimson-gold flex items-center justify-center relative overflow-hidden">
              <Brain className="w-4 h-4 text-foreground relative z-10" />
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">AI Intelligence</h2>
              <p className="text-[10px] uppercase tracking-widest text-gold font-black">CrewAI + LlamaIndex</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 nice-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-crimson/20 border border-crimson/30 text-foreground rounded-tr-sm"
                    : "bg-accent/50 border border-white/5 text-muted-foreground rounded-tl-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-accent/50 border border-white/5 p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                <span className="text-xs font-mono">Agents researching...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="p-4 border-t border-white/[0.05] bg-card/50">
          <div className="flex gap-2 overflow-x-auto nice-scrollbar pb-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-white/10 text-muted-foreground hover:text-white hover:border-gold/50 hover:bg-gold/10 transition-all font-medium disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          
          {/* Input Box */}
          <div className="flex items-center gap-2 bg-accent/30 border border-white/10 focus-within:border-gold/30 focus-within:ring-1 focus-within:ring-gold/20 rounded-xl p-2 mt-2 transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the swarm about a stock..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none px-2"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-lg gradient-crimson-gold text-white disabled:opacity-50 disabled:grayscale transition-all shadow-lg hover:shadow-crimson/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
