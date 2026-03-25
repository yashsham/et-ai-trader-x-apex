import yfinance as yf
import pandas as pd

tickers = ["RELIANCE.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS", "TCS.NS"]
results = {}

print("Testing yfinance download for multiple tickers...")
for sym in tickers:
    try:
        df = yf.download(sym, period="2d", interval="1d", progress=False, auto_adjust=True)
        if not df.empty and len(df) >= 2:
            close = df["Close"]
            current = float(close.iloc[-1].item()) if hasattr(close.iloc[-1], 'item') else float(close.iloc[-1])
            prev = float(close.iloc[-2].item()) if hasattr(close.iloc[-2], 'item') else float(close.iloc[-2])
            change = ((current - prev) / prev) * 100
            results[sym] = {"price": current, "change": change}
            print(f"{sym}: ₹{current:.2f} ({change:.2f}%)")
        else:
            print(f"{sym}: No data")
    except Exception as e:
        print(f"{sym}: Error {e}")

print("\nFinal results comparison:")
for sym, val in results.items():
    print(f"{sym}: {val}")
