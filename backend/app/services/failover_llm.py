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
        
        # Circuit Breaker state: {model_name: (failure_count, last_failure_time)}
        self._circuit_breakers = {}
        self.cooldown_period = 60 # Seconds
        self.max_failures = 3

        # Metadata required by CrewAI/LiteLLM
        self.model = primary.model
        self.provider = primary.provider

    def _is_broken(self, model_name: str) -> bool:
        """Check if the circuit breaker for a specific model is open."""
        if model_name not in self._circuit_breakers:
            return False
        
        failures, last_time = self._circuit_breakers[model_name]
        if failures >= self.max_failures:
            if time.time() - last_time < self.cooldown_period:
                return True
            else:
                # Reset circuit on cooldown expiry (Half-Open)
                logger.info(f"[CircuitBreaker] Cooldown expired for {model_name}. Attempting recovery.")
                return False
        return False

    def _record_failure(self, model_name: str):
        """记录失败并更新熔断状态."""
        failures, _ = self._circuit_breakers.get(model_name, (0, 0))
        self._circuit_breakers[model_name] = (failures + 1, time.time())
        if failures + 1 >= self.max_failures:
            logger.critical(f"[CircuitBreaker] OPENed for {model_name}. Cooling down.")

    def _record_success(self, model_name: str):
        """Reset state on success."""
        if model_name in self._circuit_breakers:
            del self._circuit_breakers[model_name]

    def call(self, *args, **kwargs):
        last_error = None
        
        for i, llm in enumerate(self.all_llms):
            # Check circuit breaker
            if self._is_broken(llm.model):
                print(f"[FailoverLLM] [Skip] {llm.model} is currently in cooling down phase.")
                continue

            try:
                print(f"[FailoverLLM] [Attempt {i+1}] Trying {llm.model}...")
                res = llm.call(*args, **kwargs)
                self._record_success(llm.model)
                return res
                
            except Exception as e:
                last_error = e
                self._record_failure(llm.model)
                error_msg = str(e).lower()
                print(f"[FailoverLLM] [Failure] {llm.model}: {error_msg[:100]}")
                
                if i < len(self.all_llms) - 1:
                    continue
                else:
                    raise e
        
        if last_error:
            raise last_error
        raise Exception("All LLMs skipped or failed.")

    # Delegate other attributes to the primary LLM
    def __getattr__(self, name):
        return getattr(self.primary, name)
