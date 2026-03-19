from typing import List, Optional
from llama_index.core import VectorStoreIndex, Document, StorageContext, load_index_from_storage
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import Settings
from app.core.config import settings

class RAGService:
    def __init__(self):
        self.index = None
        self.query_engine = None
        self._initialize_settings()

    def _initialize_settings(self):
        """
        Initialize LlamaIndex settings with robust fallbacks.
        LLM: OpenAI -> Groq
        Embeddings: OpenAI -> HuggingFace (Local)
        """
        # 1. Initialize LLM with Fallback
        try:
            if settings.OPENAI_API_KEY:
                from llama_index.llms.openai import OpenAI
                Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0.1)
                print("[RAG] LLM initialized with OpenAI.")
            elif settings.GROQ_API_KEY:
                from llama_index.llms.groq import Groq
                Settings.llm = Groq(model=settings.GROQ_MODEL or "llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)
                print("[RAG] LLM fallback to Groq.")
            else:
                from llama_index.llms.openai import OpenAI
                Settings.llm = OpenAI(model="gpt-4o-mini") # Will fail if no key, but provides a default
        except Exception as e:
            print(f"[RAG] LLM initialization error: {e}")

        # 2. Initialize Embeddings with Fallback
        try:
            if settings.OPENAI_API_KEY:
                from llama_index.embeddings.openai import OpenAIEmbedding
                Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
                print("[RAG] Embeddings initialized with OpenAI.")
            else:
                from llama_index.embeddings.huggingface import HuggingFaceEmbedding
                Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
                print("[RAG] Embeddings fallback to HuggingFace (Local).")
        except Exception as e:
            print(f"[RAG] Embedding initialization failed: {e}. Falling back to Mock.")
            from llama_index.core.embeddings.mock_utils import MockEmbedding
            Settings.embed_model = MockEmbedding(embed_dim=1536)

    def index_documents(self, doc_texts: List[str]):
        """Create a vector index from raw strings."""
        try:
            documents = [Document(text=t) for h, t in enumerate(doc_texts)]
            self.index = VectorStoreIndex.from_documents(documents)
            self.query_engine = self.index.as_query_engine(similarity_top_k=3)
            print(f"[RAG] Indexed {len(doc_texts)} documents.")
        except Exception as e:
            print(f"[RAG] Indexing failed: {e}. Attempting fallback with MockEmbedding.")
            try:
                from llama_index.core.embeddings.mock_utils import MockEmbedding
                Settings.embed_model = MockEmbedding(embed_dim=1536)
                documents = [Document(text=t) for h, t in enumerate(doc_texts)]
                self.index = VectorStoreIndex.from_documents(documents)
                self.query_engine = self.index.as_query_engine(similarity_top_k=3)
                print(f"[RAG] Indexed {len(doc_texts)} documents with MockEmbedding.")
            except Exception as e2:
                print(f"[RAG] Fallback indexing also failed: {e2}")

    def query(self, query_str: str) -> str:
        """Search the knowledge base for relevant context."""
        if not self.query_engine:
            return "Knowledge base is empty or not indexed."
        try:
            response = self.query_engine.query(query_str)
            return str(response)
        except Exception as e:
            print(f"[RAG] Query failed: {e}")
            return f"Error retrieving context: {str(e)}"

rag_service = RAGService()
