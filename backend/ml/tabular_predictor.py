import joblib
import pandas as pd
from pathlib import Path
from ml.mock_predictor import PredictionResult, derive_risk, SUGGESTIONS
from ml.preprocessors import map_tabular_features

DISEASE_NAMES = {
    "heart-disease": "Heart Disease",
    "diabetes":      "Diabetes Risk",
}


class TabularPredictor:
    """Wraps a joblib-serialised sklearn Pipeline (StandardScaler + XGBClassifier)."""

    def __init__(self, disease_id: str, pkl_path: Path):
        self.disease_id = disease_id
        self.pipeline = joblib.load(pkl_path)

    def predict(self, params: dict) -> PredictionResult:
        # Map frontend keys → model column names
        mapped = map_tabular_features(self.disease_id, params)
        df = pd.DataFrame([mapped])

        # Get probability of positive class
        proba = self.pipeline.predict_proba(df)[0]
        pos_prob = float(proba[1]) if len(proba) > 1 else float(proba[0])
        confidence = round(pos_prob * 100, 1)
        result = "Positive" if pos_prob >= 0.5 else "Negative"
        risk = derive_risk(confidence, result)

        suggestions = SUGGESTIONS.get(self.disease_id, {})
        suggestion = suggestions.get(result, "Please consult a specialist for further evaluation.")

        return PredictionResult(
            result=result,
            confidence=confidence,
            risk=risk,
            suggestion=suggestion,
        )
