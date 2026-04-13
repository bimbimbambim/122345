from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from ...core.database import get_db
from ...models.models import User, Transaction, Subscription
from ...core.config import settings
from .auth import get_current_user

router = APIRouter()


class CreateInvoiceRequest(BaseModel):
    product_id: str
    product_type: str


class VerifyPaymentRequest(BaseModel):
    payment_id: str
    telegram_payment_charge_id: str


@router.post("/invoice")
async def create_invoice(
    request: CreateInvoiceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create Telegram Stars payment invoice.
    Returns invoice_url for tg.openInvoice().
    """
    product_type = request.product_type
    product_id = request.product_id

    if product_type == "coins":
        pack = settings.COIN_PACKS.get(product_id)
        if not pack:
            raise HTTPException(status_code=404, detail="Пакет не найден")

        title = f"{pack['coins']} огоньков"
        description = f"Пополнение баланса: {pack['coins']} 🔥"
        price = pack["price"]

    elif product_type == "subscription":
        plan = settings.SUBSCRIPTION_PLANS.get(product_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Подписка не найдена")

        title = f"Подписка {product_id.upper()}"
        description = f"Подписка на 30 дней: {plan['coins']} 🔥 в месяц"
        price = plan["price"]

    elif product_type == "direct":
        product = settings.DIRECT_PRODUCTS.get(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Продукт не найден")

        title = f"1 генерация ({product['tier']})"
        description = "Одна AI генерация без подписки"
        price = product["price"]

    else:
        raise HTTPException(status_code=400, detail="Неверный тип продукта")

    invoice_url = (
        f"https://t.me/invoice/{settings.BOT_USERNAME}?"
        f"start=pay_{product_type}_{product_id}_{current_user.telegram_id}"
    )

    return {
        "invoice_url": invoice_url,
        "title": title,
        "description": description,
        "price": price,
        "product_id": product_id,
        "product_type": product_type,
    }


@router.post("/webhook/telegram")
async def telegram_payment_webhook(
    payload: dict,
    db: Session = Depends(get_db),
):
    """Handle Telegram payment webhook (pre_checkout_query and successful_payment)."""
    if "pre_checkout_query" in payload:
        return {"ok": True}

    message = payload.get("message", {})
    payment = message.get("successful_payment")
    if not payment:
        return {"ok": True}

    telegram_id = str(message.get("from", {}).get("id", ""))
    if not telegram_id:
        return {"ok": True}

    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        return {"ok": True}

    invoice_payload = payment.get("invoice_payload", "")
    charge_id = payment.get("telegram_payment_charge_id", "")

    parts = invoice_payload.split("_", 3)
    if len(parts) < 3:
        return {"ok": True}

    _, product_type, product_id = parts[0], parts[1], parts[2]

    if product_type == "coins":
        pack = settings.COIN_PACKS.get(product_id)
        if pack:
            user.fire_coins += pack["coins"]
            tx = Transaction(
                user_id=user.id,
                type="purchase",
                amount=pack["price"],
                coins_change=pack["coins"],
                description=f"Купил {pack['coins']} 🔥",
                product_id=product_id,
                telegram_payment_charge_id=charge_id,
            )
            db.add(tx)

    elif product_type == "subscription":
        plan = settings.SUBSCRIPTION_PLANS.get(product_id)
        if plan:
            existing_sub = user.subscription
            if existing_sub:
                existing_sub.is_active = False

            new_sub = Subscription(
                user_id=user.id,
                plan=product_id,
                price_rub=plan["price"],
                fire_coins_monthly=plan["coins"],
                is_active=True,
                telegram_payment_charge_id=charge_id,
                expires_at=datetime.utcnow() + timedelta(days=30),
            )
            db.add(new_sub)

            user.fire_coins += plan["coins"]
            tx = Transaction(
                user_id=user.id,
                type="subscription",
                amount=plan["price"],
                coins_change=plan["coins"],
                description=f"Подписка {product_id.upper()} — {plan['coins']} 🔥",
                product_id=product_id,
                telegram_payment_charge_id=charge_id,
            )
            db.add(tx)

    elif product_type == "direct":
        product = settings.DIRECT_PRODUCTS.get(product_id)
        if product:
            cost_map = {"standard": 10, "premium": 20}
            coins_to_add = cost_map.get(product["tier"], 10)
            user.fire_coins += coins_to_add

            tx = Transaction(
                user_id=user.id,
                type="purchase",
                amount=product["price"],
                coins_change=coins_to_add,
                description=f"Покупка генерации ({product['tier']})",
                product_id=product_id,
                telegram_payment_charge_id=charge_id,
            )
            db.add(tx)

    db.commit()
    return {"ok": True}
