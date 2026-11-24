# KM 360 — Model Evaluation & Benchmarking Report

## 1. Evaluation Methodology

Every model in KM 360 follows strict, reproducible evaluation protocols:
1. **Splits:** 70% Training / 15% Holdout Validation / 15% Unseen Test Set (Stratified on classification targets, Seed: 42).
2. **K-Fold Cross-Validation:** 5-Fold Stratified Cross-Validation on the training fold to verify generalizability and guard against overfitting.
3. **Metrics:**
   * Multi-Class Classification: Accuracy, Macro Precision, Macro Recall, Macro F1-Score, and Confusion Matrix.
   * Regression: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Coefficient of Determination ($R^2$).

---

## 2. Algorithm Comparison & Champion Selection

### Model 1: Crop Recommendation (24 Classes, 2,400 Records)

| Algorithm | 5-Fold CV Accuracy | Val Accuracy | Val Macro F1 | Test Accuracy | Test Macro F1 | Champion Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Random Forest Classifier** | **0.9958 ± 0.0030** | **0.9972** | **0.9972** | **0.9944** | **0.9944** | **🏆 Champion** |
| XGBoost Classifier | 0.9869 ± 0.0067 | 0.9889 | 0.9889 | 0.9861 | 0.9859 | Candidate |
| Decision Tree Classifier | 0.9815 ± 0.0012 | 0.9833 | 0.9833 | 0.9806 | 0.9803 | Baseline |
| Gradient Boosting | 0.9726 ± 0.0089 | 0.9833 | 0.9833 | 0.9778 | 0.9780 | Candidate |

---

### Model 2: Soil Fertility Classification (4 Classes, 3,000 Records)

| Algorithm | 5-Fold CV Macro F1 | Val Accuracy | Val Macro F1 | Test Accuracy | Test Macro F1 | Champion Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gradient Boosting Classifier** | **0.9679 ± 0.009** | **0.9911** | **0.9893** | **0.9911** | **0.9893** | **🏆 Champion** |
| Random Forest Classifier | 0.9275 ± 0.012 | 0.9734 | 0.9512 | 0.9711 | 0.9491 | Candidate |
| Decision Tree Classifier | 0.9260 ± 0.015 | 0.9756 | 0.9478 | 0.9778 | 0.9489 | Baseline |

---

### Model 3: Crop Disease Vision Classifier (12 Classes, 3,000 Records)

| Algorithm | 5-Fold CV Macro F1 | Val Accuracy | Val Macro F1 | Test Accuracy | Test Macro F1 | Champion Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Random Forest Classifier** | **0.8833 ± 0.008** | **0.8625** | **0.8631** | **0.8578** | **0.8582** | **🏆 Champion** |
| Gradient Boosting Classifier | 0.8553 ± 0.011 | 0.8492 | 0.8504 | 0.8422 | 0.8434 | Candidate |
| Decision Tree Classifier | 0.7941 ± 0.016 | 0.8049 | 0.8037 | 0.8000 | 0.7998 | Baseline |

---

### Model 4: Harvest Yield Prediction Regressor (3,500 Records)

| Algorithm | 5-Fold CV $R^2$ | Val MAE (Q/acre) | Val $R^2$ | Test MAE (Q/acre) | Test RMSE (Q/acre) | Test $R^2$ | Champion Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gradient Boosting Regressor** | **0.9785 ± 0.003** | **0.942** | **0.9805** | **0.957** | **1.359** | **0.9799** | **🏆 Champion** |
| Random Forest Regressor | 0.9758 ± 0.004 | 1.015 | 0.9778 | 1.030 | 1.451 | 0.9771 | Candidate |
| Ridge Baseline Regressor | 0.9498 ± 0.006 | 1.540 | 0.9520 | 1.566 | 2.122 | 0.9510 | Baseline |

---

### Model 5: Smart Irrigation Decision Classifier (4 Classes, 3,000 Records)

| Algorithm | 5-Fold CV Macro F1 | Val Accuracy | Val Macro F1 | Test Accuracy | Test Macro F1 | Champion Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gradient Boosting Classifier** | **0.9465 ± 0.007** | **0.9978** | **0.9635** | **0.9978** | **0.9635** | **🏆 Champion** |
| Decision Tree Classifier | 0.9241 ± 0.014 | 0.9978 | 0.9635 | 0.9978 | 0.9635 | Candidate |
| Random Forest Classifier | 0.7683 ± 0.022 | 0.9889 | 0.8448 | 0.9889 | 0.8448 | Candidate |

---

## 3. Summary of Selected Champion Models

| Model Key | Architecture | Test Metric | Artifact Location |
| :--- | :--- | :--- | :--- |
| `crop_recommendation_v1.2.0` | Random Forest (120 trees) | **99.44% Test Macro F1** | `models/crop_recommendation/v1.2.0/` |
| `soil_fertilizer_v1.0.0` | Gradient Boosting Classifier | **98.93% Test Macro F1** | `models/soil_fertilizer/v1.0.0/` |
| `crop_disease_v1.0.0` | Random Forest Classifier | **85.82% Test Macro F1** | `models/crop_disease/v1.0.0/` |
| `crop_yield_v1.0.0` | Gradient Boosting Regressor | **$R^2 = 0.9799$, MAE: 0.957 Q/acre** | `models/crop_yield/v1.0.0/` |
| `smart_irrigation_v1.0.0` | Gradient Boosting Classifier | **96.35% Test Macro F1, 99.78% Acc** | `models/smart_irrigation/v1.0.0/` |
