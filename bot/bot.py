import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, F
from aiogram.types import (
    Message, InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo, BotCommand, PreCheckoutQuery, SuccessfulPayment,
    LabeledPrice,
)
from aiogram.filters import CommandStart, Command
from aiogram.enums import ParseMode
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-app.netlify.app")
API_URL = os.getenv("API_URL", "http://localhost:8000")

bot = Bot(token=BOT_TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()

WELCOME_TEXT = (
    "✨ <b>LENSY AI — AI Фото Студия</b>\n\n"
    "Создай профессиональную фотосессию из своего фото за секунды.\n\n"
    "🔥 <b>3000+ уникальных образов</b>\n"
    "👑 Стили: Street, Business, Vogue, Celebrity и многие другие\n"
    "⚡️ Первая генерация — <b>бесплатно</b>!\n\n"
    "Нажми кнопку ниже, чтобы начать 👇"
)


def get_main_keyboard(start_param: str = "") -> InlineKeyboardMarkup:
    url = WEBAPP_URL
    if start_param:
        url = f"{WEBAPP_URL}?tgWebAppStartParam={start_param}"

    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="📸 Открыть приложение",
                web_app=WebAppInfo(url=url),
            )
        ],
        [
            InlineKeyboardButton(
                text="🔥 Пригласить друга (+20 🔥)",
                callback_data="share_referral",
            )
        ],
    ])


@dp.message(CommandStart())
async def cmd_start(message: Message):
    start_param = ""
    if message.text and len(message.text.split()) > 1:
        start_param = message.text.split()[1]

    await message.answer_photo(
        photo="https://via.placeholder.com/800x400/0B0B0F/D4AF37?text=LENSY+AI",
        caption=WELCOME_TEXT,
        reply_markup=get_main_keyboard(start_param),
    )


@dp.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "📋 <b>Как пользоваться LENSY AI:</b>\n\n"
        "1. Открой приложение кнопкой ниже\n"
        "2. Выбери понравившийся стиль\n"
        "3. Загрузи своё селфи\n"
        "4. Получи профессиональное фото!\n\n"
        "💡 Первая генерация — бесплатно.\n"
        "🔥 За каждого приглашённого друга — +20 огоньков.",
        reply_markup=get_main_keyboard(),
    )


@dp.message(Command("balance"))
async def cmd_balance(message: Message):
    import httpx
    telegram_id = str(message.from_user.id)
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{API_URL}/api/user/me",
                headers={"X-Telegram-Id": telegram_id},
                timeout=5,
            )
            if resp.status_code == 200:
                user = resp.json()
                await message.answer(
                    f"💰 <b>Твой баланс:</b> {user['fire_coins']} 🔥\n"
                    f"✨ Генераций: {user['total_generations']}\n"
                    f"👑 Подписка: {'Активна ✅' if user['subscription'] else 'Нет'}"
                )
                return
    except Exception:
        pass
    await message.answer("Открой приложение для просмотра баланса.", reply_markup=get_main_keyboard())


@dp.callback_query(F.data == "share_referral")
async def share_referral(callback):
    import httpx
    telegram_id = str(callback.from_user.id)
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{API_URL}/api/user/me",
                headers={"X-Telegram-Id": telegram_id},
                timeout=5,
            )
            if resp.status_code == 200:
                user = resp.json()
                ref_code = user.get("referral_code", "")
                ref_link = f"https://t.me/{(await bot.get_me()).username}?start=ref_{ref_code}"

                await callback.message.answer(
                    f"🔗 <b>Твоя реферальная ссылка:</b>\n\n"
                    f"<code>{ref_link}</code>\n\n"
                    f"Поделись с другом и получи <b>+20 🔥</b> когда он зарегистрируется!\n"
                    f"Друг тоже получит <b>+10 🔥</b> в подарок.",
                )
                await callback.answer()
                return
    except Exception:
        pass

    await callback.answer("Не удалось получить ссылку", show_alert=True)


@dp.pre_checkout_query()
async def pre_checkout(pre_checkout_query: PreCheckoutQuery):
    await bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)


@dp.message(F.successful_payment)
async def successful_payment(message: Message):
    payment = message.successful_payment
    await message.answer(
        f"✅ <b>Оплата прошла успешно!</b>\n\n"
        f"Сумма: {payment.total_amount // 100} {payment.currency}\n\n"
        f"Открой приложение чтобы увидеть обновлённый баланс.",
        reply_markup=get_main_keyboard(),
    )


async def set_bot_commands():
    await bot.set_my_commands([
        BotCommand(command="start", description="Открыть LENSY AI"),
        BotCommand(command="balance", description="Мой баланс"),
        BotCommand(command="help", description="Помощь"),
    ])


async def main():
    await set_bot_commands()
    logger.info("Starting LENSY AI bot...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
