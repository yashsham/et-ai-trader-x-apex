import requests
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class TranslationService:
    def __init__(self):
        self.api_key = settings.GOOGLE_TRANSLATE_API_KEY
        self.base_url = "https://translation.googleapis.com/language/translate/v2"
        
        # Mapping frontend language names to Google Cloud language codes
        self.lang_map = {
            "Hindi": "hi",
            "Gujarati": "gu",
            "Marathi": "mr",
            "Bengali": "bn",
            "Tamil": "ta",
            "Telugu": "te",
            "Kannada": "kn",
            "Malayalam": "ml",
            "Punjabi": "pa",
            "English": "en"
        }

    def translate(self, text: str, target_lang_name: str) -> str:
        """
        Translates text to the target language using Google Cloud Translation API.
        If the language is English or API key is missing, returns original text.
        """
        if not self.api_key or target_lang_name == "English":
            return text
            
        target_code = self.lang_map.get(target_lang_name)
        if not target_code:
            logger.warning(f"[Translation] Language {target_lang_name} not supported for dedicated translation fallback.")
            return text

        try:
            params = {
                "q": text,
                "target": target_code,
                "key": self.api_key,
                "format": "text" # Use text to avoid HTML escaping
            }
            
            response = requests.post(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            translations = data.get("data", {}).get("translations", [])
            if translations:
                translated_text = translations[0].get("translatedText")
                logger.info(f"[Translation] Successfully translated block to {target_lang_name}")
                return translated_text
                
        except Exception as e:
            logger.error(f"[Translation] Failed to translate to {target_lang_name}: {e}")
            
        return text

translation_service = TranslationService()
