# Design Document

## KDM Care Hospital – AI Multimodal Disease Prediction System – Backend & ML Pipeline

---

## Overview

This document describes the technical design for replacing the mock FastAPI backend with a production-quality server that serves real trained ML models, persists data in MongoDB, and integrates cleanly with the existing React frontend. The system supports six diseases: four image-based (brain tumor, pneumonia, skin cancer, eye disease) and two tabular (heart disease, diabetes).

The backend is structured as a modular FastAPI application with async MongoDB access via `motor`, a model registry that loads trained artefacts at startup with graceful fallback, and two ML training pipelines — one for scikit-learn/XGBoost tabular models and one for PyTorch MobileNetV2 image models. Four frontend fixes are also included: adding a logout button to TopNav, wiring ReportsPage to the live API, adding `getReports()` to `api.js`, and fixing the predict endpoint to accept tabular JSON parameters.

**Key technology decisions:**
- FastAPI 0.104.1 + Uvicorn 0.24.0 (already installed)
- MongoDB 8.2.5 local instance via `motor` async driver (`mongodb://localhost:27017`, db: `kdmcare`)
- Tabular models: scikit-learn Pipeline + XGBoost, saved as `.pkl`
- Image models: PyTorch 2.10.0 + TorchVision 0.25.0, MobileNetV2 transfer learning, saved as `.pt`
- Image input: 224×224, normalised to [0, 1]
- Frontend: React + Vite + Tailwind (existing, four targeted fixes)

---

## Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React + Vite :5173)"]
        A[PredictionFormPage] -->|POST /api/predict/:id| P
        B[ReportsPage] -->|GET /api/reports| R
        C[PatientsPage] -->|GET/POST /api/patients| PT
        D[TopNav] -->|logout()| AC[AuthContext]
    end

    subgraph Backend ["Backend (FastAPI + Uvicorn :8000)"]
        P[/router/predict.py/] --> ML[ModelRegistry]
        P --> DB[(MongoDB: kdmcare)]
        R[/router/reports.py/] --> DB
        PT[/router/patients.py/] --> DB
        AU[/router/auth.py/] --> DB
        MS[/router/models.py/] --> ML
        ML --> TAB[TabularPredictor .pkl]
        ML --> IMG[ImagePredictor .pt]
        ML --> MOCK[MockPredictor fallback]
    end

    subgraph MLPipeline ["ML Pipeline (offline training)"]
        TT[train_tabular.py] -->|saves| TAB
        TI[train_image_models.py] -->|saves| IMG
        DD[download_datasets.py] -->|instructions| DEV[Developer]
    end

    Vite[Vite proxy /api/* → :8000] --> Backend
    Frontend --> Vite
```

The Vite dev server already proxies `/api/*` to `http://localhost:8000` (confirmed in `vite.config.js`). The backend exposes five router groups under `/api`. The ML pipeline is a set of offline training scripts; trained artefacts are written to `backend/models/` and loaded by the running server.

---

## Components and Interfaces

### Backend Folder Structure

```
backend/
├── main.py                    # App factory, CORS, router registration, lifespan
├── db.py                      # Motor client, collection accessors
├── config.py                  # Pydantic Settings (MONGO_URI, etc.)
├── .env                       # Environment variables (gitignored)
├── requirements.txt           # Updated with motor, xgboost, torch, etc.
├── models/                    # Trained model artefacts (gitignored)
│   ├── heart-disease.pkl
│   ├── diabetes.pkl
│   ├── brain-tumor.pt
│   ├── pneumonia.pt
│   ├── skin-cancer.pt
│   └── eye-disease.pt
├── routers/
│   ├── __init__.py
│   ├── auth.py                # POST /api/auth/login
│   ├── patients.py            # GET/POST /api/patients
│   ├── predict.py             # POST /api/predict/{disease_id}
│   ├── reports.py             # GET /api/reports
│   └── models_status.py       # GET /api/models/status
└── ml/
    ├── __init__.py
    ├── model_registry.py      # ModelRegistry singleton, load/fallback logic
    ├── tabular_predictor.py   # TabularPredictor wrapping sklearn Pipeline
    ├── image_predictor.py     # ImagePredictor wrapping PyTorch model
    ├── mock_predictor.py      # MockPredictor for fallback
    ├── preprocessors.py       # image_preprocess(), tabular_preprocess()
    ├── train_tabular.py       # Training script for heart-disease + diabetes
    ├── train_image_models.py  # Training script for 4 image models
    └── download_datasets.py   # Dataset download instructions
```

### Router Interfaces

**`POST /api/auth/login`**
- Request body: `{ "email": str, "password": str }` (JSON)
- Response 200: `{ "access_token": str, "token_type": "bearer" }`
- Response 401: `{ "detail": "Invalid credentials" }` when password < 4 chars or missing

**`GET /api/patients`**
- Response 200: `[{ "id": str, "name": str, "age": int, "gender": str, "status": str, "lastVisit": str }]`

**`POST /api/patients`**
- Request body: `{ "name": str, "age": int, "gender": str, "status": str }`
- Response 201: created patient object with `id` prefixed `PT-`
- Response 422: Pydantic validation error if required field missing

**`POST /api/predict/{disease_id}`**
- Tabular diseases (`heart-disease`, `diabetes`): `Content-Type: application/json`, body is a flat dict of feature key-value pairs
- Image diseases (`brain-tumor`, `pneumonia`, `skin-cancer`, `eye-disease`): `Content-Type: multipart/form-data`, field `file` is the image
- Response 200: `PredictionResponse`
- Response 404: unknown `disease_id`
- Response 422: invalid file type or missing file for image disease

**`GET /api/reports`**
- Response 200: `[ReportRecord]` ordered by `timestamp` descending

**`GET /api/models/status`**
- Response 200: `{ "brain-tumor": "real"|"mock", "pneumonia": "real"|"mock", ... }` for all 6 disease IDs

### Pydantic Schemas

```python
# PredictionResponse
class PredictionResponse(BaseModel):
    result: Literal["Positive", "Negative"]
    confidence: float          # 0.0 – 100.0
    risk: Literal["High", "Medium", "Low"]
    suggestion: str

# ReportRecord (stored in MongoDB and returned by GET /api/reports)
class ReportRecord(BaseModel):
    id: str                    # UUID4 string
    disease: str               # human-readable disease name
    disease_id: str            # kebab-case Disease_ID
    result: Literal["Positive", "Negative"]
    confidence: float
    risk: Literal["High", "Medium", "Low"]
    suggestion: str
    timestamp: datetime        # UTC
    patient_id: Optional[str]  # PT-XXXXX if provided in request

# PatientRecord
class PatientRecord(BaseModel):
    id: str                    # PT-XXXXX
    name: str
    age: int
    gender: str
    status: str
    lastVisit: str
```

### ModelRegistry

`backend/ml/model_registry.py` implements a singleton `ModelRegistry` class that is instantiated once during the FastAPI lifespan startup event.

```python
class ModelRegistry:
    def __init__(self, models_dir: Path): ...
    def load_all(self) -> None:
        # Attempts to load each of the 6 models.
        # On FileNotFoundError or any load error: logs WARNING, registers MockPredictor.
    def get_predictor(self, disease_id: str) -> BasePredictor: ...
    def get_status(self) -> dict[str, Literal["real", "mock"]]: ...
```

Each predictor implements a common interface:

```python
class BasePredictor(ABC):
    @abstractmethod
    def predict(self, input_data) -> PredictionResponse: ...
```

Concrete implementations:
- `TabularPredictor(pkl_path)` — loads sklearn Pipeline, calls `pipeline.predict_proba()`
- `ImagePredictor(pt_path, num_classes)` — loads PyTorch `.pt` state dict into MobileNetV2, calls `model(tensor)`
- `MockPredictor(disease_id)` — returns randomised but valid `PredictionResponse`

---

## Data Models

### MongoDB Collections

**Database:** `kdmcare`  
**Connection:** `MONGO_URI` env var, default `mongodb://localhost:27017`

#### `kdmcare.patients`

```json
{
  "_id": ObjectId,
  "id": "PT-82741",
  "name": "Eleanor Shellstrop",
  "age": 36,
  "gender": "Female",
  "status": "Stable",
  "lastVisit": "2 hours ago",
  "createdAt": ISODate("2024-10-24T14:22:00Z")
}
```

Index: `{ "id": 1 }` unique.

#### `kdmcare.reports`

```json
{
  "_id": ObjectId,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "disease": "Heart Disease",
  "disease_id": "heart-disease",
  "result": "Positive",
  "confidence": 92.4,
  "risk": "High",
  "suggestion": "Immediate ECG and cardiology referral recommended.",
  "timestamp": ISODate("2024-10-24T14:22:00Z"),
  "patient_id": "PT-82741"
}
```

Index: `{ "timestamp": -1 }` for efficient descending sort on GET /api/reports.

### Environment Configuration

**`.env` file** (placed in `backend/`, loaded by `pydantic-settings`):

```
MONGO_URI=mongodb://localhost:27017
DB_NAME=kdmcare
SECRET_KEY=change-me-in-production
```

**`backend/config.py`:**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "kdmcare"
    secret_key: str = "dev-secret"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## ML Pipeline Design

### Tabular Training (`backend/ml/train_tabular.py`)

**Heart Disease** — UCI Cleveland Heart Disease dataset (303 rows, 14 columns).  
Download: `https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data`

Features (13): `age`, `sex`, `cp`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal`  
Target: binary (0 = no disease, 1–4 = disease present → mapped to 1)

**Diabetes** — Pima Indians Diabetes dataset (768 rows, 9 columns).  
Download: available via `sklearn.datasets` or direct CSV from UCI/Kaggle.

Features (8): `Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age`  
Target: binary `Outcome` (0/1)

**Pipeline architecture (both models):**

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42
    ))
])
```

The entire `Pipeline` object (scaler + classifier) is saved with `joblib.dump(pipeline, path)`. At inference time, raw feature values are passed directly — no separate preprocessing step needed.

**Training flow:**
1. Download/read dataset
2. Handle missing values (Cleveland uses `?` for missing; replace with column median)
3. Train/test split 80/20, stratified
4. Fit pipeline on train set
5. Print train accuracy and validation accuracy to stdout
6. Save to `backend/models/{disease_id}.pkl`

### Image Training (`backend/ml/train_image_models.py`)

**Datasets and expected directory structure:**

```
backend/data/
├── brain-tumor/
│   ├── train/
│   │   ├── glioma/
│   │   ├── meningioma/
│   │   ├── notumor/
│   │   └── pituitary/
│   └── val/
│       └── (same structure)
├── pneumonia/
│   ├── train/
│   │   ├── NORMAL/
│   │   └── PNEUMONIA/
│   └── val/
├── skin-cancer/
│   ├── train/
│   │   ├── benign/
│   │   └── malignant/
│   └── val/
└── eye-disease/
    ├── train/
    │   ├── normal/
    │   ├── diabetic_retinopathy/
    │   ├── glaucoma/
    │   └── cataract/
    └── val/
```

**Dataset sources** (documented in `download_datasets.py`):
- Brain Tumor: [Kaggle Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset) — 4 classes
- Pneumonia: [Kaggle Chest X-Ray Images](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia) — 2 classes
- Skin Cancer: [HAM10000](https://www.kaggle.com/datasets/kmader/skin-lesion-analysis-toward-melanoma-detection) — simplified to benign/malignant binary
- Eye Disease: [ODIR-5K](https://www.kaggle.com/datasets/andrewmvd/ocular-disease-recognition-odir5k) — 4 classes

**CNN Architecture (MobileNetV2 transfer learning):**

```python
import torchvision.models as models
import torch.nn as nn

base = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

# Freeze base layers
for param in base.parameters():
    param.requires_grad = False

# Replace classifier head
num_classes = {
    "brain-tumor": 4,
    "pneumonia": 2,
    "skin-cancer": 2,
    "eye-disease": 4,
}[disease_id]

base.classifier = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(base.last_channel, 128),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(128, num_classes)
)
```

**Training flow:**
1. Parse `--disease` CLI argument
2. Build `ImageFolder` datasets with `torchvision.transforms`
3. Apply augmentation on train set: random horizontal flip, random rotation ±15°, colour jitter
4. Apply only resize + normalise on val set
5. Train for 10 epochs with Adam optimizer, lr=1e-3, CrossEntropyLoss
6. After epoch 5, unfreeze last 3 layers of base for fine-tuning, reduce lr to 1e-4
7. Print per-epoch train loss, train accuracy, val accuracy
8. Save best val-accuracy checkpoint as `backend/models/{disease_id}.pt` using `torch.save(model.state_dict(), path)`

### Image Preprocessing (`backend/ml/preprocessors.py`)

```python
from PIL import Image
import torch
from torchvision import transforms

_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),           # converts to [0,1] float tensor
    # No ImageNet normalisation — model trained on [0,1] range
])

def image_preprocess(file_bytes: bytes) -> torch.Tensor:
    """Returns tensor of shape (1, 3, 224, 224) with values in [0, 1]."""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    tensor = _transform(img)         # shape: (3, 224, 224)
    return tensor.unsqueeze(0)       # shape: (1, 3, 224, 224)
```

### Tabular Preprocessing

No separate preprocessing module is needed at inference time — the sklearn `Pipeline` object includes the `StandardScaler` as its first step. The router simply constructs a `pandas.DataFrame` from the incoming JSON dict and passes it to `pipeline.predict_proba()`.

Feature key mapping (frontend key → model feature name) is handled in `tabular_predictor.py`:

```python
HEART_DISEASE_FEATURE_MAP = {
    "age": "age", "sex": "sex", "chest_pain": "cp",
    "bp": "trestbps", "cholesterol": "chol", "blood_sugar": "fbs",
    "restecg": "restecg", "heart_rate": "thalach", "exang": "exang",
    "oldpeak": "oldpeak", "slope": "slope", "ca": "ca", "thal": "thal"
}

DIABETES_FEATURE_MAP = {
    "pregnancies": "Pregnancies", "glucose": "Glucose",
    "bp": "BloodPressure", "skin_thickness": "SkinThickness",
    "insulin": "Insulin", "bmi": "BMI",
    "dpf": "DiabetesPedigreeFunction", "age": "Age"
}
```

### Risk Derivation Logic

Applied in `predict.py` after obtaining `proba` from any model:

```python
def derive_risk(confidence: float, result: str) -> str:
    if result == "Negative":
        return "Low"
    if confidence >= 85.0:
        return "High"
    return "Medium"
```

---

## Frontend Changes

### 1. TopNav – Logout Button (`frontend/src/components/TopNav.jsx`)

Add a logout button between the existing icon buttons and the profile section. The button calls `logout()` from `useAuth()` and navigates to `/login` via `useNavigate()`.

```jsx
import { useNavigate } from 'react-router-dom'
// ...
const { doctor, logout } = useAuth()
const navigate = useNavigate()

const handleLogout = () => {
  logout()
  navigate('/login')
}

// Insert before the divider <div className="h-8 w-[1px]...">:
<button
  onClick={handleLogout}
  className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
  title="Logout"
>
  <span className="material-symbols-outlined">logout</span>
</button>
```

### 2. `api.js` – Add `getReports()` (`frontend/src/services/api.js`)

```js
async getReports() {
  const res = await fetch(`${API_URL}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
},
```

### 3. ReportsPage – Fetch from API (`frontend/src/pages/ReportsPage.jsx`)

Replace the static `initialReports` import with a `useEffect` that calls `api.getReports()` on mount. Add loading and error states.

```jsx
import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getReports()
      .then(data => setReports(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="spinner"></div></div>
  if (error) return <div className="text-center py-20 text-error">{error}</div>
  // ... rest of JSX using `reports` instead of `initialReports`
}
```

### 4. `PredictionFormPage` – Image Upload Fix

The current `api.predictDisease()` always sends JSON. For image diseases, it must send `multipart/form-data`. Update `api.js`:

```js
async predictDisease(diseaseId, params, file = null) {
  if (file) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_URL}/predict/${diseaseId}`, {
      method: 'POST',
      body: formData   // browser sets Content-Type: multipart/form-data automatically
    })
    if (!res.ok) throw new Error('Prediction failed')
    return res.json()
  }
  const res = await fetch(`${API_URL}/predict/${diseaseId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {})
  })
  if (!res.ok) throw new Error('Prediction failed')
  return res.json()
},
```

In `PredictionFormPage.jsx`, pass `selectedFile` as the third argument:

```jsx
const prediction = await api.predictDisease(diseaseId, params, selectedFile)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: PredictionResponse schema invariant

*For any* valid input (tabular dict or image bytes) submitted to `/api/predict/{disease_id}` for any known disease ID, the response SHALL always contain `result` ∈ `{"Positive", "Negative"}`, `confidence` ∈ [0.0, 100.0], `risk` ∈ `{"High", "Medium", "Low"}`, and `suggestion` as a non-empty string.

**Validates: Requirements 4.2, 5.2**

### Property 2: Risk derivation correctness

*For any* `(confidence, result)` pair produced by any predictor, the derived `risk` SHALL satisfy: `risk == "Low"` when `result == "Negative"`, `risk == "High"` when `result == "Positive"` and `confidence >= 85.0`, and `risk == "Medium"` when `result == "Positive"` and `confidence < 85.0`.

**Validates: Requirements 4.4**

### Property 3: Prediction–report round trip

*For any* successful prediction call to `/api/predict/{disease_id}`, a subsequent call to `GET /api/reports` SHALL include a report record whose `disease_id`, `result`, `confidence`, `risk`, and `suggestion` fields match the prediction response.

**Validates: Requirements 4.5, 5.5, 6.1**

### Property 4: Reports ordering invariant

*For any* set of report records in the Reports_Store, `GET /api/reports` SHALL return them in strictly non-increasing order of `timestamp` (newest first).

**Validates: Requirements 6.1**

### Property 5: Image preprocessor output invariant

*For any* input image of any size, format (PNG/JPG), or colour space, the `image_preprocess()` function SHALL return a tensor of shape `(1, 3, 224, 224)` with all values in the closed interval [0.0, 1.0].

**Validates: Requirements 5.1, 8.4**

### Property 6: Patient creation round trip

*For any* valid patient payload `{name, age, gender, status}`, a `POST /api/patients` followed by `GET /api/patients` SHALL include a patient record whose `name`, `age`, `gender`, and `status` match the submitted payload, and whose `id` starts with `"PT-"`.

**Validates: Requirements 3.2**

### Property 7: Invalid disease ID always returns 404

*For any* string that is not one of the six known Disease_IDs, a `POST /api/predict/{string}` SHALL return HTTP 404.

**Validates: Requirements 4.3**

### Property 8: Short password always returns 401

*For any* password string of length 0–3 (including empty string and whitespace-only strings), a `POST /api/auth/login` with that password SHALL return HTTP 401.

**Validates: Requirements 1.2**

### Property 9: Models status endpoint completeness

*For any* server state (any combination of loaded/missing model files), `GET /api/models/status` SHALL return a JSON object containing exactly the six Disease_IDs as keys, each mapped to either `"real"` or `"mock"`.

**Validates: Requirements 9.4**

### Property 10: Patient response schema invariant

*For any* state of the patients collection, every object in the array returned by `GET /api/patients` SHALL contain the fields `id`, `name`, `age`, `gender`, `status`, and `lastVisit`.

**Validates: Requirements 3.1**

---

## Error Handling

| Scenario | HTTP Status | Response |
|---|---|---|
| Unknown `disease_id` | 404 | `{"detail": "Disease not found: {id}"}` |
| Image disease, no file uploaded | 422 | `{"detail": "File upload required for image-based disease"}` |
| Uploaded file is not a valid image | 422 | `{"detail": "Invalid image file. Accepted formats: PNG, JPG, JPEG"}` |
| Tabular disease, missing required field | 422 | Pydantic validation error detail |
| Password < 4 chars at login | 401 | `{"detail": "Invalid credentials"}` |
| MongoDB connection failure at startup | Server logs ERROR, continues with in-memory fallback | — |
| Model file missing at startup | Server logs WARNING, registers MockPredictor | — |
| Model inference exception | 500 | `{"detail": "Inference error: {message}"}` |

**MongoDB connection strategy:** The `motor` client is created once in `db.py` using the `MONGO_URI` env var. If the initial ping fails, the server logs an error but does not crash — endpoints that require DB access will return 503 with a clear message. This allows the server to start during development even if MongoDB is temporarily unavailable.

**Model loading strategy:** The `ModelRegistry.load_all()` method wraps each model load in a `try/except`. On any failure (file not found, corrupt file, version mismatch), it logs a `WARNING` and registers a `MockPredictor` for that disease. The `/api/models/status` endpoint makes the fallback state visible.

---

## Testing Strategy

### Unit Tests

Located in `backend/tests/`. Run with `pytest`.

- `test_preprocessors.py` — tests for `image_preprocess()` and tabular feature mapping
- `test_risk_derivation.py` — tests for `derive_risk()` logic
- `test_model_registry.py` — tests for fallback behaviour when model files are missing
- `test_routers.py` — FastAPI `TestClient` tests for each endpoint (happy path + error cases)

### Property-Based Tests

Uses **Hypothesis** (Python PBT library). Each property test runs a minimum of 100 iterations.

Located in `backend/tests/test_properties.py`.

```python
from hypothesis import given, settings
from hypothesis import strategies as st

# Feature: kdm-care-backend-ml, Property 2: Risk derivation correctness
@given(
    confidence=st.floats(min_value=0.0, max_value=100.0),
    result=st.sampled_from(["Positive", "Negative"])
)
@settings(max_examples=200)
def test_risk_derivation_correctness(confidence, result):
    risk = derive_risk(confidence, result)
    if result == "Negative":
        assert risk == "Low"
    elif confidence >= 85.0:
        assert risk == "High"
    else:
        assert risk == "Medium"

# Feature: kdm-care-backend-ml, Property 5: Image preprocessor output invariant
@given(
    width=st.integers(min_value=1, max_value=2048),
    height=st.integers(min_value=1, max_value=2048),
)
@settings(max_examples=100)
def test_image_preprocessor_invariant(width, height):
    img = Image.new("RGB", (width, height))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    tensor = image_preprocess(buf.getvalue())
    assert tensor.shape == (1, 3, 224, 224)
    assert tensor.min() >= 0.0
    assert tensor.max() <= 1.0
```

Property tests for endpoint behaviour (Properties 1, 3, 4, 6, 7, 8, 9, 10) use FastAPI's `TestClient` with an in-memory MongoDB mock (`mongomock-motor`) to avoid requiring a live database during CI.

### Integration Tests

Located in `backend/tests/test_integration.py`. Require a running MongoDB instance.

- Verify reports persist across server restarts (Requirement 6.2)
- Verify end-to-end prediction → report flow (Requirements 10.1, 6.4)
- Verify CORS headers are present on responses (Requirement 11.1)

### Frontend Tests

Located in `frontend/src/__tests__/`. Run with `vitest --run`.

- `TopNav.test.jsx` — verify logout button renders and calls `logout()` on click
- `ReportsPage.test.jsx` — verify `api.getReports()` called on mount, loading spinner shown, error state rendered
- `api.test.js` — verify `getReports()` calls `GET /api/reports`

### Updated `backend/requirements.txt`

```
fastapi==0.104.1
uvicorn==0.24.0.post1
pydantic==2.5.2
pydantic-settings==2.1.0
python-multipart==0.0.6
motor==3.3.2
pymongo==4.16.0
xgboost==2.0.3
scikit-learn==1.7.2
pandas==2.1.4
numpy==1.26.2
pillow==10.2.0
torch==2.10.0
torchvision==0.25.0
joblib==1.3.2
python-dotenv==1.0.0
hypothesis==6.92.1
pytest==7.4.3
pytest-asyncio==0.23.2
mongomock-motor==0.0.21
```
