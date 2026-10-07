import pandas as pd
import numpy as np
import os

# Set seed for reproducibility
np.random.seed(42)

def generate_msme_dataset(filename="msme_sales_data.csv"):
    num_samples = 1200
    
    categories = ['Textiles', 'Handicrafts', 'Food Processing', 'Leather Goods', 'Wooden Furniture', 'Electronics']
    cat_base_demand = {'Textiles': 120, 'Handicrafts': 75, 'Food Processing': 200, 'Leather Goods': 60, 'Wooden Furniture': 40, 'Electronics': 150}
    
    data = []
    
    for i in range(num_samples):
        cat = np.random.choice(categories)
        base = cat_base_demand[cat]
        
        # Features
        price = round(np.random.uniform(200, 5000), 2)
        month = np.random.randint(1, 13)
        week_of_year = np.random.randint(1, 53)
        is_festive_season = 1 if month in [9, 10, 11, 12] else 0
        discount_percent = np.random.choice([0, 5, 10, 15, 20, 25])
        past_4w_avg_sales = max(10, int(np.random.normal(base, base * 0.25)))
        page_views = past_4w_avg_sales * np.random.randint(5, 15)
        stock_level = max(5, int(np.random.normal(base * 1.2, base * 0.3)))
        
        # Calculate target demand using realistic formula with noise
        season_multiplier = 1.35 if is_festive_season else 1.0
        price_factor = 1.0 - (price / 20000.0) # slightly lower demand for higher price
        discount_factor = 1.0 + (discount_percent / 100.0 * 0.5)
        
        # Noise
        noise = np.random.normal(1.0, 0.08)
        
        actual_demand = max(5, int(past_4w_avg_sales * season_multiplier * price_factor * discount_factor * noise))
        
        data.append({
            'category': cat,
            'price': price,
            'month': month,
            'week_of_year': week_of_year,
            'is_festive_season': is_festive_season,
            'discount_percent': discount_percent,
            'past_4w_avg_sales': past_4w_avg_sales,
            'page_views': page_views,
            'stock_level': stock_level,
            'actual_demand': actual_demand
        })
        
    df = pd.DataFrame(data)
    filepath = os.path.join(os.path.dirname(__file__), filename)
    df.to_csv(filepath, index=False)
    print(f"Generated {num_samples} MSME sales records at {filepath}")

if __name__ == '__main__':
    generate_msme_dataset()
