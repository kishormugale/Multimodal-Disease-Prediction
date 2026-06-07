import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request, status
from pydantic import BaseModel
from ml.model_registry import registry, IMAGE_DISEASES, TABULAR_DISEASES, DISEASE_NAMES
from ml.mock_predictor import derive_risk
from db import get_reports_collection

router = APIRouter(prefix="/api/predict", tags=["predict"])

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg"}


class PredictionResponse(BaseModel):
    result: str
    confidence: float
    risk: str
    suggestion: str
    reportId: Optional[str] = None


async def _save_report(disease_id: str, result, patient_id: Optional[str] = None):
    report_id = str(uuid.uuid4())
    report = {
        "id": report_id,
        "disease": DISEASE_NAMES.get(disease_id, disease_id),
        "disease_id": disease_id,
        "result": result.result,
        "confidence": result.confidence,
        "risk": result.risk,
        "suggestion": result.suggestion,
        "timestamp": datetime.now(timezone.utc),
        "patient_id": patient_id,
    }
    col = get_reports_collection()
    await col.insert_one(report)
    return report_id


@router.post("/{disease_id}", response_model=PredictionResponse)
async def predict_disease(
    disease_id: str,
    request: Request,
    file: Optional[UploadFile] = File(None),
    patient_id: Optional[str] = Form(None),
):
    if not registry.is_known(disease_id):
        raise HTTPException(status_code=404, detail=f"Disease not found: {disease_id}")

    predictor = registry.get_predictor(disease_id)

    # ── Image-based diseases ──────────────────────────────────────────────────
    if disease_id in IMAGE_DISEASES:
        if file is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="File upload required for image-based disease",
            )
        # Check content type or file extension
        filename = file.filename.lower() if file.filename else ""
        valid_extension = filename.endswith(('.png', '.jpg', '.jpeg'))
        valid_content_type = file.content_type in ALLOWED_IMAGE_TYPES
        
        if not (valid_content_type or valid_extension):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid image file. Accepted formats: PNG, JPG, JPEG",
            )
        file_bytes = await file.read()
        try:
            result = predictor.predict(file_bytes)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Inference error: {exc}")

    # ── Tabular diseases ──────────────────────────────────────────────────────
    else:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            params = await request.json()
        else:
            # Accept form data as fallback
            form = await request.form()
            params = dict(form)
        try:
            result = predictor.predict(params)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Inference error: {exc}")

    # Save report to MongoDB
    report_id = None
    try:
        report_id = await _save_report(disease_id, result, patient_id)
    except Exception:
        pass  # Don't fail the prediction if DB write fails

    return PredictionResponse(
        result=result.result,
        confidence=result.confidence,
        risk=result.risk,
        suggestion=result.suggestion,
        reportId=report_id,
    )
