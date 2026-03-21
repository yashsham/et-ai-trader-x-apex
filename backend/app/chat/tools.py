from crewai.tools import tool
from app.services.market_service import market_service

@tool("Financial Data Tool")
def financial_data_tool(symbol: str) -> str:
    """Useful to get current financial data for a stock symbol like price, volume, high, low, market cap."""
    try:
        data = market_service.get_stock_data(symbol)
        return (
            f"Symbol: {symbol}\n"
            f"Price: {data.get('current_price')}\n"
            f"Day High: {data.get('dayHigh')}\n"
            f"Day Low: {data.get('dayLow')}\n"
            f"Volume: {data.get('volume')}\n"
            f"Market Cap: {data.get('marketCap')}"
        )
    except Exception as e:
        return f"Error fetching financial data for {symbol}: {str(e)}"

@tool("News Data Tool")
def news_data_tool(symbol: str) -> str:
    """Useful to get the latest news headlines and sentiment for a stock symbol."""
    try:
        data = market_service.get_news(symbol)
        if not data:
            return f"No news found for {symbol}."
        headlines = "\n".join([f"- {n['title']}: {n.get('description', '')}" for n in data])
        return headlines
    except Exception as e:
        return f"Error fetching news for {symbol}: {str(e)}"
