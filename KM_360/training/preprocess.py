"""
Data Preprocessing, Augmentation & Stratified Splitting for Crop Recommendation.
Sources: ICAR, FAO, PJTSAU Package of Practices for Telangana & AP.
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

def prepare_extended_dataset():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_path = os.path.join(base_dir, "data", "raw", "Crop_recommendation.csv")
    processed_dir = os.path.join(base_dir, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)

    df_base = pd.read_csv(raw_path)
    print(f"Loaded base dataset: {df_base.shape[0]} rows across {df_base['label'].nunique()} crops.")

    # PJTSAU & ICAR empirical agronomic profiles for Telangana & AP staple crops: Chilli & Groundnut
    np.random.seed(42)
    n_samples = 100

    # 1. Chilli (Guntur/Khammam Teja / Byadgi / US-341 hybrid profile)
    chilli_data = {
        "N": np.clip(np.random.normal(loc=105.0, scale=12.0, size=n_samples), 80.0, 135.0),
        "P": np.clip(np.random.normal(loc=60.0, scale=7.5, size=n_samples), 42.0, 78.0),
        "K": np.clip(np.random.normal(loc=55.0, scale=6.8, size=n_samples), 38.0, 72.0),
        "temperature": np.clip(np.random.normal(loc=25.2, scale=3.1, size=n_samples), 19.5, 33.0),
        "humidity": np.clip(np.random.normal(loc=67.4, scale=5.2, size=n_samples), 52.0, 80.0),
        "ph": np.clip(np.random.normal(loc=6.52, scale=0.38, size=n_samples), 5.7, 7.5),
        "rainfall": np.clip(np.random.normal(loc=92.5, scale=16.0, size=n_samples), 55.0, 135.0),
        "label": ["chilli"] * n_samples
    }
    df_chilli = pd.DataFrame(chilli_data)

    # 2. Groundnut (K-6, Kadiri Lepakshi, Dharani profile - AP & South Telangana)
    groundnut_data = {
        "N": np.clip(np.random.normal(loc=22.5, scale=4.8, size=n_samples), 12.0, 35.0),
        "P": np.clip(np.random.normal(loc=50.2, scale=6.5, size=n_samples), 35.0, 68.0),
        "K": np.clip(np.random.normal(loc=48.0, scale=5.8, size=n_samples), 32.0, 65.0),
        "temperature": np.clip(np.random.normal(loc=27.1, scale=2.4, size=n_samples), 21.0, 33.5),
        "humidity": np.clip(np.random.normal(loc=58.6, scale=5.5, size=n_samples), 45.0, 72.0),
        "ph": np.clip(np.random.normal(loc=6.45, scale=0.42, size=n_samples), 5.4, 7.4),
        "rainfall": np.clip(np.random.normal(loc=76.8, scale=13.2, size=n_samples), 45.0, 115.0),
        "label": ["groundnut"] * n_samples
    }
    df_groundnut = pd.DataFrame(groundnut_data)

    # Combine datasets
    df_full = pd.concat([df_base, df_chilli, df_groundnut], ignore_index=True)
    df_full.drop_duplicates(inplace=True)
    
    # Save unified extended dataset
    full_path = os.path.join(processed_dir, "crop_recommendation_extended.csv")
    df_full.to_csv(full_path, index=False)
    print(f"Extended dataset saved: {df_full.shape[0]} rows, {df_full['label'].nunique()} classes.")

    # Compute EDA statistics
    feature_cols = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    eda_stats = {
        "total_samples": int(len(df_full)),
        "num_classes": int(df_full["label"].nunique()),
        "classes": sorted(df_full["label"].unique().tolist()),
        "features": feature_cols,
        "feature_summary": df_full[feature_cols].describe().to_dict(),
        "correlations": df_full[feature_cols].corr().to_dict(),
    }
    with open(os.path.join(processed_dir, "eda_summary.json"), "w") as f:
        json.dump(eda_stats, f, indent=2)

    # Leakage-Free Stratified Splitting: 70% Train, 15% Validation, 15% Test
    X = df_full[feature_cols]
    y = df_full["label"]

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=42
    )

    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=42
    )

    train_df = pd.concat([X_train, y_train], axis=1)
    val_df = pd.concat([X_val, y_val], axis=1)
    test_df = pd.concat([X_test, y_test], axis=1)

    train_df.to_csv(os.path.join(processed_dir, "train.csv"), index=False)
    val_df.to_csv(os.path.join(processed_dir, "val.csv"), index=False)
    test_df.to_csv(os.path.join(processed_dir, "test.csv"), index=False)

    print(f"Train set: {train_df.shape[0]} rows ({train_df.shape[0]/len(df_full):.1%})")
    print(f"Validation set: {val_df.shape[0]} rows ({val_df.shape[0]/len(df_full):.1%})")
    print(f"Test set: {test_df.shape[0]} rows ({test_df.shape[0]/len(df_full):.1%})")

if __name__ == "__main__":
    prepare_extended_dataset()
