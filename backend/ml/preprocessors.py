import io
import torch
from PIL import Image
from torchvision import transforms

# ── Image preprocessing ──────────────────────────────────────────────────────

_image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),  # converts HWC uint8 → CHW float32 in [0, 1]
])


def image_preprocess(file_bytes: bytes) -> torch.Tensor:
    """
    Decode raw image bytes and return a (1, 3, 224, 224) float tensor in [0, 1].
    Raises ValueError for non-image bytes.
    """
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError(f"Cannot decode image: {exc}") from exc
    tensor = _image_transform(img)          # (3, 224, 224)
    return tensor.unsqueeze(0)              # (1, 3, 224, 224)


# ── Tabular feature maps ──────────────────────────────────────────────────────
# Maps frontend form field keys → model training column names

HEART_DISEASE_FEATURE_MAP: dict[str, str] = {
    "age":         "age",
    "sex":         "sex",
    "chest_pain":  "cp",
    "bp":          "trestbps",
    "cholesterol": "chol",
    "blood_sugar": "fbs",
    "restecg":     "restecg",
    "heart_rate":  "thalach",
    "exang":       "exang",
    "oldpeak":     "oldpeak",
    "slope":       "slope",
    "ca":          "ca",
    "thal":        "thal",
}

DIABETES_FEATURE_MAP: dict[str, str] = {
    "pregnancies":    "Pregnancies",
    "glucose":        "Glucose",
    "bp":             "BloodPressure",
    "skin_thickness": "SkinThickness",
    "insulin":        "Insulin",
    "bmi":            "BMI",
    "dpf":            "DiabetesPedigreeFunction",
    "age":            "Age",
}

FEATURE_MAPS: dict[str, dict[str, str]] = {
    "heart-disease": HEART_DISEASE_FEATURE_MAP,
    "diabetes":      DIABETES_FEATURE_MAP,
}


def map_tabular_features(disease_id: str, raw: dict) -> dict:
    """
    Translate frontend key names to model column names.
    Missing keys are filled with 0 so the pipeline never crashes.
    """
    feature_map = FEATURE_MAPS.get(disease_id, {})
    return {model_col: raw.get(frontend_key, 0) for frontend_key, model_col in feature_map.items()}
