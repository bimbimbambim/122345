from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "LENSY AI"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/lensy_ai"
    REDIS_URL: str = "redis://localhost:6379/0"

    BOT_TOKEN: str = ""
    BOT_USERNAME: str = "lensy_ai_bot"
    WEBAPP_URL: str = "https://your-app.netlify.app"

    REPLICATE_API_TOKEN: str = ""
    REPLICATE_SDXL_MODEL: str = "stability-ai/sdxl:39ed52f2319f9b7e6a66f92caafd32671ae8d5d3e738f4f3e88e1e15e01cc3a3"
    REPLICATE_FLUX_MODEL: str = "black-forest-labs/flux-1.1-pro"
    REPLICATE_IP_ADAPTER_MODEL: str = "zsxkib/instant-id:d98280efc9b5e7d46a62b46e6e9c04fde9de85c2b1568e620ab2a9bfb1e0a16b"

    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "us-east-1"

    SECRET_KEY: str = "change-me-in-production-please"
    ALGORITHM: str = "HS256"
    ADMIN_TOKEN: str = "change-this-admin-token"
    ADMIN_TELEGRAM_IDS: str = ""

    REFERRAL_INVITER_REWARD: int = 20
    REFERRAL_INVITED_REWARD: int = 10

    COIN_PACKS: dict = {
        "pack_40": {"price": 100, "coins": 40},
        "pack_140": {"price": 300, "coins": 140},
        "pack_260": {"price": 500, "coins": 260},
        "pack_600": {"price": 1000, "coins": 600},
    }

    SUBSCRIPTION_PLANS: dict = {
        "basic": {"price": 299, "coins": 60},
        "pro": {"price": 499, "coins": 140},
        "max": {"price": 799, "coins": 300},
    }

    DIRECT_PRODUCTS: dict = {
        "direct_standard": {"price": 129, "tier": "standard"},
        "direct_premium": {"price": 199, "tier": "premium"},
        "direct_creator": {"price": 249, "tier": "premium", "hd": True},
    }

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
