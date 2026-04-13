from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import Base, engine
from .api.routes import auth, users, generations, payments, admin, styles

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[WARNING] DB init failed: {e}")

app = FastAPI(title="LENSY AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/user", tags=["user"])
app.include_router(generations.router, prefix="/api/generations", tags=["generations"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(styles.router, prefix="/api/styles", tags=["styles"])


@app.on_event("startup")
async def seed_styles():
    from .core.database import SessionLocal
    from .models.models import Style
    from .seed_styles import SEED_STYLES
    db = SessionLocal()
    try:
        count = db.query(Style).count()
        if count == 0:
            for data in SEED_STYLES:
                db.add(Style(**data))
            db.commit()
    finally:
        db.close()


@app.get("/health")
async def health():
    return {"status": "ok", "app": "LENSY AI"}
