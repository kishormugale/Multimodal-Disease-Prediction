import torch
import torch.nn as nn
from pathlib import Path
from torchvision import models
from ml.mock_predictor import PredictionResult, derive_risk, SUGGESTIONS
from ml.preprocessors import image_preprocess


def build_mobilenet(num_classes: int) -> nn.Module:
    """Build MobileNetV2 with a custom classification head."""
    base = models.mobilenet_v2(weights=None)
    base.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(base.last_channel, 128),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(128, num_classes),
    )
    return base


class ImagePredictor:
    """Loads a PyTorch MobileNetV2 state dict and runs image inference."""

    def __init__(self, disease_id: str, pt_path: Path, num_classes: int):
        self.disease_id = disease_id
        self.num_classes = num_classes
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.model = build_mobilenet(num_classes)
        state = torch.load(pt_path, map_location=self.device)
        self.model.load_state_dict(state)
        self.model.to(self.device)
        self.model.eval()

    def predict(self, file_bytes: bytes) -> PredictionResult:
        tensor = image_preprocess(file_bytes).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)                    # (1, num_classes)
            probs = torch.softmax(logits, dim=1)[0]        # (num_classes,)

        # For binary models: class 1 = positive
        # For multi-class models: any non-zero class = positive
        if self.num_classes == 2:
            pos_prob = float(probs[1])
            result = "Positive" if pos_prob >= 0.5 else "Negative"
            confidence = round(pos_prob * 100 if result == "Positive" else (1 - pos_prob) * 100, 1)
        else:
            # Class 0 is typically "normal/no disease"
            normal_prob = float(probs[0])
            pos_prob = 1.0 - normal_prob
            result = "Positive" if pos_prob >= 0.5 else "Negative"
            confidence = round(pos_prob * 100 if result == "Positive" else normal_prob * 100, 1)

        risk = derive_risk(confidence, result)
        suggestions = SUGGESTIONS.get(self.disease_id, {})
        suggestion = suggestions.get(result, "Please consult a specialist for further evaluation.")

        return PredictionResult(
            result=result,
            confidence=confidence,
            risk=risk,
            suggestion=suggestion,
        )
