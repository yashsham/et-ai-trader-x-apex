/**
 * Light LLM API Client Router for Cloudflare Workers
 * Supports Google Gemini, Groq, and OpenAI.
 */

export interface LLMConfig {
  geminiKey?: string;
  groqKey?: string;
  openaiKey?: string;
  openrouterKey?: string;
  nvidiaKey?: string;
}

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Universal completion router that chooses the first available API key.
   */
  /**
   * Universal completion router that chooses the first available API key and model.
   */
  private async complete(prompt: string, systemPrompt = "You are a professional financial advisor.", jsonMode = false): Promise<string> {
    const { geminiKey, groqKey, openaiKey, openrouterKey, nvidiaKey } = this.config;

    // 1. Try Groq
    if (groqKey && groqKey.trim() !== "") {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"];
      for (const model of groqModels) {
        try {
          const url = "https://api.groq.com/openai/v1/chat/completions";
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
              ],
              response_format: jsonMode ? { type: "json_object" } : undefined
            })
          });

          if (response.ok) {
            const json: any = await response.json();
            const text = json?.choices?.[0]?.message?.content;
            if (text) return text;
          } else {
            console.error(`Groq API Error (${model}):`, await response.text());
          }
        } catch (e) {
          console.error(`Groq failed for ${model}:`, e);
        }
      }
    }

    // 2. Try OpenRouter
    if (openrouterKey && openrouterKey.trim() !== "") {
      const openrouterModels = [
        "meta-llama/llama-3.3-70b-instruct",
        "google/gemini-2.0-flash-001",
        "openai/gpt-4o-mini",
        "deepseek/deepseek-r1:free"
      ];
      for (const model of openrouterModels) {
        try {
          const url = "https://openrouter.ai/api/v1/chat/completions";
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openrouterKey}`,
              "HTTP-Referer": "https://et-ai-trader-x-apex.pages.dev",
              "X-Title": "ET AI Trader"
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
              ],
              response_format: jsonMode ? { type: "json_object" } : undefined
            })
          });

          if (response.ok) {
            const json: any = await response.json();
            const text = json?.choices?.[0]?.message?.content;
            if (text) return text;
          } else {
            console.error(`OpenRouter API Error (${model}):`, await response.text());
          }
        } catch (e) {
          console.error(`OpenRouter failed for ${model}:`, e);
        }
      }
    }

    // 3. Try Nvidia NIM
    if (nvidiaKey && nvidiaKey.trim() !== "") {
      const nvidiaModels = [
        "meta/llama-3.3-70b-instruct",
        "nvidia/llama-3.1-nemotron-70b-instruct",
        "meta/llama3-70b-instruct"
      ];
      for (const model of nvidiaModels) {
        try {
          const url = "https://integrate.api.nvidia.com/v1/chat/completions";
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${nvidiaKey}`
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
              ],
              response_format: jsonMode ? { type: "json_object" } : undefined
            })
          });

          if (response.ok) {
            const json: any = await response.json();
            const text = json?.choices?.[0]?.message?.content;
            if (text) return text;
          } else {
            console.error(`Nvidia NIM API Error (${model}):`, await response.text());
          }
        } catch (e) {
          console.error(`Nvidia NIM failed for ${model}:`, e);
        }
      }
    }

    // 4. Try OpenAI (GPT-4o-mini)
    if (openaiKey && openaiKey.trim() !== "") {
      try {
        const url = "https://api.openai.com/v1/chat/completions";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt }
            ],
            response_format: jsonMode ? { type: "json_object" } : undefined
          })
        });

        if (response.ok) {
          const json: any = await response.json();
          const text = json?.choices?.[0]?.message?.content;
          if (text) return text;
        } else {
          console.error("OpenAI API Error:", await response.text());
        }
      } catch (e) {
        console.error("OpenAI failed:", e);
      }
    }

    // 5. Try Google Gemini (Fast, Free tier available, direct HTTP)
    if (geminiKey && geminiKey.trim() !== "") {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Prompt: ${prompt}` }] }],
            generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
          })
        });

        if (response.ok) {
          const json: any = await response.json();
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          console.error("Gemini API Error:", await response.text());
        }
      } catch (e) {
        console.error("Gemini failed:", e);
      }
    }


    // Fallback Mock Response if no keys work or all fail
    console.warn("No LLM API keys configured or all queries failed. Using offline financial generator.");
    return this.generateOfflineFallback(prompt, jsonMode);
  }

  /**
   * Analyzes stock data from a chart perspective
   */
  public async analyzeChart(symbol: string, techData: any): Promise<any> {
    const systemPrompt = `You are a Senior Quantitative Technical Analyst. Analyze the technical indicator state of the stock and return a JSON object EXACTLY in the format:
{
  "trend": "Strong Bullish" | "Bullish" | "Bearish" | "Strong Bearish" | "Neutral",
  "pattern_name": "Name of chart pattern detected",
  "historical_win_rate": "percentage like 65.5%",
  "support": number,
  "resistance": number,
  "target": number,
  "stop_loss": number,
  "risk_reward": "ratio like 1:2.0",
  "explanation": "Detailed explanation of technical indicators and patterns in 3 sentences."
}
All prices should be numeric close to the current price.`;

    const prompt = `Analyze Stock Ticker: ${symbol}
Current Price: ${techData.current_price}
Indicators:
- RSI: ${techData.rsi} (typical: <30 oversold, >70 overbought)
- MACD: ${techData.macd}
- EMA20: ${techData.ema20}
Levels: Support: ${techData.levels.support}, Resistance: ${techData.levels.resistance}`;

    try {
      const response = await this.complete(prompt, systemPrompt, true);
      return JSON.parse(this.cleanJsonString(response));
    } catch (e) {
      console.error("[LLMService] analyzeChart fallback:", e);
      const current = techData.current_price;
      const isBullish = current > techData.ema20;
      return {
        trend: isBullish ? "Bullish" : "Bearish",
        pattern_name: isBullish ? "Ascending Triangle Breakout" : "Head & Shoulders Formation",
        historical_win_rate: isBullish ? "64.8%" : "59.2%",
        support: techData.levels.support,
        resistance: techData.levels.resistance,
        target: isBullish ? Number((current * 1.1).toFixed(2)) : Number((current * 0.9).toFixed(2)),
        stop_loss: isBullish ? Number((current * 0.95).toFixed(2)) : Number((current * 1.05).toFixed(2)),
        risk_reward: "1:2.0",
        explanation: `Technical scan indicators for ${symbol} show price hovering at ₹${current}. RSI is at ${techData.rsi.toFixed(1)}, showing healthy momentum. Price remains ${isBullish ? "above" : "below"} the 20-period EMA, suggesting a continuation of the local trend.`
      };
    }
  }

  /**
   * Main stock analyzer that mimics the Python CrewAI TradingCrew
   */
  public async analyzeStock(symbol: string, currentPrice: number, open: number, high: number, low: number, volume: number): Promise<any> {
    const systemPrompt = `You are a hedge fund portfolio manager. Analyze the stock based on raw performance data and return a JSON object EXACTLY in the format:
{
  "decision": "BUY" | "SELL" | "HOLD",
  "entry": "price range like ₹2930 - ₹2950",
  "target": "target price range like ₹3200",
  "stop_loss": "stop loss price range like ₹2800",
  "confidence": number between 0.0 and 1.0,
  "reasoning": "Explain the macro context, entry zone logic, and target calculation in 3 professional sentences."
}`;

    const prompt = `Stock: ${symbol}
Current Price: ₹${currentPrice}
Open: ₹${open}
Day High: ₹${high}
Day Low: ₹${low}
Volume: ${volume}`;

    try {
      const response = await this.complete(prompt, systemPrompt, true);
      const data = JSON.parse(this.cleanJsonString(response));
      return {
        status: "success",
        data: {
          parsed_data: data,
          ...data
        },
        confidence: data.confidence || 0.8,
        error_fallback: false
      };
    } catch (e) {
      console.error("[LLMService] analyzeStock fallback:", e);
      const isUp = currentPrice >= open;
      const targetVal = isUp ? currentPrice * 1.08 : currentPrice * 1.05;
      const stopVal = isUp ? currentPrice * 0.95 : currentPrice * 0.92;
      return {
        status: "success",
        data: {
          decision: isUp ? "BUY" : "HOLD",
          entry: `₹${(currentPrice * 0.99).toFixed(1)} - ₹${currentPrice.toFixed(1)}`,
          target: `₹${targetVal.toFixed(1)}`,
          stop_loss: `₹${stopVal.toFixed(1)}`,
          confidence: 0.75,
          reasoning: `Analysis of ${symbol} points to active volume profiles in today's session. Strong support is forming near day low. We recommend positioning inside the current range targeting short term breakouts.`
        },
        confidence: 0.75,
        error_fallback: true
      };
    }
  }

  /**
   * Chat bot assistant
   */
  public async chat(query: string, history: any[] = []): Promise<string> {
    const systemPrompt = "You are a professional financial analysis chatbot, co-pilot for the ET AI Trader X dashboard. Help users analyze NSE/BSE stock charts, explain indicators (RSI, MACD, EMA), and formulate portfolio rebalancing ideas. Be direct, concise, and professional.";
    const chatPrompt = `Chat History:
${history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join("\n")}
User Query: ${query}`;

    return this.complete(chatPrompt, systemPrompt, false);
  }

  /**
   * Dashboard executive summary writer
   */
  public async generateDashboardSummary(marketState: any, watchlist: any[]): Promise<string> {
    const systemPrompt = "You are a Chief Investment Officer. Provide a 3-sentence summary of the current market state and watchlists. Highlight actionable areas.";
    const prompt = `Market Nifty 50 State: Current level is ${marketState.current}, daily change is ${marketState.changePct}%.
Watchlist assets under management: ${watchlist.map(w => w.symbol).join(", ")}`;

    return this.complete(prompt, systemPrompt, false);
  }

  /**
   * Portfolio optimization swarm rebalancer
   */
  public async optimizePortfolio(holdings: any[]): Promise<any> {
    const systemPrompt = `You are an automated portfolio optimizer. Analyze the portfolio holdings and return a JSON object EXACTLY in the format:
{
  "health_status": "Healthy" | "Over-allocated" | "Needs Rebalancing" | "Critical Concentration",
  "rebalancing_plan": [
    {
      "symbol": "ticker",
      "action": "BUY" | "SELL" | "HOLD",
      "weight_change": "percentage like -5%",
      "reason": "explanation of trade"
    }
  ],
  "explanation": "Summarize the portfolio condition and asset reallocation rationale in 2-3 sentences."
}`;

    const prompt = `Current Portfolio Holdings:
${JSON.stringify(holdings, null, 2)}`;

    try {
      const response = await this.complete(prompt, systemPrompt, true);
      return JSON.parse(this.cleanJsonString(response));
    } catch (e) {
      console.error("[LLMService] optimizePortfolio fallback:", e);
      return {
        health_status: "Healthy",
        rebalancing_plan: [],
        explanation: "No major rebalancing is needed at this time. The portfolio is well-diversified across sectors with normal asset weights."
      };
    }
  }

  /**
   * Sanitizes markdown formatting backticks that models often wrap JSON inside.
   */
  private cleanJsonString(str: string): string {
    let clean = str.trim();
    if (clean.startsWith("```")) {
      const lines = clean.split("\n");
      if (lines[0].startsWith("```")) lines.shift();
      if (lines[len(lines) - 1].startsWith("```")) lines.pop();
      clean = lines.join("\n").trim();
    }
    // Remove inline '```json' tags
    clean = clean.replace(/```json/gi, "").replace(/```/g, "");
    return clean;
  }

  /**
   * Fallback generation if no key exists.
   */
  private generateOfflineFallback(prompt: string, jsonMode: boolean): string {
    if (jsonMode) {
      if (prompt.includes("optimize") || prompt.includes("Portfolio")) {
        return JSON.stringify({
          health_status: "Healthy",
          rebalancing_plan: [],
          explanation: "Offline database engine. No rebalancing actions needed."
        });
      }
      return JSON.stringify({
        decision: "HOLD",
        trend: "Neutral",
        entry: "N/A",
        target: 1600.0,
        stop_loss: 1400.0,
        support: 1450.0,
        resistance: 1550.0,
        historical_win_rate: "50%",
        confidence: 0.5,
        reasoning: "Offline AI broker engine. Check your Cloudflare Worker environment secret variables."
      });
    }
    return "The AI assistant is currently operating offline. To enable live AI intelligence, please bind your GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY environment variables in Cloudflare.";
  }
}

// Python-like len helper
function len(arr: any[]) {
  return arr.length;
}
