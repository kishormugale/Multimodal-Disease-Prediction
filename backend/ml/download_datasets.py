"""
Dataset download instructions for KDM Care image models.

Tabular datasets (Heart Disease, Diabetes) are downloaded automatically
by train_tabular.py — no action needed for those.

Run this script to see instructions:
    python backend/ml/download_datasets.py
"""

INSTRUCTIONS = """
╔══════════════════════════════════════════════════════════════════════════════╗
║         KDM Care Hospital — Image Dataset Download Instructions             ║
╚══════════════════════════════════════════════════════════════════════════════╝

PREREQUISITES
─────────────
1. Create a free Kaggle account at https://www.kaggle.com
2. Go to https://www.kaggle.com/settings/account → API → Create New Token
3. Place the downloaded kaggle.json at:
   Windows: C:\\Users\\<your-username>\\.kaggle\\kaggle.json
4. Install kaggle CLI:  pip install kaggle

DOWNLOAD COMMANDS
─────────────────
Run these from your project root (D:\\model):

  # 1. Brain Tumor MRI (4 classes: glioma, meningioma, notumor, pituitary)
  kaggle datasets download masoudnickparvar/brain-tumor-mri-dataset -p backend/data/brain-tumor --unzip

  # 2. Chest X-Ray Pneumonia (2 classes: NORMAL, PNEUMONIA)
  kaggle datasets download paultimothymooney/chest-xray-pneumonia -p backend/data/pneumonia --unzip

  # 3. Skin Cancer HAM10000 (will be split into benign/malignant)
  kaggle datasets download kmader/skin-lesion-analysis-toward-melanoma-detection -p backend/data/skin-cancer --unzip

  # 4. Eye Disease ODIR-5K (4 classes: normal, diabetic_retinopathy, glaucoma, cataract)
  kaggle datasets download andrewmvd/ocular-disease-recognition-odir5k -p backend/data/eye-disease --unzip

EXPECTED FOLDER STRUCTURE
──────────────────────────
After downloading and organising, your backend/data/ should look like:

  backend/data/
  ├── brain-tumor/
  │   ├── train/
  │   │   ├── glioma/          (images)
  │   │   ├── meningioma/      (images)
  │   │   ├── notumor/         (images)
  │   │   └── pituitary/       (images)
  │   └── val/
  │       └── (same 4 folders)
  ├── pneumonia/
  │   ├── train/
  │   │   ├── NORMAL/          (images)
  │   │   └── PNEUMONIA/       (images)
  │   └── val/
  │       └── (same 2 folders)
  ├── skin-cancer/
  │   ├── train/
  │   │   ├── benign/          (images)
  │   │   └── malignant/       (images)
  │   └── val/
  │       └── (same 2 folders)
  └── eye-disease/
      ├── train/
      │   ├── normal/          (images)
      │   ├── diabetic_retinopathy/
      │   ├── glaucoma/
      │   └── cataract/
      └── val/
          └── (same 4 folders)

NOTE: The Kaggle datasets may have slightly different folder names after
unzipping. Rename them to match the structure above before training.

TRAINING COMMANDS (after datasets are ready)
────────────────────────────────────────────
  python backend/ml/train_tabular.py                          # auto-downloads data
  python backend/ml/train_image_models.py --disease brain-tumor
  python backend/ml/train_image_models.py --disease pneumonia
  python backend/ml/train_image_models.py --disease skin-cancer
  python backend/ml/train_image_models.py --disease eye-disease

Trained models will be saved to backend/models/ and loaded automatically
by the FastAPI server on next startup.
"""

if __name__ == "__main__":
    print(INSTRUCTIONS)
