from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import secrets


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    language_code = Column(String, default="ru")
    fire_coins = Column(Integer, default=0)
    free_used = Column(Boolean, default=False)
    referral_code = Column(String, unique=True, default=lambda: secrets.token_urlsafe(8))
    referred_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_generations = Column(Integer, default=0)
    is_admin = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    subscription = relationship("Subscription", back_populates="user", uselist=False)
    generations = relationship("Generation", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    referrals_sent = relationship("User", foreign_keys=[referred_by_id])


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan = Column(String, nullable=False)
    price_rub = Column(Integer, nullable=False)
    fire_coins_monthly = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    telegram_payment_charge_id = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="subscription")


class Generation(Base):
    __tablename__ = "generations"

    id = Column(String, primary_key=True, default=lambda: secrets.token_urlsafe(16))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    style_id = Column(String, nullable=False)
    style_name = Column(String, nullable=False)
    tier = Column(String, nullable=False)
    cost = Column(Integer, nullable=False)
    status = Column(String, default="pending")
    images = Column(JSON, default=list)
    input_photo_url = Column(String, nullable=True)
    replicate_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="generations")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: secrets.token_urlsafe(16))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    amount = Column(Integer, default=0)
    coins_change = Column(Integer, default=0)
    description = Column(String, nullable=False)
    product_id = Column(String, nullable=True)
    telegram_payment_charge_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions")


class Style(Base):
    __tablename__ = "styles"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, default="standard")
    image = Column(String, nullable=False)
    price_fast = Column(Integer, nullable=False, default=5)
    price_standard = Column(Integer, nullable=False, default=10)
    price_premium = Column(Integer, nullable=False, default=20)
    badge = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    prompt = Column(Text, nullable=False, default="")
    trending = Column(Boolean, default=False)
    popular = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    inviter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    invited_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    inviter_rewarded = Column(Boolean, default=False)
    invited_rewarded = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
