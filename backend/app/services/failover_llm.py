import logging
import time
from typing import List, Any, Optional
from crewai import LLM

logger = logging.getLogger(__name__)

class FailoverLLM(LLM):
    """
    A wrapper class for multiple CrewAI LLM instances that provides 
    instant auto-switching (failover) logic. Subclasses LLM to pass
    CrewAI's strict Pydantic type validation on Agent.llm.
    """
    def __init__(self, **kwargs):
        # Initialize the Pydantic base class cleanly without any custom arguments
        super().__init__(**kwargs)
        # These will be populated explicitly after initialization to bypass Pydantic errors
        self.primary = None
        self.fallbacks = []
        self.all_llms = []
        self._circuit_breakers = {}
        self.cooldown_period = 60
        self.max_failures = 3

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
                print(f"[FailoverLLM] [Skip] {llm.model} is in cooling down phase.")
                continue

            try:
                print(f"[FailoverLLM] [Attempt {i+1}] Trying {llm.model}...")
                res = llm.call(*args, **kwargs)
                self._record_success(llm.model)
                print(f"[FailoverLLM] [Success] {llm.model}")
                return res
                
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                print(f"[FailoverLLM] [Failure] {llm.model}: {error_str[:150]}")
                
                # IMMEDIATE circuit break for quota/rate-limit — no point retrying
                if any(k in error_str for k in ["429", "quota", "resource_exhausted", "rate_limit", "rate limit"]):
                    logger.warning(f"[FailoverLLM] INSTANT OPEN circuit for {llm.model} (quota exhausted). Forcing failover.")
                    # Directly open the circuit breaker by recording max_failures
                    self._circuit_breakers[llm.model] = (self.max_failures, time.time())
                else:
                    self._record_failure(llm.model)
                
                if i < len(self.all_llms) - 1:
                    next_model = self.all_llms[i + 1].model
                    print(f"[FailoverLLM] Failing over to: {next_model}")
                    continue
                else:
                    raise e
        
        if last_error:
            raise last_error
        raise Exception("All LLMs skipped or failed — check API keys and quotas.")

    # Delegate other attributes to the primary LLM
    def __getattr__(self, name):
        return getattr(self.primary, name)
