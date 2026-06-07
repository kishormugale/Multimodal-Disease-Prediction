from fastapi import APIRouter
from ml.model_registry import registry

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/status")
async def get_models_status():
    return registry.get_status()
