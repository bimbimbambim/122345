from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ...core.database import get_db
from ...models.models import User, Generation, Transaction
from ...services.ai_service import generate_photo, validate_face, upload_to_storage
from .auth import get_current_user

router = APIRouter()

STYLE_NAMES = {
    "street": "Уличный стиль",
    "business": "Бизнес портрет",
    "cinematic": "Киношный",
    "instagram": "Instagram",
    "dark": "Тёмный стиль",
    "vogue": "Vogue",
    "luxury": "Luxury Editorial",
    "celebrity": "Celebrity",
    "old_money": "Old Money",
    "red_carpet": "Red Carpet",
}

STYLE_CATEGORIES = {
    "street": "standard", "business": "standard", "cinematic": "standard",
    "instagram": "standard", "dark": "standard",
    "vogue": "premium", "luxury": "premium", "celebrity": "premium",
    "old_money": "premium", "red_carpet": "premium",
}

TIER_COSTS = {
    "fast": {"standard": 5, "premium": 8},
    "standard": {"standard": 10, "premium": 15},
    "premium": {"standard": 20, "premium": 30},
}


class CreateGenerationRequest(BaseModel):
    style_id: str
    tier: str
    photo_base64: str


def _serialize_generation(gen: Generation) -> dict:
    return {
        "id": gen.id,
        "style_id": gen.style_id,
        "style_name": gen.style_name,
        "tier": gen.tier,
        "cost": gen.cost,
        "status": gen.status,
        "images": gen.images or [],
        "created_at": gen.created_at.isoformat(),
    }


async def _run_generation(generation_id: str, style_id: str, tier: str, photo_base64: str, db: Session):
    gen = db.query(Generation).filter(Generation.id == generation_id).first()
    if not gen:
        return

    try:
        gen.status = "processing"
        db.commit()

        images = await generate_photo(style_id, tier, photo_base64)

        stored_images = []
        for idx, url in enumerate(images):
            stored_url = await upload_to_storage(url, generation_id, idx)
            stored_images.append(stored_url)

        gen.images = stored_images
        gen.status = "completed"
        db.commit()

    except Exception as e:
        gen.status = "failed"
        gen.error_message = str(e)
        db.commit()


@router.post("")
async def create_generation(
    request: CreateGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if request.style_id not in STYLE_NAMES:
        raise HTTPException(status_code=400, detail="Неверный стиль")

    if request.tier not in ["fast", "standard", "premium"]:
        raise HTTPException(status_code=400, detail="Неверный тир")

    style_category = STYLE_CATEGORIES.get(request.style_id, "standard")
    cost = TIER_COSTS[request.tier][style_category]

    if not current_user.free_used:
        current_user.free_used = True
        cost = 0
    elif current_user.fire_coins < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Недостаточно огоньков. Нужно {cost} 🔥, у вас {current_user.fire_coins} 🔥"
        )
    else:
        current_user.fire_coins -= cost

    is_valid = await validate_face(request.photo_base64)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Не удалось распознать лицо. Загрузите более чёткое селфи"
        )

    generation = Generation(
        user_id=current_user.id,
        style_id=request.style_id,
        style_name=STYLE_NAMES[request.style_id],
        tier=request.tier,
        cost=cost,
        status="pending",
    )
    db.add(generation)
    current_user.total_generations += 1

    if cost > 0:
        tx = Transaction(
            user_id=current_user.id,
            type="generation",
            coins_change=-cost,
            description=f"Генерация: {STYLE_NAMES[request.style_id]} ({request.tier})",
        )
        db.add(tx)

    db.commit()
    db.refresh(generation)

    background_tasks.add_task(
        _run_generation,
        generation.id,
        request.style_id,
        request.tier,
        request.photo_base64,
        db,
    )

    return _serialize_generation(generation)


@router.get("/{generation_id}")
async def get_generation(
    generation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gen = db.query(Generation).filter(
        Generation.id == generation_id,
        Generation.user_id == current_user.id,
    ).first()

    if not gen:
        raise HTTPException(status_code=404, detail="Генерация не найдена")

    return _serialize_generation(gen)


@router.get("")
async def list_generations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gens = (
        db.query(Generation)
        .filter(Generation.user_id == current_user.id)
        .order_by(Generation.created_at.desc())
        .limit(50)
        .all()
    )
    return [_serialize_generation(g) for g in gens]
