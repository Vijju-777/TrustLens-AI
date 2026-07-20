"""
Centralized configuration loader.
All environment variables are read once here so the rest of the app
never touches os.environ directly (single source of truth).
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000"
    ).split(",")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

    def validate(self) -> list[str]:
        """Return a list of missing critical settings (used at startup)."""
        missing = []
        if not self.GEMINI_API_KEY:
            missing.append("GEMINI_API_KEY")
        if not self.MONGODB_URI:
            missing.append("MONGODB_URI")
        return missing


settings = Settings()
