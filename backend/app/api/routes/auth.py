import hashlib
import hmac
import json
import time
from urllib.parse import unquote
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from ...core.database import get_db
from ...core.config import settings
from ...models.models import User, Transaction, Referral

router = APIRouter()


def validate_telegram_init_data(init_data: str) -> dict:
    """Validate Telegram WebApp initData."""
    try:
        params = {}
        for part in init_data.split("&"):
            if "=" in part:
                key, value = part.split("=", 1)
                params[key] = unquote(value)

        received_hash = params.pop("hash", "")
        check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(params.items())
        )

        secret_key = hmac.new(
            b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256
        ).digest()
        computed_hash = hmac.new(
            secret_key, check_string.encode(), hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(computed_hash, received_hash):
            raise ValueError("Invalid hash")

        auth_date = int(params.get("auth_date", 0))
        if time.time() - auth_date > 86400:
            raise ValueError("Data expired")

        user_data = json.loads(params.get("user", "{}"))
        return user_data
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid init data: {str(e)}")


def get_current_user(
    x_telegram_init_data: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not x_telegram_init_data:
        raise HTTPException(status_code=401, detail="Missing Telegram init data")

    tg_user = validate_telegram_init_data(x_telegram_init_data)
    telegram_id = str(tg_user.get("id"))

    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_banned:
        raise HTTPException(status_code=403, detail="User is banned")

    return user


def get_or_create_user(tg_user: dict, db: Session, start_param: Optional[str] = None) -> User:
    telegram_id = str(tg_user.get("id"))
    user = db.query(User).filter(User.telegram_id == telegram_id).first()

    if not user:
        user = User(
            telegram_id=telegram_id,
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
            photo_url=tg_user.get("photo_url"),
            language_code=tg_user.get("language_code", "ru"),
            fire_coins=0,
            free_used=False,
        )
        db.add(user)
        db.flush()

        if start_param and start_param.startswith("ref_"):
            ref_code = start_param[4:]
            inviter = db.query(User).filter(User.referral_code == ref_code).first()
            if inviter and inviter.id != user.id:
                user.referred_by_id = inviter.id

                referral = Referral(inviter_id=inviter.id, invited_id=user.id)
                db.add(referral)

                user.fire_coins += settings.REFERRAL_INVITED_REWARD
                tx_invited = Transaction(
                    user_id=user.id,
                    type="referral",
                    coins_change=settings.REFERRAL_INVITED_REWARD,
                    description=f"Бонус за регистрацию по реферальной ссылке",
                )
                db.add(tx_invited)

                inviter.fire_coins += settings.REFERRAL_INVITER_REWARD
                tx_inviter = Transaction(
                    user_id=inviter.id,
                    type="referral",
                    coins_change=settings.REFERRAL_INVITER_REWARD,
                    description=f"Реферальный бонус за приглашение друга",
                )
                db.add(tx_inviter)

        db.commit()
        db.refresh(user)

    return user


@router.post("/init")
async def init_user(
    x_telegram_init_data: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Initialize user session from Telegram WebApp."""
    if not x_telegram_init_data and settings.DEBUG:
        demo_user = db.query(User).filter(User.telegram_id == "demo").first()
        if not demo_user:
            demo_user = User(
                telegram_id="demo",
                username="demo_user",
                first_name="Demo",
                fire_coins=50,
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return _serialize_user(demo_user)

    if not x_telegram_init_data:
        raise HTTPException(status_code=401, detail="Missing init data")

    params = {}
    for part in x_telegram_init_data.split("&"):
        if "=" in part:
            key, value = part.split("=", 1)
            params[key] = unquote(value)

    try:
        tg_user = json.loads(params.get("user", "{}"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user data")

    start_param = params.get("start_param")
    user = get_or_create_user(tg_user, db, start_param)

    return _serialize_user(user)


def _serialize_user(user: User) -> dict:
    sub = None
    if user.subscription and user.subscription.is_active:
        sub = {
            "plan": user.subscription.plan,
            "expires_at": user.subscription.expires_at.isoformat(),
            "fire_coins_monthly": user.subscription.fire_coins_monthly,
            "is_active": user.subscription.is_active,
        }

    return {
        "id": user.id,
        "telegram_id": user.telegram_id,
        "username": user.username,
        "first_name": user.first_name,
        "fire_coins": user.fire_coins,
        "free_used": user.free_used,
        "subscription": sub,
        "referral_code": user.referral_code,
        "referrals_count": len(user.referrals_sent) if user.referrals_sent else 0,
        "total_generations": user.total_generations,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
