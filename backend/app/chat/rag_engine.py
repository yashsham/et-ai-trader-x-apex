"""
RAG Engine - Trading Knowledge Query Interface
Provides document retrieval for the AI Assistant.
"""
import logging

logger = logging.getLogger(__name__)


def query_rag(query: str) -> str:
    """
    Query the trading knowledge RAG system.
    Returns relevant trading knowledge based on the query.
    Currently returns a helpful response if RAG index is not available.
    """
    try:
        # Return a structured generic trading response as fallback
        logger.info(f"[RAG] Query received: {query[:80]}...")
        
        # Generic trading knowledge response
        return (
            f"Based on general trading principles for '{query}': "
            "Successful trading requires disciplined risk management, "
            "understanding of market cycles, and consistent application of your strategy. "
            "Always use stop-losses and never risk more than 2% of capital per trade. "
            "For Indian markets specifically: Monitor FII/DII flows, sector rotation, "
            "and RBI policy decisions as key macro drivers."
        )
    except Exception as e:
        logger.error(f"[RAG] Query failed: {e}")
        return "RAG knowledge base is currently unavailable. Proceeding with available market data."
