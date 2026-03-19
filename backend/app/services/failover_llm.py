import logging
import time
from typing import List, Any, Optional
from crewai import LLM

logger = logging.getLogger(__name__)

class FailoverLLM:
    """
    A wrapper class for multiple CrewAI LLM instances that provides 
    instant auto-switching (failover) logic.
    """
    def __init__(self, primary: LLM, fallbacks: List[LLM] = []):
        self.primary = primary
        self.fallbacks = fallbacks
        self.all_llms = [primary] + fallbacks
        
        # Metadata required by CrewAI/LiteLLM
        self.model = primary.model
        self.provider = primary.provider

    def call(self, *args, **kwargs):
        """
        Intercepts the LLM call and implements the retry-with-fallback logic.
        """
        last_error = None
        
        print(f"[FailoverLLM] Starting call chain with {len(self.all_llms)} providers")
        for i, llm in enumerate(self.all_llms):
            try:
                print(f"[FailoverLLM] [Attempt {i+1}] Trying {llm.model}...")
                
                # CrewAI LLM uses litellm internally. 
                # We delegate the call to the underlying LLM's call method.
                res = llm.call(*args, **kwargs)
                print(f"[FailoverLLM] [Success] Provider: {llm.model}")
                return res
                
            except BaseException as e:
                last_error = e
                error_msg = str(e).lower()
                print(f"[FailoverLLM] [Failure] Provider {llm.model} failed with: {error_msg[:150]}")
                
                # Check if it's a transient error that warrants a fallback
                transient_keywords = ["rate_limit", "429", "authentication", "401", "timeout", "500", "overloaded", "quota"]
                if any(x in error_msg for x in transient_keywords):
                    print(f"[FailoverLLM] Detected transient error. Switching to next provider...")
                    continue
                else:
                    print(f"[FailoverLLM] Non-transient error detected, but will try next provider anyway for safety.")
                    continue
        
        print(f"[FailoverLLM] CRITICAL: All {len(self.all_llms)} providers exhausted.")
        if last_error:
            raise last_error
        raise Exception("All LLM providers failed and no error caught.")

    # Delegate other attributes to the primary LLM
    def __getattr__(self, name):
        return getattr(self.primary, name)
