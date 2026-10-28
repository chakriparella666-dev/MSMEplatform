import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(__file__)
RAW_CSV = os.path.join(BASE_DIR, 'data', 'train.csv')
PROCESSED_CSV = os.path.join(BASE_DIR, 'kaggle_processed_sales.csv')

def preprocess():
    print(f"Reading raw Kaggle dataset from {RAW_CSV}...")
    df = pd.read_csv(RAW_CSV)
    
    # Parse dates
    df['date'] = pd.to_datetime(df['Order Date'], format='mixed', dayfirst=True)
    df['year'] = df['date'].dt.year
    df['week'] = df['date'].dt.isocalendar().week
    df['month'] = df['date'].dt.month
    
    # Clean subcategories and categories
    df['Category'] = df['Category'].fillna('General')
    df['Sub-Category'] = df['Sub-Category'].fillna('General')
    
    # Aggregate weekly demand per sub-category
    weekly = df.groupby(['Sub-Category', 'Category', 'year', 'week', 'month']).agg(
        order_count=('Row ID', 'count'),
        total_sales=('Sales', 'sum'),
        avg_price=('Sales', 'mean')
    ).reset_index()
    
    # Sort chronologically for rolling lag calculations
    weekly = weekly.sort_values(by=['Sub-Category', 'year', 'week']).reset_index(drop=True)
    
    # Calculate rolling past 4-week sales (actual demand baseline in units)
    # Unit demand = order_count * 10 (scaling to realistic MSME unit batch volume)
    weekly['actual_demand'] = (weekly['order_count'] * 10).astype(int)
    weekly['past_4w_avg_sales'] = weekly.groupby('Sub-Category')['actual_demand'].transform(
        lambda s: s.rolling(window=4, min_periods=1).mean().shift(1)
    ).fillna(weekly['actual_demand'].mean()).round(1)
    
    # Unit price rounded
    weekly['price'] = weekly['avg_price'].round(2)
    
    # Calendar features
    weekly['week_of_year'] = weekly['week'].astype(int)
    weekly['is_festive_season'] = weekly['month'].apply(lambda m: 1 if m in [9, 10, 11, 12] else 0)
    
    # Simulate realistic business discounts and customer traffic views
    np.random.seed(42)
    weekly['discount_percent'] = np.random.choice([0, 5, 10, 15, 20], size=len(weekly), p=[0.4, 0.25, 0.2, 0.1, 0.05])
    weekly['page_views'] = (weekly['actual_demand'] * np.random.uniform(7, 14, size=len(weekly))).astype(int)
    
    # Stock level (warehouse inventory to evaluate stockout alerts)
    weekly['stock_level'] = (weekly['actual_demand'] * np.random.uniform(0.7, 1.4, size=len(weekly))).astype(int)
    
    # Rename columns to match existing MSME feature set
    weekly['category'] = weekly['Category']
    weekly['sub_category'] = weekly['Sub-Category']
    
    # Map categories to numerical codes
    categories = sorted(weekly['category'].unique().tolist())
    cat_map = {c: i for i, c in enumerate(categories)}
    weekly['category_code'] = weekly['category'].map(cat_map)
    
    # Final feature column order matching our existing model
    final_cols = [
        'category', 'sub_category', 'category_code', 'price',
        'month', 'week_of_year', 'is_festive_season', 'discount_percent',
        'past_4w_avg_sales', 'page_views', 'stock_level', 'actual_demand'
    ]
    
    out_df = weekly[final_cols]
    out_df.to_csv(PROCESSED_CSV, index=False)
    print(f"[SUCCESS] Kaggle dataset processed: {len(out_df)} weekly records saved to {PROCESSED_CSV}")
    print(f"Categories included: {categories}")
    print(out_df.head(3))

if __name__ == '__main__':
    preprocess()
