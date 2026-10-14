from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from app.ml.preprocessing import FEATURE_COLUMNS


def train_rul_regressor(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    n_estimators: int = 200,
    random_state: int = 42
) -> Tuple[RandomForestRegressor, Dict[str, Any]]:
    """
    Trains and evaluates a RandomForestRegressor to predict remaining useful life (RUL in cycles).
    """
    model = RandomForestRegressor(
        n_estimators=n_estimators,
        random_state=random_state,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    # Feature importances
    feature_importances = {
        feat: float(imp)
        for feat, imp in zip(FEATURE_COLUMNS, model.feature_importances_)
    }

    metrics = {
        "mae": mae,
        "rmse": rmse,
        "r2_score": r2,
        "feature_importances": feature_importances
    }

    return model, metrics
