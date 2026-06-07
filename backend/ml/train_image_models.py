"""
Train image-based CNN models using PyTorch MobileNetV2 transfer learning.

Datasets must be downloaded first. Run:
    python backend/ml/download_datasets.py

Usage:
    python backend/ml/train_image_models.py --disease brain-tumor
    python backend/ml/train_image_models.py --disease pneumonia
    python backend/ml/train_image_models.py --disease skin-cancer
    python backend/ml/train_image_models.py --disease eye-disease
    python backend/ml/train_image_models.py --disease all
"""

import argparse
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

MODELS_DIR = Path(__file__).parent.parent / "models"
DATA_DIR = Path(__file__).parent.parent / "data"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

DISEASE_CONFIG = {
    "brain-tumor": {
        "num_classes": 4,
        "classes": ["glioma", "meningioma", "notumor", "pituitary"],
    },
    "pneumonia": {
        "num_classes": 2,
        "classes": ["NORMAL", "PNEUMONIA"],
    },
    "skin-cancer": {
        "num_classes": 2,
        "classes": ["benign", "malignant"],
    },
    "eye-disease": {
        "num_classes": 4,
        "classes": ["normal", "diabetic_retinopathy", "glaucoma", "cataract"],
    },
}

TRAIN_TRANSFORMS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
    transforms.ToTensor(),
])

VAL_TRANSFORMS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])


def build_model(num_classes: int) -> nn.Module:
    base = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    # Freeze all base layers initially
    for param in base.parameters():
        param.requires_grad = False
    # Replace classifier head
    base.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(base.last_channel, 128),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(128, num_classes),
    )
    return base


def unfreeze_last_layers(model: nn.Module, n: int = 3):
    """Unfreeze the last n feature layers for fine-tuning."""
    features = list(model.features.children())
    for layer in features[-n:]:
        for param in layer.parameters():
            param.requires_grad = True


def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss, correct, total = 0.0, 0, 0
    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * imgs.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()
        total += imgs.size(0)
    return total_loss / total, correct / total


def evaluate(model, loader, device):
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            correct += (outputs.argmax(1) == labels).sum().item()
            total += imgs.size(0)
    return correct / total


def train_disease(disease_id: str):
    config = DISEASE_CONFIG[disease_id]
    num_classes = config["num_classes"]
    data_path = DATA_DIR / disease_id

    if not data_path.exists():
        print(f"ERROR: Dataset not found at {data_path}")
        print(f"Run: python backend/ml/download_datasets.py")
        return

    train_dir = data_path / "train"
    val_dir = data_path / "val"

    if not train_dir.exists():
        print(f"ERROR: Training data not found at {train_dir}")
        return

    print(f"\n=== Training {disease_id} ({num_classes} classes) ===")

    train_dataset = datasets.ImageFolder(str(train_dir), transform=TRAIN_TRANSFORMS)
    val_dataset = datasets.ImageFolder(str(val_dir), transform=VAL_TRANSFORMS) if val_dir.exists() else None

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=2) if val_dataset else None

    print(f"  Train samples: {len(train_dataset)}")
    if val_dataset:
        print(f"  Val samples:   {len(val_dataset)}")
    print(f"  Classes: {train_dataset.classes}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"  Device: {device}")

    model = build_model(num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)

    best_val_acc = 0.0
    best_path = MODELS_DIR / f"{disease_id}.pt"

    for epoch in range(1, 11):
        # After epoch 5: unfreeze last 3 base layers and reduce lr
        if epoch == 6:
            unfreeze_last_layers(model, n=3)
            for pg in optimizer.param_groups:
                pg["lr"] = 1e-4
            print("  [Epoch 6] Unfroze last 3 base layers, lr → 1e-4")

        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)

        if val_loader:
            val_acc = evaluate(model, val_loader, device)
            print(f"  Epoch {epoch:2d}/10 — loss: {train_loss:.4f}  train_acc: {train_acc:.4f}  val_acc: {val_acc:.4f}")
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(model.state_dict(), best_path)
        else:
            print(f"  Epoch {epoch:2d}/10 — loss: {train_loss:.4f}  train_acc: {train_acc:.4f}")
            torch.save(model.state_dict(), best_path)

    print(f"  Best val acc: {best_val_acc:.4f}")
    print(f"  Saved → {best_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train image CNN models")
    parser.add_argument(
        "--disease",
        choices=list(DISEASE_CONFIG.keys()) + ["all"],
        required=True,
        help="Disease to train",
    )
    args = parser.parse_args()

    if args.disease == "all":
        for d in DISEASE_CONFIG:
            train_disease(d)
    else:
        train_disease(args.disease)

    print("\nDone. Models saved to backend/models/")
