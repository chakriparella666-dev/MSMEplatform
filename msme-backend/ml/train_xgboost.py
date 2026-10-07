import os
import json
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
from generate_data import generate_msme_dataset

BASE_DIR = os.path.dirname(__file__)
DATA_FILE = os.path.join(BASE_DIR, 'msme_sales_data.csv')
MODEL_FILE = os.path.join(BASE_DIR, 'xgboost_model.json')
META_FILE = os.path.join(BASE_DIR, 'model_meta.json')

def train_model():
    if not os.path.exists(DATA_FILE):
        print("Dataset not found. Generating dataset...")
        generate_msme_dataset('msme_sales_data.csv')
        
    print(f"Loading data from {DATA_FILE}...")
    df = pd.read_csv(DATA_FILE)
    
    # Category mapping (One-Hot Encoding or integer map)
    categories = ['Textiles', 'Handicrafts', 'Food Processing', 'Leather Goods', 'Wooden Furniture', 'Electronics']
    cat_map = {cat: idx for idx, cat in enumerate(categories)}
    df['category_code'] = df['category'].map(cat_map).fillna(0)
    
    feature_cols = [
        'category_code', 'price', 'month', 'week_of_year',
        'is_festive_season', 'discount_percent', 'past_4w_avg_sales',
        'page_views', 'stock_level'
    ]
    
    X = df[feature_cols]
    y = df['actual_demand']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Regressor model...")
    model = xgb.XGBRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluation
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    mape = mean_absolute_percentage_error(y_test, predictions)
    error_percent = round(mape * 100, 1)
    accuracy_percent = round(100 - error_percent, 1)
    
    print("[SUCCESS] Training Complete!")
    print(f"   MAE: {mae:.2f} units")
    print(f"   MAPE (Forecast Error): {error_percent}%")
    print(f"   Model Accuracy Score: {accuracy_percent}%")
    
    # Save Model
    model.save_model(MODEL_FILE)
    print(f"Saved trained XGBoost model to {MODEL_FILE}")
    
    # Save Metadata
    meta = {
        'feature_cols': feature_cols,
        'cat_map': cat_map,
        'categories': categories,
        'mae': round(float(mae), 2),
        'forecast_error': error_percent,
        'accuracy': accuracy_percent
    }
    with open(META_FILE, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"Saved model metadata to {META_FILE}")

if __name__ == '__main__':
    train_model()
