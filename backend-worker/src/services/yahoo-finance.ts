import { OHLCV } from "./indicators";

export interface StockQuote {
  symbol: string;
  name: string;
  companyName: string;
  price: string;
  change: string;
  rawPct: number;
  sector: string;
  currentPrice: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number | null;
  history: OHLCV[];
  isSynthetic?: boolean;
}

// Map common symbols to companies to avoid expensive info calls
const TICKER_METADATA: Record<string, { name: string; sector: string }> = {
  "RELIANCE.NS": { name: "Reliance Industries", sector: "Energy & Retail" },
  "HDFCBANK.NS": { name: "HDFC Bank", sector: "Banking" },
  "ICICIBANK.NS": { name: "ICICI Bank", sector: "Banking" },
  "INFY.NS": { name: "Infosys", sector: "IT Services" },
  "TCS.NS": { name: "Tata Consultancy", sector: "IT Services" },
  "ITC.NS": { name: "ITC Ltd", sector: "FMCG" },
  "AXISBANK.NS": { name: "Axis Bank", sector: "Banking" },
  "SBIN.NS": { name: "State Bank of India", sector: "Banking" },
  "BHARTIARTL.NS": { name: "Bharti Airtel", sector: "Telecom" },
  "BAJFINANCE.NS": { name: "Bajaj Finance", sector: "Financials" },
  "^NSEI": { name: "Nifty 50", sector: "Index" },
  "^BSESN": { name: "Sensex", sector: "Index" }
};

/**
 * Maps input ticker symbols to Yahoo Finance symbols
 */
function normalizeSymbol(symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (s === "NIFTY 50" || s === "NIFTY" || s === "NIFTY_50") return "^NSEI";
  if (s === "SENSEX") return "^BSESN";
  return s;
}

/**
 * High-fidelity synthetic fallback generator if Yahoo Finance is rate-limited or down.
 */
function getSyntheticData(symbol: string, period = "1mo"): StockQuote {
  const normSym = normalizeSymbol(symbol);
  const metadata = TICKER_METADATA[normSym] || { name: symbol.replace(".NS", ""), sector: "Equity" };
  
  const basePrices: Record<string, number> = {
    "RELIANCE.NS": 2940.0,
    "TCS.NS": 4120.0,
    "HDFCBANK.NS": 1650.0,
    "INFY.NS": 1620.0,
    "ICICIBANK.NS": 1100.0,
    "^NSEI": 24500.0,
    "^BSESN": 80000.0
  };
  
  const basePrice = basePrices[normSym] || 1500.0;
  const currentPrice = basePrice * (1 + (Math.random() - 0.48) * 0.02); // slight random change
  const open = basePrice * 0.995;
  const dayHigh = Math.max(currentPrice, open) * 1.01;
  const dayLow = Math.min(currentPrice, open) * 0.99;
  const changeVal = currentPrice - basePrice;
  const changePct = (changeVal / basePrice) * 100;

  // Generate synthetic history
  const history: OHLCV[] = [];
  const days = period === "1mo" ? 22 : period === "3mo" ? 65 : period === "5d" ? 5 : 22;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let currentLoopPrice = basePrice * 0.95;
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    // Skip weekends for markets
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const op = currentLoopPrice;
    const cl = currentLoopPrice * (1 + (Math.random() - 0.49) * 0.025);
    const hi = Math.max(op, cl) * (1 + Math.random() * 0.01);
    const lo = Math.min(op, cl) * (1 - Math.random() * 0.01);
    const vol = Math.floor(Math.random() * 1000000) + 500000;

    history.push({
      date: d.toISOString().split("T")[0],
      open: Number(op.toFixed(2)),
      high: Number(hi.toFixed(2)),
      low: Number(lo.toFixed(2)),
      close: Number(cl.toFixed(2)),
      volume: vol
    });
    currentLoopPrice = cl;
  }

  return {
    symbol: normSym,
    name: metadata.name,
    companyName: metadata.name,
    price: `₹${currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
    rawPct: Number(changePct.toFixed(2)),
    sector: metadata.sector,
    currentPrice: Number(currentPrice.toFixed(2)),
    open: Number(open.toFixed(2)),
    dayHigh: Number(dayHigh.toFixed(2)),
    dayLow: Number(dayLow.toFixed(2)),
    volume: 1250000,
    marketCap: metadata.sector === "Index" ? null : 500000000000,
    history: history,
    isSynthetic: true
  };
}

/**
 * Fetches OHLCV and metadata from Yahoo Finance
 */
export async function getStockData(symbol: string, period = "1mo"): Promise<StockQuote> {
  const normSym = normalizeSymbol(symbol);
  
  // Set default interval based on period
  let interval = "1d";
  let range = period;
  if (period === "1d") {
    range = "1d";
    interval = "5m";
  } else if (period === "5d") {
    range = "5d";
    interval = "15m";
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(normSym)}?range=${range}&interval=${interval}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Yahoo Finance returned status ${res.status}`);
    }

    const data: any = await res.json();
    const result = data?.chart?.result?.[0];
    
    if (!result) {
      throw new Error(`Invalid data structure from Yahoo Finance for ${normSym}`);
    }

    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];

    const opens: number[] = quote.open || [];
    const highs: number[] = quote.high || [];
    const lows: number[] = quote.low || [];
    const closes: number[] = quote.close || adjClose || [];
    const volumes: number[] = quote.volume || [];

    const history: OHLCV[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      // Filter out points with null data
      if (
        opens[i] === null || opens[i] === undefined ||
        highs[i] === null || highs[i] === undefined ||
        lows[i] === null || lows[i] === undefined ||
        closes[i] === null || closes[i] === undefined
      ) {
        continue;
      }

      const dateStr = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
      history.push({
        date: dateStr,
        open: Number(opens[i].toFixed(2)),
        high: Number(highs[i].toFixed(2)),
        low: Number(lows[i].toFixed(2)),
        close: Number(closes[i].toFixed(2)),
        volume: Number((volumes[i] || 0).toFixed(0))
      });
    }

    if (history.length === 0) {
      throw new Error(`No historical data parsed for ${normSym}`);
    }

    const meta = result.meta || {};
    const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
    const previousClose = meta.chartPreviousClose || closes[0];
    const open = meta.regularMarketOpen || opens[opens.length - 1] || currentPrice;
    const dayHigh = meta.regularMarketDayHigh || Math.max(...highs.slice(-5)) || currentPrice;
    const dayLow = meta.regularMarketDayLow || Math.min(...lows.slice(-5)) || currentPrice;
    const volume = meta.regularMarketVolume || volumes[volumes.length - 1] || 0;
    
    const changeVal = currentPrice - previousClose;
    const changePct = previousClose === 0 ? 0 : (changeVal / previousClose) * 100;
    const metadata = TICKER_METADATA[normSym] || { name: normSym.replace(".NS", ""), sector: "Equity" };

    return {
      symbol: normSym,
      name: metadata.name,
      companyName: metadata.name,
      price: `₹${currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
      rawPct: Number(changePct.toFixed(2)),
      sector: metadata.sector,
      currentPrice: Number(currentPrice.toFixed(2)),
      open: Number(open.toFixed(2)),
      dayHigh: Number(dayHigh.toFixed(2)),
      dayLow: Number(dayLow.toFixed(2)),
      volume: Number(volume),
      marketCap: null, // yahoo chart API doesn't return full market cap easily, set null
      history: history
    };

  } catch (error) {
    console.error(`[YahooFinanceService] Failed to fetch live data for ${symbol}:`, error);
    // Return high-fidelity fallback synthetic data
    return getSyntheticData(symbol, period);
  }
}

/**
 * Fetches batch stock quotes for Nifty Movers
 */
export async function getStockQuotesBatch(symbols: string[]): Promise<Partial<StockQuote>[]> {
  const promises = symbols.map(s => getStockData(s, "5d")); // fetch 5d history to calculate 2d change
  const results = await Promise.all(promises);
  return results.map(r => ({
    symbol: r.symbol,
    name: r.name,
    company_name: r.name,
    price: r.price,
    change: r.change,
    raw_pct: r.rawPct,
    sector: r.sector
  }));
}
