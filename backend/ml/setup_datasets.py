"""
Automated dataset downloader and organizer for KDM Care image models.

This script:
1. Downloads all 4 image datasets from Kaggle using the kaggle Python API
2. Extracts and organizes them into the correct folder structure
3. Splits data into train/val sets if not already split

Prerequisites:
- Place kaggle.json at C:\\Users\\<username>\\.kaggle\\kaggle.json
  (Download from https://www.kaggle.com/settings/account -> API -> Create New Token)

Usage:
    python backend/ml/setup_datasets.py
    python backend/ml/setup_datasets.py --disease brain-tumor
    python backend/ml/setup_datasets.py --disease pneumonia
    python backend/ml/setup_datasets.py --disease skin-cancer
    python backend/ml/setup_datasets.py --disease eye-disease
"""

import argparse
import os
import shutil
import zipfile
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

# ── Dataset configurations ────────────────────────────────────────────────────
# Using the LARGEST available datasets for maximum accuracy

DATASETS = {
    "brain-tumor": {
        "kaggle_dataset": "masoudnickparvar/brain-tumor-mri-dataset",
        "description": "Brain Tumor MRI Dataset (~7,000 images, 4 classes)",
        "classes": ["glioma", "meningioma", "notumor", "pituitary"],
        "num_classes": 4,
        # After unzip, the dataset has Training/ and Testing/ folders
        "source_train": "Training",
        "source_val": "Testing",
        "class_map": {
            "glioma": "glioma",
            "meningioma": "meningioma",
            "notumor": "notumor",
            "pituitary": "pituitary",
            # Some versions use different casing
            "glioma_tumor": "glioma",
            "meningioma_tumor": "meningioma",
            "no_tumor": "notumor",
            "pituitary_tumor": "pituitary",
        },
    },
    "pneumonia": {
        "kaggle_dataset": "paultimothymooney/chest-xray-pneumonia",
        "description": "Chest X-Ray Pneumonia Dataset (~5,863 images, 2 classes)",
        "classes": ["NORMAL", "PNEUMONIA"],
        "num_classes": 2,
        "source_train": "chest_xray/train",
        "source_val": "chest_xray/test",
        "class_map": {
            "NORMAL": "NORMAL",
            "PNEUMONIA": "PNEUMONIA",
        },
    },
    "skin-cancer": {
        "kaggle_dataset": "fanconic/skin-cancer-malignant-vs-benign",
        "description": "Skin Cancer Malignant vs Benign (~3,600 images, 2 classes)",
        "classes": ["benign", "malignant"],
        "num_classes": 2,
        "source_train": "train",
        "source_val": "test",
        "class_map": {
            "benign": "benign",
            "malignant": "malignant",
            "0": "benign",
            "1": "malignant",
        },
    },
    "eye-disease": {
        # Using larger eye disease dataset (~4,200 images, 4 classes)
        "kaggle_dataset": "gunavenkatdoddi/eye-diseases-classification",
        "description": "Eye Diseases Classification Dataset (~4,200 images, 4 classes)",
        "classes": ["normal", "diabetic_retinopathy", "glaucoma", "cataract"],
        "num_classes": 4,
        "source_train": "dataset/train",
        "source_val": "dataset/test",
        "class_map": {
            "Normal": "normal",
            "normal": "normal",
            "Diabetic_Retinopathy": "diabetic_retinopathy",
            "diabetic_retinopathy": "diabetic_retinopathy",
            "Glaucoma": "glaucoma",
            "glaucoma": "glaucoma",
            "Cataract": "cataract",
            "cataract": "cataract",
        },
    },
}


def check_kaggle_credentials():
    """Verify kaggle.json exists."""
    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    if not kaggle_json.exists():
        print("ERROR: kaggle.json not found!")
        print(f"Expected at: {kaggle_json}")
        print("\nTo get it:")
        print("  1. Go to https://www.kaggle.com/settings/account")
        print("  2. Scroll to API section -> Create New Token")
        print(f"  3. Place the downloaded kaggle.json at: {kaggle_json}")
        return False
    print(f"Kaggle credentials found at {kaggle_json}")
    return True


def download_dataset(disease_id: str, config: dict, download_dir: Path):
    """Download a Kaggle dataset using the kaggle Python API."""
    try:
        import kaggle
        kaggle.api.authenticate()
    except Exception as e:
        print(f"  ERROR: Could not authenticate with Kaggle: {e}")
        return False

    print(f"  Downloading {config['description']}...")
    print(f"  Dataset: {config['kaggle_dataset']}")

    try:
        download_dir.mkdir(parents=True, exist_ok=True)
        kaggle.api.dataset_download_files(
            config["kaggle_dataset"],
            path=str(download_dir),
            unzip=True,
            quiet=False,
        )
        print(f"  Download complete.")
        return True
    except Exception as e:
        print(f"  ERROR downloading {disease_id}: {e}")
        return False


def organize_dataset(disease_id: str, config: dict, download_dir: Path, output_dir: Path):
    """Organize downloaded files into train/val structure."""
    print(f"  Organizing {disease_id} dataset...")

    train_out = output_dir / "train"
    val_out = output_dir / "val"

    # Create output class directories
    for cls in config["classes"]:
        (train_out / cls).mkdir(parents=True, exist_ok=True)
        (val_out / cls).mkdir(parents=True, exist_ok=True)

    # Find source directories
    source_train = _find_dir(download_dir, config["source_train"])
    source_val = _find_dir(download_dir, config["source_val"])

    if source_train is None:
        print(f"  WARNING: Could not find train dir '{config['source_train']}' in {download_dir}")
        print(f"  Contents: {list(download_dir.iterdir())[:10]}")
        return False

    # Copy train images
    count_train = _copy_images(source_train, train_out, config["class_map"])
    print(f"  Copied {count_train} training images")

    # Copy val images (or split from train if val not found)
    if source_val and source_val.exists():
        count_val = _copy_images(source_val, val_out, config["class_map"])
        print(f"  Copied {count_val} validation images")
    else:
        print(f"  No separate val set found — splitting 20% from train...")
        count_val = _split_val(train_out, val_out, config["classes"], val_ratio=0.2)
        print(f"  Moved {count_val} images to validation set")

    return True


def _find_dir(base: Path, relative: str) -> Path | None:
    """Find a directory, searching recursively if needed."""
    # Direct path
    direct = base / relative
    if direct.exists():
        return direct

    # Search recursively
    parts = Path(relative).parts
    target = parts[-1]
    for p in base.rglob(target):
        if p.is_dir():
            return p

    return None


def _copy_images(source_dir: Path, dest_dir: Path, class_map: dict) -> int:
    """Copy images from source class folders to destination, applying class_map."""
    count = 0
    image_exts = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}

    for src_class_dir in source_dir.iterdir():
        if not src_class_dir.is_dir():
            continue

        src_class = src_class_dir.name
        dest_class = class_map.get(src_class) or class_map.get(src_class.lower())

        if dest_class is None:
            # Try case-insensitive match
            for k, v in class_map.items():
                if k.lower() == src_class.lower():
                    dest_class = v
                    break

        if dest_class is None:
            print(f"    Skipping unknown class: {src_class}")
            continue

        dest_class_dir = dest_dir / dest_class
        dest_class_dir.mkdir(parents=True, exist_ok=True)

        for img_file in src_class_dir.iterdir():
            if img_file.suffix.lower() in image_exts:
                shutil.copy2(img_file, dest_class_dir / img_file.name)
                count += 1

    return count


def _split_val(train_dir: Path, val_dir: Path, classes: list, val_ratio: float = 0.2) -> int:
    """Move val_ratio of training images to validation set."""
    import random
    count = 0
    image_exts = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}

    for cls in classes:
        src = train_dir / cls
        dst = val_dir / cls
        if not src.exists():
            continue
        dst.mkdir(parents=True, exist_ok=True)

        images = [f for f in src.iterdir() if f.suffix.lower() in image_exts]
        random.shuffle(images)
        n_val = max(1, int(len(images) * val_ratio))

        for img in images[:n_val]:
            shutil.move(str(img), dst / img.name)
            count += 1

    return count


def print_dataset_summary(disease_id: str, output_dir: Path, config: dict):
    """Print class distribution summary."""
    print(f"\n  Dataset summary for {disease_id}:")
    for split in ["train", "val"]:
        split_dir = output_dir / split
        if not split_dir.exists():
            continue
        print(f"    {split}/")
        total = 0
        for cls in config["classes"]:
            cls_dir = split_dir / cls
            if cls_dir.exists():
                n = len(list(cls_dir.glob("*.*")))
                print(f"      {cls}: {n} images")
                total += n
        print(f"      Total: {total}")


def setup_disease(disease_id: str):
    config = DATASETS[disease_id]
    download_dir = DATA_DIR / f"{disease_id}_raw"
    output_dir = DATA_DIR / disease_id

    print(f"\n{'='*60}")
    print(f"Setting up: {disease_id}")
    print(f"{'='*60}")

    # Skip if already organized
    train_dir = output_dir / "train"
    if train_dir.exists() and any(train_dir.iterdir()):
        print(f"  Already organized at {output_dir} — skipping download.")
        print_dataset_summary(disease_id, output_dir, config)
        return True

    # Download
    if not download_dataset(disease_id, config, download_dir):
        return False

    # Organize
    if not organize_dataset(disease_id, config, download_dir, output_dir):
        return False

    # Summary
    print_dataset_summary(disease_id, output_dir, config)

    # Clean up raw download
    if download_dir.exists():
        shutil.rmtree(download_dir)
        print(f"  Cleaned up raw download directory.")

    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download and organize image datasets")
    parser.add_argument(
        "--disease",
        choices=list(DATASETS.keys()) + ["all"],
        default="all",
        help="Which disease dataset to download (default: all)",
    )
    args = parser.parse_args()

    print("KDM Care Hospital — Dataset Setup")
    print("=" * 60)

    if not check_kaggle_credentials():
        exit(1)

    diseases = list(DATASETS.keys()) if args.disease == "all" else [args.disease]

    results = {}
    for disease_id in diseases:
        results[disease_id] = setup_disease(disease_id)

    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    for disease_id, success in results.items():
        status = "✓ Ready" if success else "✗ Failed"
        print(f"  {disease_id:20s} {status}")

    print("\nNext step — train the models:")
    for disease_id, success in results.items():
        if success:
            print(f"  python backend/ml/train_image_models.py --disease {disease_id}")
