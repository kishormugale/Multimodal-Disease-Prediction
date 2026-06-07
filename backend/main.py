import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import seed_patients, ping_db
from ml.model_registry import registry
from routers import auth, patients, predict, reports, models_status, pdf_reports, password_reset

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    logger.info("Starting KDM Care API...")

    # Check MongoDB connectivity
    db_ok = await ping_db()
    if db_ok:
        logger.info("MongoDB connected successfully.")
        await seed_patients()
    else:
        logger.error("MongoDB unavailable — patient/report endpoints will fail.")

    # Load ML models (falls back to mock if files missing)
    registry.load_all()
    status_map = registry.get_status()
    for disease_id, mode in status_map.items():
        logger.info("  %-15s → %s predictor", disease_id, mode)

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("Shutting down KDM Care API.")


app = FastAPI(
    title="KDM Care API",
    version="2.0.0",
    description="AI Multimodal Disease Prediction System – KDM Care Hospital",
    lifespan=lifespan,
)

# CORS — allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(predict.router)
app.include_router(reports.router)
app.include_router(models_status.router)
app.include_router(pdf_reports.router)
app.include_router(password_reset.router)


@app.get("/health")
async def health():
    db_ok = await ping_db()
    model_status = registry.get_status()
    return {
        "status": "ok",
        "version": "2.0.0",
        "db": "connected" if db_ok else "unavailable",
        "models": model_status,
    }
