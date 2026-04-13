from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models.models import Style

router = APIRouter()


@router.get("")
async def get_styles(db: Session = Depends(get_db)):
    styles = (
        db.query(Style)
        .filter(Style.is_active == True)
        .order_by(Style.sort_order, Style.created_at)
        .all()
    )
    return [
        {
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
            "new": s.is_new,
        }
        for s in styles
    ]
