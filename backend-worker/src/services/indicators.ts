/**
 * Technical Indicators Suite in TypeScript
 * Replaces the Python 'ta' package.
 */

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ComputedIndicators {
  rsi: number;
  macd: number;
  macd_signal: number;
  ema20: number;
  ema50: number;
  bb_upper: number;
  bb_lower: number;
  atr: number;
  vwap: number;
}

export interface ChartDataPoint extends OHLCV {
  indicators: ComputedIndicators;
}

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]); // placeholder
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  if (data.length === 0) return ema;

  const k = 2 / (period + 1);
  let prevEma = data[0];
  ema.push(prevEma);

  for (let i = 1; i < data.length; i++) {
    const currentEma = data[i] * k + prevEma * (1 - k);
    ema.push(currentEma);
    prevEma = currentEma;
  }
  return ema;
}

/**
 * Calculates Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (prices.length === 0) return rsi;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      gains.push(0);
      losses.push(0);
      rsi.push(50); // placeholder
      continue;
    }

    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);

    if (i < period) {
      rsi.push(50); // placeholder until we have enough periods
    } else if (i === period) {
      // First RSI calculation: Simple average of gains and losses
      let sumGain = 0;
      let sumLoss = 0;
      for (let j = 1; j <= period; j++) {
        sumGain += gains[j];
        sumLoss += losses[j];
      }
      let avgGain = sumGain / period;
      let avgLoss = sumLoss / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    } else {
      // Subsequent calculations use Wilder's smoothing
      const lastRSI = rsi[i - 1];
      // Work backwards to estimate previous smoothed averages
      let prevAvgGain = 0;
      let prevAvgLoss = 0;
      
      // Calculate smoothed averages iteratively
      let avgGain = 0;
      let avgLoss = 0;
      
      // Seed average
      let sumGain = 0;
      let sumLoss = 0;
      for (let j = 1; j <= period; j++) {
        sumGain += gains[j];
        sumLoss += losses[j];
      }
      avgGain = sumGain / period;
      avgLoss = sumLoss / period;

      for (let k = period + 1; k <= i; k++) {
        avgGain = (avgGain * (period - 1) + gains[k]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[k]) / period;
      }

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  const histogram: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }
  
  return { macdLine, signalLine, histogram };
}

/**
 * Calculates Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period = 20,
  stdDevMultiplier = 2
): { upper: number[]; lower: number[]; middle: number[] } {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(prices[i]);
      lower.push(prices[i]);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      const mean = sum / period;

      let sumSquareDiff = 0;
      for (let j = 0; j < period; j++) {
        sumSquareDiff += Math.pow(prices[i - j] - mean, 2);
      }
      const stdDev = Math.sqrt(sumSquareDiff / period);

      upper.push(mean + stdDevMultiplier * stdDev);
      lower.push(mean - stdDevMultiplier * stdDev);
    }
  }

  return { upper, lower, middle };
}

/**
 * Calculates Average True Range (ATR)
 */
export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): number[] {
  const atr: number[] = [];
  if (highs.length === 0) return atr;

  const tr: number[] = [];
  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      tr.push(highs[0] - lows[0]);
    } else {
      const hMinusL = highs[i] - lows[i];
      const hMinusCprev = Math.abs(highs[i] - closes[i - 1]);
      const lMinusCprev = Math.abs(lows[i] - closes[i - 1]);
      tr.push(Math.max(hMinusL, hMinusCprev, lMinusCprev));
    }
  }

  // Calculate smoothed ATR
  let currentAtr = 0;
  for (let i = 0; i < tr.length; i++) {
    if (i < period - 1) {
      atr.push(tr[i]); // placeholder
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += tr[j];
      }
      currentAtr = sum / period;
      atr.push(currentAtr);
    } else {
      currentAtr = (currentAtr * (period - 1) + tr[i]) / period;
      atr.push(currentAtr);
    }
  }

  return atr;
}

/**
 * Computes all technical indicators for the stock history array
 */
export function computeIndicators(ohlcv: OHLCV[]): ChartDataPoint[] {
  if (ohlcv.length === 0) return [];

  const closes = ohlcv.map(x => x.close);
  const highs = ohlcv.map(x => x.high);
  const lows = ohlcv.map(x => x.low);

  const rsi = calculateRSI(closes, 14);
  const { macdLine, signalLine } = calculateMACD(closes, 12, 26, 9);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const { upper: bbUpper, lower: bbLower } = calculateBollingerBands(closes, 20, 2);
  const atr = calculateATR(highs, lows, closes, 14);

  // Compute VWAP (approximate cumulative volume weighted price)
  const vwap: number[] = [];
  let cumPV = 0;
  let cumVol = 0;
  for (let i = 0; i < ohlcv.length; i++) {
    const tp = (ohlcv[i].high + ohlcv[i].low + ohlcv[i].close) / 3;
    cumPV += tp * ohlcv[i].volume;
    cumVol += ohlcv[i].volume;
    vwap.push(cumVol === 0 ? ohlcv[i].close : cumPV / cumVol);
  }

  return ohlcv.map((data, idx) => ({
    ...data,
    indicators: {
      rsi: Number(rsi[idx].toFixed(2)),
      macd: Number(macdLine[idx].toFixed(2)),
      macd_signal: Number(signalLine[idx].toFixed(2)),
      ema20: Number(ema20[idx].toFixed(2)),
      ema50: Number(ema50[idx].toFixed(2)),
      bb_upper: Number(bbUpper[idx].toFixed(2)),
      bb_lower: Number(bbLower[idx].toFixed(2)),
      atr: Number(atr[idx].toFixed(2)),
      vwap: Number(vwap[idx].toFixed(2))
    }
  }));
}

/**
 * Deterministic support/resistance discovery (last 20 periods)
 */
export function findLevels(ohlcv: OHLCV[]) {
  const last20 = ohlcv.slice(-20);
  if (last20.length === 0) {
    return { support: 0, resistance: 0, levels: [] };
  }

  const highs = last20.map(x => x.high);
  const lows = last20.map(x => x.low);

  const resistance = Math.max(...highs);
  const support = Math.min(...lows);

  return {
    support: Number(support.toFixed(2)),
    resistance: Number(resistance.toFixed(2)),
    levels: [
      { price: Number(resistance.toFixed(2)), type: "Resistance", note: "20-period Local High" },
      { price: Number(support.toFixed(2)), type: "Support", note: "20-period Local Low" }
    ]
  };
}
