import hashlib
import hmac
import json
import time
import secrets
from urllib.parse import unquote
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from pydantic import BaseModel
from jose import jwt, JWTError
from ...core.database import get_db
from ...core.config import settings
from ...models.models import User, Generation, Transaction, Subscription, Style

router = APIRouter()
security = HTTPBearer(auto_error=False)

# ── Auth helpers ─────────────────────────────────────────────────────────────

def _admin_tg_ids() -> list[str]:
    raw = settings.ADMIN_TELEGRAM_IDS.strip()
    if not raw:
        return []
    return [s.strip() for s in raw.split(",") if s.strip()]


def _issue_admin_jwt(telegram_id: str) -> str:
    payload = {
        "sub": telegram_id,
        "role": "admin",
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 * 7,  # 7 days
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_admin_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authorization header required")

    token = credentials.credentials

    # Static admin token
    if token == settings.ADMIN_TOKEN:
        ids = _admin_tg_ids()
        if ids:
            user = db.query(User).filter(User.telegram_id == ids[0]).first()
            if user:
                return user
        raise HTTPException(status_code=403, detail="No admin users configured")

    # JWT token
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not an admin token")
        telegram_id = payload.get("sub")
        if telegram_id not in _admin_tg_ids():
            raise HTTPException(status_code=403, detail="Telegram ID not in admin list")
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Admin user not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Login ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    init_data: Optional[str] = None
    admin_token: Optional[str] = None


@router.post("/login")
async def admin_login(body: LoginRequest, db: Session = Depends(get_db)):
    allowed_ids = _admin_tg_ids()

    # Method 1: static admin token → returns jwt for first configured admin ID
    if body.admin_token:
        if body.admin_token != settings.ADMIN_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid admin token")
        if not allowed_ids:
            raise HTTPException(status_code=403, detail="ADMIN_TELEGRAM_IDS not configured")
        return {
            "token": _issue_admin_jwt(allowed_ids[0]),
            "telegram_id": allowed_ids[0],
        }

    # Method 2: Telegram WebApp initData
    if body.init_data:
        try:
            params: dict = {}
            for part in body.init_data.split("&"):
                if "=" in part:
                    k, v = part.split("=", 1)
                    params[k] = unquote(v)
            received_hash = params.pop("hash", "")
            check_str = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
            secret_key = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
            computed = hmac.new(secret_key, check_str.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(computed, received_hash):
                raise HTTPException(status_code=401, detail="Invalid Telegram data")
            tg_user = json.loads(params.get("user", "{}"))
            telegram_id = str(tg_user.get("id", ""))
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Bad init data: {e}")

        if telegram_id not in allowed_ids:
            raise HTTPException(status_code=403, detail="This Telegram account is not an admin")

        return {
            "token": _issue_admin_jwt(telegram_id),
            "telegram_id": telegram_id,
        }

    raise HTTPException(status_code=400, detail="Provide admin_token or init_data")


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_gens = db.query(func.count(Generation.id)).scalar()
    completed_gens = db.query(func.count(Generation.id)).filter(Generation.status == "completed").scalar()
    active_subs = db.query(func.count(Subscription.id)).filter(Subscription.is_active == True).scalar()
    total_revenue = db.query(func.sum(Transaction.amount)).filter(Transaction.amount > 0).scalar() or 0
    total_styles = db.query(func.count(Style.id)).filter(Style.is_active == True).scalar()

    return {
        "total_users": total_users,
        "total_generations": total_gens,
        "completed_generations": completed_gens,
        "active_subscriptions": active_subs,
        "total_revenue_rub": total_revenue,
        "total_styles": total_styles,
    }


# ── Styles CRUD ──────────────────────────────────────────────────────────────

class StyleBody(BaseModel):
    id: Optional[str] = None
    name: str
    category: str = "standard"
    image: str
    price_fast: int = 5
    price_standard: int = 10
    price_premium: int = 20
    badge: Optional[str] = None
    tags: List[str] = []
    prompt: str = ""
    trending: bool = False
    popular: bool = False
    is_new: bool = False
    is_active: bool = True
    sort_order: int = 0


def _serialize_style(s: Style) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "category": s.category,
        "image": s.image,
        "price_fast": s.price_fast,
        "price_standard": s.price_standard,
        "price_premium": s.price_premium,
        "badge": s.badge,
        "tags": s.tags or [],
        "prompt": s.prompt,
        "trending": s.trending,
        "popular": s.popular,
        "is_new": s.is_new,
        "is_active": s.is_active,
        "sort_order": s.sort_order,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
    }


@router.get("/styles")
async def list_styles(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    styles = db.query(Style).order_by(Style.sort_order, Style.created_at).all()
    return [_serialize_style(s) for s in styles]


@router.post("/styles", status_code=201)
async def create_style(
    body: StyleBody,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    style_id = body.id or body.name.lower().replace(" ", "_").replace("-", "_")
    existing = db.query(Style).filter(Style.id == style_id).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Style with id '{style_id}' already exists")

    style = Style(
        id=style_id,
        name=body.name,
        category=body.category,
        image=body.image,
        price_fast=body.price_fast,
        price_standard=body.price_standard,
        price_premium=body.price_premium,
        badge=body.badge,
        tags=body.tags,
        prompt=body.prompt,
        trending=body.trending,
        popular=body.popular,
        is_new=body.is_new,
        is_active=body.is_active,
        sort_order=body.sort_order,
    )
    db.add(style)
    db.commit()
    db.refresh(style)
    return _serialize_style(style)


@router.put("/styles/{style_id}")
async def update_style(
    style_id: str,
    body: StyleBody,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    style = db.query(Style).filter(Style.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")

    for field in ["name", "category", "image", "price_fast", "price_standard",
                   "price_premium", "badge", "tags", "prompt", "trending",
                   "popular", "is_new", "is_active", "sort_order"]:
        setattr(style, field, getattr(body, field))

    db.commit()
    db.refresh(style)
    return _serialize_style(style)


@router.delete("/styles/{style_id}", status_code=204)
async def delete_style(
    style_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    style = db.query(Style).filter(Style.id == style_id).first()
    if not style:
        raise HTTPException(status_code=404, detail="Style not found")
    db.delete(style)
    db.commit()


# ── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
async def get_users(
    page: int = 1,
    search: Optional[str] = None,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    per_page = 20
    q = db.query(User)
    if search:
        q = q.filter(or_(
            User.username.ilike(f"%{search}%"),
            User.first_name.ilike(f"%{search}%"),
            User.telegram_id.ilike(f"%{search}%"),
        ))
    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "users": [
            {
                "id": u.id,
                "telegram_id": u.telegram_id,
                "username": u.username,
                "first_name": u.first_name,
                "fire_coins": u.fire_coins,
                "total_generations": u.total_generations,
                "subscription": u.subscription.plan if u.subscription and u.subscription.is_active else None,
                "is_admin": u.is_admin,
                "is_banned": u.is_banned,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
    }


class UserActionBody(BaseModel):
    action: str  # "ban" | "unban" | "add_coins" | "set_admin" | "revoke_admin"
    value: Optional[int] = None


@router.post("/users/{user_id}/action")
async def user_action(
    user_id: int,
    body: UserActionBody,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.action == "ban":
        user.is_banned = True
    elif body.action == "unban":
        user.is_banned = False
    elif body.action == "add_coins":
        amount = body.value or 0
        user.fire_coins += amount
        tx = Transaction(
            user_id=user.id,
            type="admin_grant",
            coins_change=amount,
            description=f"Начислено администратором ({admin.username or admin.telegram_id})",
        )
        db.add(tx)
    elif body.action == "set_admin":
        user.is_admin = True
    elif body.action == "revoke_admin":
        user.is_admin = False
    else:
        raise HTTPException(status_code=400, detail="Unknown action")

    db.commit()
    return {"ok": True, "user_id": user_id, "action": body.action}


# ── Generations ──────────────────────────────────────────────────────────────

@router.get("/generations")
async def get_generations(
    page: int = 1,
    status: Optional[str] = None,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    per_page = 20
    q = db.query(Generation)
    if status:
        q = q.filter(Generation.status == status)
    total = q.count()
    gens = q.order_by(Generation.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "generations": [
            {
                "id": g.id,
                "user_id": g.user_id,
                "style_id": g.style_id,
                "style_name": g.style_name,
                "tier": g.tier,
                "cost": g.cost,
                "status": g.status,
                "images": g.images,
                "error_message": g.error_message,
                "created_at": g.created_at.isoformat() if g.created_at else None,
            }
            for g in gens
        ],
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
    }
