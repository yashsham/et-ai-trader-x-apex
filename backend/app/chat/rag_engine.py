import os
from llama_index.core import VectorStoreIndex, Document, Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from dotenv import load_dotenv

load_dotenv()

# Initialize LlamaIndex Settings
def _init_settings():
    try:
        # Use Groq if available (falling back to OpenAI would be added if needed, but Groq is ultra-fast)
        if os.getenv("GROQ_API_KEY"):
            llm = Groq(model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"), api_key=os.getenv("GROQ_API_KEY"))
            Settings.llm = llm
        
        # Use local embeddings to save costs and run fast
        embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
        Settings.embed_model = embed_model
    except Exception as e:
        print("[RAG Init] Warning: LLM or Embedding initialization failed:", e)

_init_settings()

# Default Knowledge Base Documents (Can be expanded to real user DB data later)
default_docs = [
    Document(text="Always use stop-loss orders to protect your capital. A standard rule is to risk no more than 1-2% of your portfolio per trade."),
    Document(text="If a stock is hitting new 52-week highs on high volume, it is typically a strong bullish signal."),
    Document(text="A P/E ratio below 15 might indicate a stock is undervalued, but it heavily depends on the sector average."),
    Document(text="When trading Indian stocks, observe NIFTY 50 and BANKNIFTY trends first to understand the broader market sentiment."),
    Document(text="Do not average down on losing trades unless it is part of a pre-planned long-term SIP strategy."),
]

# Create an in-memory index
try:
    index = VectorStoreIndex.from_documents(default_docs)
except Exception as e:
    print("[RAG Init] Failed to create index:", e)
    index = None

def query_rag(query_str: str) -> str:
    """Query the LlamaIndex knowledge base"""
    if not index:
        return "RAG Knowledge base is currently offline."
        
    try:
        query_engine = index.as_query_engine()
        response = query_engine.query(query_str)
        return str(response)
    except Exception as e:
        print("[RAG Query Error]:", e)
        return f"Could not retrieve context due to an error: {str(e)}"
