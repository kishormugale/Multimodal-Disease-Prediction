import logging
from pathlib import Path
from ml.mock_predictor import MockPredictor

logger = logging.getLogger(__name__)

IMAGE_DISEASES: dict[str, int] = {
    "brain-tumor": 4,
    "pneumonia":   2,
    "skin-cancer": 2,
    "eye-disease": 4,
}

TABULAR_DISEASES: list[str] = ["heart-disease", "diabetes"]

ALL_DISEASES = list(IMAGE_DISEASES.keys()) + TABULAR_DISEASES

DISEASE_NAMES: dict[str, str] = {
    "brain-tumor":  "Brain Tumor Detection",
    "pneumonia":    "Pneumonia",
    "skin-cancer":  "Skin Cancer",
    "eye-disease":  "Eye Disease",
    "heart-disease": "Heart Disease",
    "diabetes":     "Diabetes Risk",
}


class ModelRegistry:
    def __init__(self, models_dir: Path):
        self.models_dir = models_dir
        self._predictors: dict[str, object] = {}
        self._status: dict[str, str] = {}

    def load_all(self) -> None:
        self.models_dir.mkdir(parents=True, exist_ok=True)

        # Load tabular models
        for disease_id in TABULAR_DISEASES:
            pkl_path = self.models_dir / f"{disease_id}.pkl"
            try:
                from ml.tabular_predictor import TabularPredictor

                predictor = TabularPredictor(disease_id, pkl_path)
                self._predictors[disease_id] = predictor
                self._status[disease_id] = "real"
                logger.info("Loaded tabular model for %s from %s", disease_id, pkl_path)
            except Exception as exc:
                logger.warning("Could not load tabular model for %s (%s) — using mock.", disease_id, exc)
                self._predictors[disease_id] = MockPredictor(disease_id)
                self._status[disease_id] = "mock"

        # Load image models
        for disease_id, num_classes in IMAGE_DISEASES.items():
            pt_path = self.models_dir / f"{disease_id}.pt"
            try:
                from ml.image_predictor import ImagePredictor

                predictor = ImagePredictor(disease_id, pt_path, num_classes)
                self._predictors[disease_id] = predictor
                self._status[disease_id] = "real"
                logger.info("Loaded image model for %s from %s", disease_id, pt_path)
            except Exception as exc:
                logger.warning("Could not load image model for %s (%s) — using mock.", disease_id, exc)
                self._predictors[disease_id] = MockPredictor(disease_id)
                self._status[disease_id] = "mock"

    def get_predictor(self, disease_id: str):
        return self._predictors.get(disease_id)

    def get_status(self) -> dict[str, str]:
        return dict(self._status)

    def is_known(self, disease_id: str) -> bool:
        return disease_id in ALL_DISEASES


# Singleton instance — populated during FastAPI lifespan startup
registry = ModelRegistry(Path(__file__).parent.parent / "models")
