from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models.models import User, Transaction, Referral
from .auth import get_current_user, _serialize_user

router = APIRouter()


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return _serialize_user(current_user)


@router.get("/transactions")
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": tx.id,
            "type": tx.type,
            "amount": tx.amount,
            "coins_change": tx.coins_change,
            "description": tx.description,
            "created_at": tx.created_at.isoformat(),
        }
        for tx in txs
    ]


@router.get("/referrals")
async def get_referrals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    referrals = (
        db.query(Referral)
        .filter(Referral.inviter_id == current_user.id)
        .all()
    )
    earned = sum(
        20 for r in referrals if r.inviter_rewarded
    )
    return {
        "count": len(referrals),
        "earned": earned,
    }
