"""
ML Model Training Pipeline for FFIS (Factory Foresight Intelligence System).
Trains Failure Prediction (Classifier) and RUL Estimation (Regressor) using
the synthetic textile machine sensor dataset, evaluates performance, and saves artifacts.
"""
import sys
import json
import logging
from pathlib import Path
import joblib

from app.core.config import settings
from app.ml.preprocessing import (
    load_and_validate_dataset,
    prepare_training_data,
    FEATURE_COLUMNS,
    TARGET_FAILURE,
    TARGET_RUL,
)
from app.ml.train_failure_model import train_failure_classifier
from app.ml.train_rul_model import train_rul_regressor

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def train_and_export_models():
    logger.info("Starting FFIS Machine Learning Model Training Pipeline...")

    # 1. Ensure artifact directory exists
    models_dir = Path(settings.ML_MODELS_DIR)
    models_dir.mkdir(parents=True, exist_ok=True)

    # 2. Load and validate dataset
    logger.info(f"Loading sensor dataset from: {settings.SENSOR_DATA_CSV}")
    df = load_and_validate_dataset()
    logger.info(f"Loaded {len(df)} rows across {df['machine_id'].nunique()} unique machines.")

    # 3. Prepare data splits
    X_train, X_test, y_f_train, y_f_test, y_r_train, y_r_test = prepare_training_data(df)
    logger.info(f"Training set: {len(X_train)} samples | Testing set: {len(X_test)} samples")

    # 4. Train Failure Prediction Model (Random Forest Classifier)
    logger.info("Training Failure Prediction Model (Target: failure_within_20_cycles)...")
    failure_model, failure_metrics = train_failure_classifier(
        X_train, X_test, y_f_train, y_f_test, n_estimators=200, random_state=42
    )

    # 5. Train RUL Prediction Model (Random Forest Regressor)
    logger.info("Training Remaining Useful Life (RUL) Model (Target: rul_cycles)...")
    rul_model, rul_metrics = train_rul_regressor(
        X_train, X_test, y_r_train, y_r_test, n_estimators=200, random_state=42
    )

    # 6. Save Model Artifacts
    failure_model_path = models_dir / "failure_model.joblib"
    rul_model_path = models_dir / "rul_model.joblib"
    features_path = models_dir / "feature_columns.json"
    metadata_path = models_dir / "model_metadata.json"

    joblib.dump(failure_model, failure_model_path)
    joblib.dump(rul_model, rul_model_path)

    with open(features_path, "w", encoding="utf-8") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)

    metadata = {
        "model_version": "v1.0",
        "features": FEATURE_COLUMNS,
        "target_failure": TARGET_FAILURE,
        "target_rul": TARGET_RUL,
        "failure_metrics": failure_metrics,
        "rul_metrics": rul_metrics,
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 7. Print Comprehensive Summary Report
    print("\n" + "=" * 60)
    print("      FFIS ML MODEL TRAINING & EVALUATION REPORT")
    print("=" * 60)
    print("\n--- FAILURE PREDICTION MODEL (Random Forest Classifier) ---")
    print(f"Accuracy:  {failure_metrics['accuracy']:.4f} ({failure_metrics['accuracy'] * 100:.2f}%)")
    print(f"Precision: {failure_metrics['precision']:.4f}")
    print(f"Recall:    {failure_metrics['recall']:.4f}")
    print(f"F1-Score:  {failure_metrics['f1_score']:.4f}")
    print(f"ROC-AUC:   {failure_metrics['roc_auc']:.4f}")
    print("Confusion Matrix:")
    for row in failure_metrics["confusion_matrix"]:
        print(f"  {row}")

    print("\n--- REMAINING USEFUL LIFE (RUL) MODEL (Random Forest Regressor) ---")
    print(f"MAE:       {rul_metrics['mae']:.2f} cycles")
    print(f"RMSE:      {rul_metrics['rmse']:.2f} cycles")
    print(f"R² Score:  {rul_metrics['r2_score']:.4f}")

    print("\n--- FEATURE IMPORTANCES (Top Factors for Failure) ---")
    sorted_importances = sorted(
        failure_metrics["feature_importances"].items(), key=lambda x: -x[1]
    )
    for feat, imp in sorted_importances:
        print(f"  {feat:<20}: {imp:.4f} ({imp * 100:.2f}%)")

    print(f"\nArtifacts successfully saved in: {models_dir}")
    print("=" * 60 + "\n")

    return True


if __name__ == "__main__":
    success = train_and_export_models()
    sys.exit(0 if success else 1)
