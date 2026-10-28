import os
import time
import json
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    root_mean_squared_error,
    mean_absolute_percentage_error,
    r2_score,
    precision_score,
    recall_score,
    f1_score
)
import joblib

BASE_DIR = os.path.dirname(__file__)
DATA_FILE = os.path.join(BASE_DIR, 'kaggle_processed_sales.csv')
XGB_MODEL_FILE = os.path.join(BASE_DIR, 'xgboost_model_kaggle.json')
RF_MODEL_FILE = os.path.join(BASE_DIR, 'random_forest_model_kaggle.joblib')
COMPARISON_FILE = os.path.join(BASE_DIR, 'model_comparison.json')

def train_and_compare():
    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(f"Processed file not found at {DATA_FILE}")

    print(f"Loading real Kaggle processed data from {DATA_FILE}...")
    df = pd.read_csv(DATA_FILE)

    feature_cols = [
        'category_code', 'price', 'month', 'week_of_year',
        'is_festive_season', 'discount_percent', 'past_4w_avg_sales',
        'page_views', 'stock_level'
    ]
    target_col = 'actual_demand'

    X = df[feature_cols]
    y = df[target_col]
    stock_test_reference = df['stock_level']

    # 80/20 train/test split with fixed seed for identical evaluation
    X_train, X_test, y_train, y_test, stock_train, stock_test = train_test_split(
        X, y, stock_test_reference, test_size=0.2, random_state=42
    )

    print(f"Dataset split: {len(X_train)} training samples, {len(X_test)} testing samples.\n")

    # ── 1. Train XGBoost ────────────────────────────────────────────────────────
    print("--------------------------------------------------")
    print("Training Model 1: XGBoost Regressor...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=150,
        learning_rate=0.06,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )

    t0 = time.time()
    xgb_model.fit(X_train, y_train)
    xgb_train_time = round(time.time() - t0, 3)

    t0 = time.time()
    xgb_preds = xgb_model.predict(X_test)
    xgb_pred_time = round((time.time() - t0) * 1000 / len(X_test), 3) # ms per sample

    # Regression Metrics
    xgb_mae = mean_absolute_error(y_test, xgb_preds)
    xgb_rmse = root_mean_squared_error(y_test, xgb_preds)
    xgb_mape = mean_absolute_percentage_error(y_test, xgb_preds)
    xgb_error_pct = round(xgb_mape * 100, 2)
    xgb_accuracy = round(100 - xgb_error_pct, 2)
    xgb_r2 = round(r2_score(y_test, xgb_preds), 4)

    # Classification Metrics (Stockout Risk Alert: Demand > Stock)
    actual_stockout = (y_test > stock_test).astype(int)
    xgb_pred_stockout = (xgb_preds > stock_test).astype(int)
    xgb_prec = round(precision_score(actual_stockout, xgb_pred_stockout) * 100, 2)
    xgb_rec = round(recall_score(actual_stockout, xgb_pred_stockout) * 100, 2)
    xgb_f1 = round(f1_score(actual_stockout, xgb_pred_stockout) * 100, 2)

    xgb_model.save_model(XGB_MODEL_FILE)
    print(f"[XGBoost] Model saved to {XGB_MODEL_FILE}")

    # ── 2. Train Random Forest ──────────────────────────────────────────────────
    print("--------------------------------------------------")
    print("Training Model 2: Random Forest Regressor...")
    rf_model = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )

    t0 = time.time()
    rf_model.fit(X_train, y_train)
    rf_train_time = round(time.time() - t0, 3)

    t0 = time.time()
    rf_preds = rf_model.predict(X_test)
    rf_pred_time = round((time.time() - t0) * 1000 / len(X_test), 3) # ms per sample

    # Regression Metrics
    rf_mae = mean_absolute_error(y_test, rf_preds)
    rf_rmse = root_mean_squared_error(y_test, rf_preds)
    rf_mape = mean_absolute_percentage_error(y_test, rf_preds)
    rf_error_pct = round(rf_mape * 100, 2)
    rf_accuracy = round(100 - rf_error_pct, 2)
    rf_r2 = round(r2_score(y_test, rf_preds), 4)

    # Classification Metrics (Stockout Risk Alert: Demand > Stock)
    rf_pred_stockout = (rf_preds > stock_test).astype(int)
    rf_prec = round(precision_score(actual_stockout, rf_pred_stockout) * 100, 2)
    rf_rec = round(recall_score(actual_stockout, rf_pred_stockout) * 100, 2)
    rf_f1 = round(f1_score(actual_stockout, rf_pred_stockout) * 100, 2)

    joblib.dump(rf_model, RF_MODEL_FILE)
    print(f"[Random Forest] Model saved to {RF_MODEL_FILE}")

    # ── 3. Compile Comparison Summary ───────────────────────────────────────────
    comparison = {
        "dataset": "Kaggle Superstore Retail Sales Dataset (train.csv)",
        "total_records": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features": feature_cols,
        "models": {
            "xgboost": {
                "name": "XGBoost Regressor",
                "mae": round(float(xgb_mae), 2),
                "rmse": round(float(xgb_rmse), 2),
                "mape": round(float(xgb_mape), 4),
                "forecast_error_percent": xgb_error_pct,
                "accuracy_score": xgb_accuracy,
                "r2_score": xgb_r2,
                "precision": xgb_prec,
                "recall": xgb_rec,
                "f1_score": xgb_f1,
                "training_time_sec": xgb_train_time,
                "inference_latency_ms": xgb_pred_time
            },
            "random_forest": {
                "name": "Random Forest Regressor",
                "mae": round(float(rf_mae), 2),
                "rmse": round(float(rf_rmse), 2),
                "mape": round(float(rf_mape), 4),
                "forecast_error_percent": rf_error_pct,
                "accuracy_score": rf_accuracy,
                "r2_score": rf_r2,
                "precision": rf_prec,
                "recall": rf_rec,
                "f1_score": rf_f1,
                "training_time_sec": rf_train_time,
                "inference_latency_ms": rf_pred_time
            }
        }
    }

    # Determine winner per key metric
    winner_accuracy = "XGBoost" if xgb_accuracy >= rf_accuracy else "Random Forest"
    winner_rmse = "XGBoost" if xgb_rmse <= rf_rmse else "Random Forest"
    winner_f1 = "XGBoost" if xgb_f1 >= rf_f1 else "Random Forest"
    winner_speed = "XGBoost" if xgb_train_time <= rf_train_time else "Random Forest"

    comparison["verdict"] = {
        "best_accuracy": winner_accuracy,
        "lowest_rmse": winner_rmse,
        "best_f1_score": winner_f1,
        "fastest_training": winner_speed
    }

    with open(COMPARISON_FILE, 'w') as f:
        json.dump(comparison, f, indent=2)

    print("\n==================================================")
    print("           MODEL BENCHMARK RESULTS                ")
    print("==================================================")
    print(f"Metric               | XGBoost      | Random Forest")
    print(f"---------------------+--------------+--------------")
    print(f"Accuracy Score (%)   | {xgb_accuracy:>10}% | {rf_accuracy:>10}%")
    print(f"Forecast Error (MAPE)| {xgb_error_pct:>10}% | {rf_error_pct:>10}%")
    print(f"MAE (units)          | {xgb_mae:>12.2f} | {rf_mae:>12.2f}")
    print(f"RMSE (units)         | {xgb_rmse:>12.2f} | {rf_rmse:>12.2f}")
    print(f"R² Score             | {xgb_r2:>12.4f} | {rf_r2:>12.4f}")
    print(f"Precision (%)        | {xgb_prec:>10}% | {rf_prec:>10}%")
    print(f"Recall (%)           | {xgb_rec:>10}% | {rf_rec:>10}%")
    print(f"F1-Score (%)         | {xgb_f1:>10}% | {rf_f1:>10}%")
    print(f"Training Time (s)    | {xgb_train_time:>11.3f}s | {rf_train_time:>11.3f}s")
    print(f"Inference Latency    | {xgb_pred_time:>10.3f}ms | {rf_pred_time:>10.3f}ms")
    print("==================================================")
    print(f"Saved full comparison to {COMPARISON_FILE}\n")

if __name__ == '__main__':
    train_and_compare()
