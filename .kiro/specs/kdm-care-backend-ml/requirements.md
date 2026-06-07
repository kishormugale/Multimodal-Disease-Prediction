# Requirements Document

## Introduction

KDM Care Hospital – AI Multimodal Disease Prediction System requires a complete backend and ML pipeline to replace the current mock implementation. The system must expose a production-quality FastAPI backend that serves real trained ML models for six diseases (four image-based, two tabular), persists prediction reports across sessions, and integrates cleanly with the existing React frontend. Additionally, four incomplete frontend tasks must be resolved: wiring predictions to the reports store, fixing the predict endpoint to accept tabular parameters, adding a logout button to TopNav, and persisting reports across browser sessions.

---

## Glossary

- **API_Server**: The FastAPI application running in `backend/main.py` that handles all HTTP requests from the frontend.
- **ML_Pipeline**: The collection of Python training scripts and saved model artefacts used for real disease inference.
- **Image_Preprocessor**: The component inside the API_Server that resizes and normalises uploaded images before passing them to an image model.
- **Tabular_Preprocessor**: The component inside the API_Server that validates and scales numeric/categorical inputs before passing them to a tabular model.
- **Model_Registry**: The directory (`backend/models/`) where trained model files (`.h5`, `.keras`, `.pkl`) are stored and loaded at startup.
- **Reports_Store**: The MongoDB collection (`kdmcare.reports`) that persists prediction reports across server restarts.
- **Patients_Store**: The MongoDB collection (`kdmcare.patients`) that persists patient records across server restarts.
- **MongoDB**: The NoSQL document database used for all persistence. Accessed via the `motor` async driver. Can be a local instance or MongoDB Atlas free tier.
- **Frontend**: The React + Vite + Tailwind application in `frontend/`.
- **TopNav**: The sticky header component at `frontend/src/components/TopNav.jsx`.
- **ReportsPage**: The page at `frontend/src/pages/ReportsPage.jsx` that displays the prediction history table.
- **PredictionFormPage**: The page at `frontend/src/pages/PredictionFormPage.jsx` that collects inputs and calls the predict endpoint.
- **AuthContext**: The React context at `frontend/src/context/AuthContext.jsx` that manages login/logout state.
- **Disease_ID**: A kebab-case string identifier for a disease, one of: `brain-tumor`, `pneumonia`, `skin-cancer`, `eye-disease`, `heart-disease`, `diabetes`.
- **Confidence_Score**: A float between 0.0 and 100.0 representing the model's certainty in its prediction.
- **Risk_Level**: One of `High`, `Medium`, or `Low`, derived from the prediction result and confidence score.

---

## Requirements

### Requirement 1: Authentication Endpoint

**User Story:** As a doctor, I want to log in with my credentials, so that I can access the protected hospital dashboard.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/auth/login` with a JSON body containing `email` and `password` fields, THE API_Server SHALL return a JSON object with `access_token` (string) and `token_type` fields.
2. IF the `password` field is absent or fewer than 4 characters, THEN THE API_Server SHALL return HTTP 401 with a JSON detail message.
3. THE API_Server SHALL accept `Content-Type: application/json` for the login endpoint (not query parameters).

---

### Requirement 2: Logout Button in TopNav

**User Story:** As a doctor, I want a logout button in the top navigation bar, so that I can end my session securely.

#### Acceptance Criteria

1. THE TopNav SHALL render a logout button that is visible on all screen sizes.
2. WHEN the logout button is clicked, THE AuthContext SHALL call the `logout()` function, clear `kdm_auth` from localStorage, and redirect the user to `/login`.
3. THE TopNav SHALL display the logout button adjacent to the doctor's profile avatar.

---

### Requirement 3: Patient Management Endpoints

**User Story:** As a doctor, I want to retrieve and create patient records via the API, so that the frontend patient list reflects real data.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/patients`, THE API_Server SHALL return a JSON array of all patient objects, each containing `id`, `name`, `age`, `gender`, `status`, and `lastVisit` fields.
2. WHEN a POST request is sent to `/api/patients` with a valid JSON body containing `name`, `age`, `gender`, and `status`, THE API_Server SHALL create a new patient with a unique `id` prefixed `PT-`, persist it to the MongoDB `kdmcare.patients` collection, and return the created patient object with HTTP 201.
3. IF the POST body is missing any required field, THEN THE API_Server SHALL return HTTP 422 with a validation error detail.

---

### Requirement 4: Disease Prediction Endpoint – Tabular Input

**User Story:** As a doctor, I want to submit patient vitals for heart disease or diabetes prediction, so that the AI model returns a real risk assessment.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/predict/{disease_id}` with `Content-Type: application/json` and a body containing the disease-specific numeric and categorical parameters, THE API_Server SHALL pass those parameters to the corresponding trained tabular model and return a `PredictionResponse`.
2. THE `PredictionResponse` SHALL contain `result` (string: `"Positive"` or `"Negative"`), `confidence` (float 0–100), `risk` (string: `"High"`, `"Medium"`, or `"Low"`), and `suggestion` (string).
3. IF the `disease_id` path parameter does not match a known Disease_ID, THEN THE API_Server SHALL return HTTP 404.
4. WHEN the tabular model produces a probability output, THE API_Server SHALL derive `risk` as `"High"` when confidence ≥ 85 and result is `"Positive"`, `"Medium"` when confidence is 60–84 and result is `"Positive"`, and `"Low"` when result is `"Negative"`.
5. WHEN a prediction is completed successfully, THE API_Server SHALL append a report record to the Reports_Store containing `id`, `disease`, `result`, `confidence`, `risk`, `suggestion`, `timestamp`, and `patientId` (if provided).

---

### Requirement 5: Disease Prediction Endpoint – Image Input

**User Story:** As a doctor, I want to upload a medical scan image for brain tumor, pneumonia, skin cancer, or eye disease prediction, so that the AI model analyses the image and returns a diagnosis.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/predict/{disease_id}` with `Content-Type: multipart/form-data` and a file field named `file`, THE Image_Preprocessor SHALL decode the uploaded image, resize it to the model's required input dimensions, and normalise pixel values to the range [0, 1].
2. WHEN the preprocessed image tensor is passed to the corresponding trained CNN model, THE API_Server SHALL return a `PredictionResponse` with real model output.
3. IF the uploaded file is not a valid image (PNG, JPG, or JPEG), THEN THE API_Server SHALL return HTTP 422 with a descriptive error message.
4. IF no file is provided for an image-type disease, THEN THE API_Server SHALL return HTTP 422 indicating that a file upload is required.
5. WHEN a prediction is completed successfully, THE API_Server SHALL append a report record to the Reports_Store (same schema as Requirement 4, criterion 5).

---

### Requirement 6: Reports Endpoint and Persistence

**User Story:** As a doctor, I want to view all past prediction reports in the Reports page, so that I have a persistent audit trail of AI diagnoses.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/reports`, THE API_Server SHALL return a JSON array of all report objects stored in the Reports_Store, ordered by timestamp descending.
2. THE Reports_Store SHALL persist report records to a MongoDB collection (`kdmcare.reports`) so that reports survive server restarts. The backend SHALL connect to MongoDB using a `MONGO_URI` environment variable (defaults to `mongodb://localhost:27017`).
3. THE ReportsPage SHALL fetch reports from `/api/reports` on mount instead of using the static `initialReports` mock array.
4. WHEN a new prediction is saved to the Reports_Store, THE ReportsPage SHALL reflect the new report on the next page load or refresh without requiring a code change.
5. THE `api.js` service SHALL expose a `getReports()` function that calls `GET /api/reports` and returns the parsed JSON array.

---

### Requirement 7: ML Model Training Pipeline – Tabular Models

**User Story:** As a data scientist, I want reproducible training scripts for heart disease and diabetes models, so that real trained models can be generated and loaded by the API.

#### Acceptance Criteria

1. THE ML_Pipeline SHALL include a script `backend/ml/train_tabular.py` that downloads or reads the UCI Heart Disease (Cleveland) dataset and the Pima Indians Diabetes dataset, trains a scikit-learn or XGBoost classifier for each, and saves the trained models as `.pkl` files in the Model_Registry.
2. WHEN the training script is executed, THE ML_Pipeline SHALL print training accuracy and validation accuracy for each model to stdout.
3. THE saved `.pkl` files SHALL include both the fitted scaler/preprocessor and the classifier in a single pipeline object so that raw input values can be passed directly at inference time.
4. THE heart disease model SHALL be trained on features: `age`, `sex`, `cp` (chest pain type), `trestbps` (resting BP), `chol` (cholesterol), `fbs` (fasting blood sugar), `restecg`, `thalach` (max heart rate), `exang`, `oldpeak`, `slope`, `ca`, `thal`.
5. THE diabetes model SHALL be trained on features: `Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age`.

---

### Requirement 8: ML Model Training Pipeline – Image Models

**User Story:** As a data scientist, I want reproducible training scripts for the four image-based disease models, so that real CNN models can be generated and loaded by the API.

#### Acceptance Criteria

1. THE ML_Pipeline SHALL include a script `backend/ml/train_image_models.py` that defines, trains, and saves a CNN model for each of the four image diseases: brain tumor, pneumonia, skin cancer, and eye disease.
2. WHEN the training script is executed with a `--disease` argument (e.g., `--disease brain-tumor`), THE ML_Pipeline SHALL train only the specified model and save it as a `.keras` or `.h5` file in the Model_Registry.
3. THE CNN architecture for each model SHALL use transfer learning from a pretrained base (MobileNetV2 or EfficientNetB0) with a custom classification head appropriate for the number of output classes.
4. THE Image_Preprocessor SHALL resize input images to 224×224 pixels and normalise to [0, 1] before passing to any CNN model.
5. THE ML_Pipeline SHALL include a `backend/ml/download_datasets.py` script that prints instructions and direct download links for each dataset (Kaggle Brain Tumor MRI, Kaggle Chest X-Ray Pneumonia, HAM10000, ODIR-5K) since automated Kaggle downloads require API credentials.

---

### Requirement 9: Model Loading and Fallback

**User Story:** As a developer, I want the API server to load trained models at startup and fall back gracefully when a model file is missing, so that the server remains operational during development.

#### Acceptance Criteria

1. WHEN the API_Server starts, THE Model_Registry SHALL attempt to load all six model files from `backend/models/`.
2. IF a model file is not found at startup, THEN THE API_Server SHALL log a warning and register a fallback mock predictor for that disease so that the endpoint still returns a valid `PredictionResponse`.
3. WHEN a model file is present and loaded, THE API_Server SHALL use the real model for inference and SHALL NOT use the mock predictor.
4. THE API_Server SHALL expose a `GET /api/models/status` endpoint that returns a JSON object listing each Disease_ID and whether its model is loaded (`"real"`) or using the fallback (`"mock"`).

---

### Requirement 10: Frontend – Wire Predictions to Reports

**User Story:** As a doctor, I want every prediction I run to automatically appear in the Reports page, so that I have a complete history without manual entry.

#### Acceptance Criteria

1. WHEN the `PredictionFormPage` receives a successful prediction response from the API, THE Frontend SHALL call `POST /api/predict/{disease_id}` (which already saves to Reports_Store server-side) and the result SHALL be visible in the ReportsPage on next navigation.
2. THE `api.js` service SHALL include a `getReports()` function that calls `GET /api/reports`.
3. THE ReportsPage SHALL call `api.getReports()` on component mount and render the returned reports instead of the static mock array.
4. WHILE the ReportsPage is loading reports from the API, THE ReportsPage SHALL display a loading spinner.
5. IF the API call to `/api/reports` fails, THEN THE ReportsPage SHALL display an error message instead of crashing.

---

### Requirement 11: CORS and Proxy Configuration

**User Story:** As a developer, I want the frontend dev server to proxy API calls to the backend, so that there are no CORS issues during development.

#### Acceptance Criteria

1. THE API_Server SHALL include CORS middleware configured to allow all origins during development.
2. THE `vite.config.js` SHALL include a proxy rule that forwards all requests matching `/api/*` to `http://localhost:8000`.
3. WHEN the frontend calls `/api/patients`, THE request SHALL reach the FastAPI server without a CORS error in the browser console.
