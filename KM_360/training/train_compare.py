"""
Model Training, Multi-Algorithm Benchmark & Artefact Persistence.
Algorithms compared: Random Forest, Decision Tree, XGBoost, Gradient Boosting.
Metrics: Accuracy, Balanced Accuracy, Precision, Recall, F1 (Macro/Weighted), per-class report, Confusion Matrix.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score,
    precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)

def run_training_and_comparison():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data", "processed")
    models_dir = os.path.join(base_dir, "models", "crop_recommendation", "v1.2.0")
    os.makedirs(models_dir, exist_ok=True)

    train_df = pd.read_csv(os.path.join(data_dir, "train.csv"))
    val_df = pd.read_csv(os.path.join(data_dir, "val.csv"))
    test_df = pd.read_csv(os.path.join(data_dir, "test.csv"))

    feature_cols = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    
    X_train = train_df[feature_cols].values
    y_train_raw = train_df["label"].values
    
    X_val = val_df[feature_cols].values
    y_val_raw = val_df["label"].values
    
    X_test = test_df[feature_cols].values
    y_test_raw = test_df["label"].values

    # Encode crop labels
    label_encoder = LabelEncoder()
    y_train = label_encoder.fit_transform(y_train_raw)
    y_val = label_encoder.transform(y_val_raw)
    y_test = label_encoder.transform(y_test_raw)

    classes = label_encoder.classes_.tolist()
    print(f"Total crop classes: {len(classes)} -> {classes}")

    # Define candidates
    algorithms = {
        "Decision_Tree": DecisionTreeClassifier(max_depth=12, min_samples_split=4, random_state=42),
        "Random_Forest": RandomForestClassifier(n_estimators=120, max_depth=12, random_state=42, n_jobs=-1),
        "Gradient_Boosting": GradientBoostingClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42),
        "XGBoost": XGBClassifier(
            n_estimators=120, max_depth=6, learning_rate=0.1,
            eval_metric="mlogloss", random_state=42, n_jobs=-1
        )
    }

    results = {}
    fitted_models = {}

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n--- Running 5-Fold Stratified Cross-Validation on Training Data ---")
    for name, clf in algorithms.items():
        print(f"\nTraining & Cross-Validating: {name}...")
        
        # Cross validation scores
        cv_res = cross_validate(
            clf, X_train, y_train, cv=cv,
            scoring=["accuracy", "f1_macro", "f1_weighted"],
            n_jobs=-1
        )
        
        cv_acc_mean = float(np.mean(cv_res["test_accuracy"]))
        cv_acc_std = float(np.std(cv_res["test_accuracy"]))
        cv_f1_macro_mean = float(np.mean(cv_res["test_f1_macro"]))
        cv_f1_weighted_mean = float(np.mean(cv_res["test_f1_weighted"]))

        # Fit on entire training set
        clf.fit(X_train, y_train)
        fitted_models[name] = clf

        # Evaluate on Validation Set
        val_preds = clf.predict(X_val)
        val_acc = float(accuracy_score(y_val, val_preds))
        val_balanced_acc = float(balanced_accuracy_score(y_val, val_preds))
        val_prec_macro = float(precision_score(y_val, val_preds, average="macro", zero_division=0))
        val_rec_macro = float(recall_score(y_val, val_preds, average="macro", zero_division=0))
        val_f1_macro = float(f1_score(y_val, val_preds, average="macro", zero_division=0))
        val_f1_weighted = float(f1_score(y_val, val_preds, average="weighted", zero_division=0))

        # Evaluate on Unseen Test Set
        test_preds = clf.predict(X_test)
        test_acc = float(accuracy_score(y_test, test_preds))
        test_balanced_acc = float(balanced_accuracy_score(y_test, test_preds))
        test_prec_macro = float(precision_score(y_test, test_preds, average="macro", zero_division=0))
        test_rec_macro = float(recall_score(y_test, test_preds, average="macro", zero_division=0))
        test_f1_macro = float(f1_score(y_test, test_preds, average="macro", zero_division=0))
        test_f1_weighted = float(f1_score(y_test, test_preds, average="weighted", zero_division=0))

        results[name] = {
            "cv_accuracy_mean": round(cv_acc_mean, 4),
            "cv_accuracy_std": round(cv_acc_std, 4),
            "cv_f1_macro": round(cv_f1_macro_mean, 4),
            "cv_f1_weighted": round(cv_f1_weighted_mean, 4),
            "val_accuracy": round(val_acc, 4),
            "val_balanced_accuracy": round(val_balanced_acc, 4),
            "val_precision_macro": round(val_prec_macro, 4),
            "val_recall_macro": round(val_rec_macro, 4),
            "val_f1_macro": round(val_f1_macro, 4),
            "val_f1_weighted": round(val_f1_weighted, 4),
            "test_accuracy": round(test_acc, 4),
            "test_balanced_accuracy": round(test_balanced_acc, 4),
            "test_precision_macro": round(test_prec_macro, 4),
            "test_recall_macro": round(test_rec_macro, 4),
            "test_f1_macro": round(test_f1_macro, 4),
            "test_f1_weighted": round(test_f1_weighted, 4),
        }
        print(f"  {name} Results:")
        print(f"    CV Accuracy: {cv_acc_mean:.4f} ± {cv_acc_std:.4f}")
        print(f"    Val Accuracy: {val_acc:.4f} | Val F1 (Macro): {val_f1_macro:.4f}")
        print(f"    Test Accuracy: {test_acc:.4f} | Test F1 (Macro): {test_f1_macro:.4f}")

    # Select champion model based on Validation F1 Macro
    champion_name = max(results.keys(), key=lambda k: results[k]["val_f1_macro"])
    champion_model = fitted_models[champion_name]
    print(f"\n🏆 Champion Model Selected: {champion_name} (Val F1: {results[champion_name]['val_f1_macro']})")

    # In-depth test evaluation for champion model
    champion_test_preds = champion_model.predict(X_test)
    champion_test_probs = champion_model.predict_proba(X_test)

    clf_report = classification_report(
        y_test, champion_test_preds, target_names=classes, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_test, champion_test_preds).tolist()

    # Feature Importance
    feature_importances = {}
    if hasattr(champion_model, "feature_importances_"):
        raw_imp = champion_model.feature_importances_
        feature_importances = {
            f: round(float(imp), 4) for f, imp in zip(feature_cols, raw_imp)
        }
    print(f"Feature Importances: {feature_importances}")

    # Build production pipeline container
    pipeline_artefact = {
        "model_version": "v1.2.0",
        "model_key": "crop_recommendation_xgboost" if "XGB" in champion_name else f"crop_recommendation_{champion_name.lower()}",
        "algorithm": champion_name,
        "feature_names": feature_cols,
        "classes": classes,
        "model": champion_model,
        "label_encoder": label_encoder,
        "feature_importances": feature_importances,
    }

    # Save Pipeline Artefacts
    model_path = os.path.join(models_dir, "crop_recommendation_pipeline.joblib")
    joblib.dump(pipeline_artefact, model_path)
    print(f"Saved complete pipeline artefact to: {model_path}")

    # Save Evaluation Report
    eval_report = {
        "model_version": "v1.2.0",
        "champion_algorithm": champion_name,
        "algorithm_comparison": results,
        "champion_test_metrics": {
            "test_accuracy": results[champion_name]["test_accuracy"],
            "test_balanced_accuracy": results[champion_name]["test_balanced_accuracy"],
            "test_f1_macro": results[champion_name]["test_f1_macro"],
            "test_f1_weighted": results[champion_name]["test_f1_weighted"],
            "test_precision_macro": results[champion_name]["test_precision_macro"],
            "test_recall_macro": results[champion_name]["test_recall_macro"],
        },
        "per_class_report": clf_report,
        "confusion_matrix": cm,
        "classes": classes,
        "feature_importances": feature_importances
    }

    eval_path = os.path.join(models_dir, "evaluation_report.json")
    with open(eval_path, "w") as f:
        json.dump(eval_report, f, indent=2)
    print(f"Saved evaluation report to: {eval_path}")

    # Update Registry
    registry_path = os.path.join(base_dir, "models", "crop_recommendation", "registry.json")
    registry_data = {
        "active_version": "v1.2.0",
        "versions": {
            "v1.2.0": {
                "model_key": pipeline_artefact["model_key"],
                "algorithm": champion_name,
                "framework": "XGBoost" if "XGB" in champion_name else "Scikit-Learn",
                "accuracy": results[champion_name]["test_accuracy"],
                "f1_macro": results[champion_name]["test_f1_macro"],
                "features": feature_cols,
                "classes_count": len(classes),
                "artifact_path": model_path,
                "evaluation_path": eval_path,
                "is_active": True
            }
        }
    }
    with open(registry_path, "w") as f:
        json.dump(registry_data, f, indent=2)
    print(f"Updated model registry at: {registry_path}")

if __name__ == "__main__":
    run_training_and_comparison()
