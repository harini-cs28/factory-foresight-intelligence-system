from pathlib import Path
from typing import Dict, Any, List, Tuple, Union
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from app.core.config import settings

# Core operational & sensor features for ML models (No target leakage)
FEATURE_COLUMNS: List[str] = [
    "temperature_c",
    "vibration_mm_s",
    "motor_current_a",
    "rpm",
    "pressure_bar",
    "load_percentage",
    "operating_hours",
    "maintenance_count",
]

TARGET_FAILURE: str = "failure_within_20_cycles"
TARGET_RUL: str = "rul_cycles"


def load_and_validate_dataset(csv_path: Union[str, Path] = None) -> pd.DataFrame:
    """
    Loads and validates the synthetic textile machine sensor dataset from CSV.
    Ensures required features and target variables exist with zero null values.
    """
    path = Path(csv_path) if csv_path else settings.SENSOR_DATA_CSV
    if not path.exists():
        raise FileNotFoundError(f"Dataset CSV not found at: {path}")

    df = pd.read_csv(path)

    # Validate required columns
    required_cols = FEATURE_COLUMNS + [TARGET_FAILURE, TARGET_RUL, "machine_id", "cycle"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    # Check missing values
    if df[FEATURE_COLUMNS + [TARGET_FAILURE, TARGET_RUL]].isnull().any().any():
        df = df.dropna(subset=FEATURE_COLUMNS + [TARGET_FAILURE, TARGET_RUL])

    return df


def prepare_training_data(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series, pd.Series]:
    """
    Prepares feature matrix X and targets y_failure, y_rul.
    Splits into training and testing sets with stratification on the binary failure target.
    """
    X = df[FEATURE_COLUMNS].copy()
    y_failure = df[TARGET_FAILURE].copy()
    y_rul = df[TARGET_RUL].copy()

    X_train, X_test, y_f_train, y_f_test, y_r_train, y_r_test = train_test_split(
        X,
        y_failure,
        y_rul,
        test_size=test_size,
        random_state=random_state,
        stratify=y_failure
    )

    return X_train, X_test, y_f_train, y_f_test, y_r_train, y_r_test


def validate_and_format_features(data: Dict[str, Any]) -> pd.DataFrame:
    """
    Validates a single machine sensor dictionary and returns a 1-row DataFrame
    aligned with the training feature columns.
    """
    for col in FEATURE_COLUMNS:
        if col not in data:
            raise ValueError(f"Missing required sensor feature: {col}")

    row = {col: float(data[col]) for col in FEATURE_COLUMNS}
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)
