import random
from dataclasses import dataclass


SUGGESTIONS = {
    "brain-tumor": {
        "Positive": "Anomaly detected in MRI scan. Immediate neurosurgical consultation recommended. Schedule contrast-enhanced MRI within 48 hours.",
        "Negative": "No significant anomalies detected. Recommend routine follow-up MRI in 6 months.",
    },
    "pneumonia": {
        "Positive": "Infiltrates consistent with pneumonia detected. Initiate empiric antibiotic therapy and obtain sputum culture.",
        "Negative": "Lungs appear clear. No signs of active infection. Continue routine monitoring.",
    },
    "skin-cancer": {
        "Positive": "Suspicious lesion identified. Recommend excisional biopsy and dermatopathology referral within 2 weeks.",
        "Negative": "Benign appearing lesion. Annual dermoscopic surveillance recommended.",
    },
    "eye-disease": {
        "Positive": "Signs of glaucomatous optic neuropathy detected. Urgent ophthalmology referral for IOP measurement and visual field testing.",
        "Negative": "Retinal fundus appears normal. Continue annual eye examinations.",
    },
    "heart-disease": {
        "Positive": "Clinical parameters indicate high probability of coronary artery disease. Immediate ECG and cardiology referral recommended.",
        "Negative": "Cardiovascular risk parameters within normal range. Maintain healthy lifestyle and annual screening.",
    },
    "diabetes": {
        "Positive": "Elevated glucose and metabolic markers suggest pre-diabetic or diabetic state. Recommend HbA1c test and dietary counseling.",
        "Negative": "Metabolic parameters within acceptable range. Continue balanced diet and regular exercise.",
    },
}


def derive_risk(confidence: float, result: str) -> str:
    if result == "Negative":
        return "Low"
    if confidence >= 85.0:
        return "High"
    return "Medium"


@dataclass
class PredictionResult:
    result: str
    confidence: float
    risk: str
    suggestion: str


class MockPredictor:
    """Fallback predictor used when a real model file is not available."""

    def __init__(self, disease_id: str):
        self.disease_id = disease_id

    def predict(self, input_data=None) -> PredictionResult:
        is_positive = random.random() > 0.4
        result = "Positive" if is_positive else "Negative"
        confidence = round(
            (75 + random.random() * 24) if is_positive else (55 + random.random() * 30),
            1,
        )
        risk = derive_risk(confidence, result)
        suggestions = SUGGESTIONS.get(
            self.disease_id,
            {
                "Positive": "Please consult a specialist for further evaluation.",
                "Negative": "No significant findings. Routine follow-up recommended.",
            },
        )
        suggestion = suggestions[result]
        return PredictionResult(result=result, confidence=confidence, risk=risk, suggestion=suggestion)
