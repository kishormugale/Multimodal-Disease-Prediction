# Implementation Tasks

## KDM Care Hospital – AI Multimodal Disease Prediction System – Backend & ML Pipeline

---

## Phase 1: Backend Infrastructure

- [x] 1. Update backend/requirements.txt
  - Add motor==3.3.2, xgboost==2.0.3, pydantic-settings==2.1.0, python-dotenv==1.0.0, joblib==1.3.2, hypothesis==6.92.1, pytest==7.4.3, pytest-asyncio==0.23.2
  - Keep existing fastapi, uvicorn, pydantic, pymongo, scikit-learn, pillow, python-multipart entries
  - _Requirements: 7.1, 8.1_

- [x] 2. Create backend/.env
  - Add MONGO_URI=mongodb://localhost:27017
  - Add DB_NAME=kdmcare
  - Add SECRET_KEY=kdmcare-dev-secret
  - _Requirements: 6.2_

- [x] 3. Create backend/config.py
  - Implement Settings class using pydantic-settings BaseSettings
  - Fields: mongo_uri, db_name, secret_key with defaults matching .env
  - Export a singleton `settings` instance
  - _Requirements: 6.2_

- [x] 4. Create backend/db.py
  - Implement async motor client using settings.mongo_uri
  - Expose get_db() returning the kdmcare database
  - Expose get_patients_collection() and get_reports_collection() helpers
  - Implement seed_patients() that inserts default 8 patients if collection is empty
  - _Requirements: 3.1, 3.2, 6.2_

- [x] 5. Create backend/routers/__init__.py and backend/ml/__init__.py
  - Both empty files to make directories Python packages
  - _Requirements: all_

- [x] 6. Create backend/models/.gitkeep
  - Empty file so the models/ directory is tracked by git
  - _Requirements: 9.1_

---

## Phase 2: ML Infrastructure

- [x] 7. Create backend/ml/mock_predictor.py
  - Implement MockPredictor class with predict(input_data) method
  - Returns randomised PredictionResponse: result Positive/Negative, confidence 60-99, risk derived from confidence+result, disease-specific suggestion strings for all 6 diseases
  - _Requirements: 9.2_

- [x] 8. Create backend/ml/preprocessors.py
  - Implement image_preprocess(file_bytes) using PIL + torchvision transforms
  - Resize to 224x224, convert to tensor [0,1], unsqueeze to (1,3,224,224)
  - Define HEART_DISEASE_FEATURE_MAP mapping frontend keys to model feature names
  - Define DIABETES_FEATURE_MAP mapping frontend keys to model feature names
  - _Requirements: 5.1, 8.4_

- [x] 9. Create backend/ml/tabular_predictor.py
  - Implement TabularPredictor(pkl_path) loading sklearn Pipeline with joblib
  - predict(params_dict) maps frontend keys using feature maps, builds DataFrame, calls pipeline.predict_proba()
  - Returns PredictionResponse with confidence as probability * 100, result, risk, suggestion
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 10. Create backend/ml/image_predictor.py
  - Implement ImagePredictor(pt_path, num_classes) loading PyTorch MobileNetV2 state dict
  - Build MobileNetV2 architecture with custom classifier head matching num_classes
  - predict(file_bytes) calls image_preprocess(), runs model inference, returns PredictionResponse
  - Set model to eval() mode, use torch.no_grad() for inference
  - _Requirements: 5.1, 5.2_

- [x] 11. Create backend/ml/model_registry.py
  - Implement ModelRegistry class with models_dir path
  - load_all() tries to load each of 6 models; on any error logs WARNING and registers MockPredictor
  - get_predictor(disease_id) returns the appropriate predictor
  - get_status() returns dict mapping each disease_id to "real" or "mock"
  - Define IMAGE_DISEASES with num_classes: brain-tumor=4, pneumonia=2, skin-cancer=2, eye-disease=4
  - Define TABULAR_DISEASES: heart-disease, diabetes
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

---

## Phase 3: FastAPI Routers

- [x] 12. Create backend/routers/auth.py
  - POST /api/auth/login accepting JSON body with email and password fields
  - Return 401 if password missing or len < 4
  - Return {"access_token": "mock_token_123", "token_type": "bearer"} on success
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 13. Create backend/routers/patients.py
  - GET /api/patients: fetch all from MongoDB patients collection, return list
  - POST /api/patients: validate body, generate PT-XXXXX id, insert to MongoDB, return 201
  - On startup seed default patients if collection empty (call seed_patients from db.py)
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 14. Create backend/routers/predict.py
  - POST /api/predict/{disease_id} handling both content types
  - For image diseases: accept UploadFile file parameter, validate image type, call image_preprocess
  - For tabular diseases: accept JSON body as dict, call tabular predictor
  - Return 404 for unknown disease_id
  - Return 422 if image disease but no file provided or invalid file type
  - After successful prediction save ReportRecord to MongoDB reports collection
  - Implement derive_risk(confidence, result) helper
  - _Requirements: 4.1-4.5, 5.1-5.5_

- [x] 15. Create backend/routers/reports.py
  - GET /api/reports: fetch all from MongoDB reports collection sorted by timestamp descending
  - Serialize _id as string, return list of report dicts
  - _Requirements: 6.1, 6.2_

- [x] 16. Create backend/routers/models_status.py
  - GET /api/models/status: return registry.get_status() dict
  - _Requirements: 9.4_

- [x] 17. Rewrite backend/main.py
  - Use FastAPI lifespan context manager for startup: load ModelRegistry, seed patients DB
  - Register all 5 routers with /api prefix
  - Add CORSMiddleware allowing all origins
  - Remove all old mock code and in-memory stores
  - _Requirements: 11.1_

---

## Phase 4: ML Training Scripts

- [x] 18. Create backend/ml/train_tabular.py
  - Auto-download UCI Heart Disease Cleveland dataset from UCI URL using urllib
  - Auto-download Pima Indians Diabetes dataset from reliable public URL
  - For each: handle missing values (replace ? with column median), binary encode target
  - Build sklearn Pipeline(StandardScaler + XGBClassifier) for each disease
  - Train/test split 80/20 stratified, print train and val accuracy
  - Save pipeline with joblib to backend/models/heart-disease.pkl and backend/models/diabetes.pkl
  - _Requirements: 7.1-7.5_

- [x] 19. Create backend/ml/train_image_models.py
  - Accept --disease CLI argument (brain-tumor, pneumonia, skin-cancer, eye-disease)
  - Load ImageFolder datasets from backend/data/{disease}/train and backend/data/{disease}/val
  - Apply augmentation transforms on train: RandomHorizontalFlip, RandomRotation(15), ColorJitter
  - Apply only Resize(224) + ToTensor on val
  - Build MobileNetV2 with frozen base + custom classifier head for num_classes
  - Train 10 epochs Adam lr=1e-3; after epoch 5 unfreeze last 3 base layers, reduce lr to 1e-4
  - Print per-epoch train loss, train acc, val acc
  - Save best val-acc checkpoint as backend/models/{disease}.pt
  - _Requirements: 8.1-8.4_

- [x] 20. Create backend/ml/download_datasets.py
  - Print formatted instructions for downloading each of 4 image datasets
  - Include direct Kaggle dataset URLs, expected directory structure under backend/data/
  - Include kaggle CLI commands: kaggle datasets download ...
  - Print note that tabular datasets are auto-downloaded by train_tabular.py
  - _Requirements: 8.5_

---

## Phase 5: Frontend Fixes

- [x] 21. Update frontend/src/components/TopNav.jsx
  - Import useNavigate from react-router-dom and logout from useAuth
  - Add logout button with logout icon before the profile divider
  - On click: call logout() then navigate('/login')
  - Style: hover:bg-red-50 hover:text-red-500 rounded-full transition-colors
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 22. Update frontend/src/services/api.js
  - Add getReports() function calling GET /api/reports
  - Update predictDisease(diseaseId, params, file) to accept optional file parameter
  - When file is provided send multipart/form-data with FormData; otherwise send JSON
  - _Requirements: 6.5, 10.2_

- [x] 23. Update frontend/src/pages/PredictionFormPage.jsx
  - Pass selectedFile as third argument to api.predictDisease(diseaseId, params, selectedFile)
  - _Requirements: 10.1_

- [x] 24. Update frontend/src/pages/ReportsPage.jsx
  - Remove static initialReports import from mockData
  - Add useState for reports, loading, error
  - Add useEffect calling api.getReports() on mount
  - Show spinner while loading, error message on failure
  - Use reports state instead of initialReports throughout JSX
  - _Requirements: 6.3, 6.4, 10.3, 10.4, 10.5_

---

## Phase 6: Tests

- [ ] 25. Create backend/tests/__init__.py and backend/tests/test_properties.py
  - Import Hypothesis given, settings, strategies
  - Property 2: test derive_risk() with floats 0-100 and sampled result strings
  - Property 5: test image_preprocess() output shape (1,3,224,224) and value range [0,1] with random image sizes
  - Property 7: test unknown disease_id returns 404 using FastAPI TestClient
  - Property 8: test password length 0-3 always returns 401
  - Property 10: test GET /api/patients always returns objects with required fields
  - _Requirements: 4.4, 5.1, 4.3, 1.2, 3.1_
