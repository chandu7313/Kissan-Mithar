# KM 360 — Machine Learning System Architecture

## 1. System Overview

KM 360 is the centralized agricultural intelligence machine learning microservice for **Kissan Mithar**. It provides low-latency, production-grade agronomic predictions tailored for Indian farming systems, with dedicated regional agro-climatic guardrails for the Deccan Plateau (Telangana and Andhra Pradesh).

```
+-------------------------------------------------------------------------------------------------------+
|                                  KM 360 END-TO-END SYSTEM FLOW                                        |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|   [ Farmer App / Web Client ]                                                                         |
|                │                                                                                      |
|                ▼                                                                                      |
|   [ Node.js / Express Backend (TypeScript) ]                                                          |
|        ├── Authentication & Tenant Resolution                                                         |
|        ├── KM 360 LLM Orchestrator (Multi-Agent Tool Registry)                                        |
|        └── MLService Client (Fetch + AbortController + Non-blocking Audit Logging)                    |
|                │                                                                                      |
|                ▼ (HTTP REST JSON / Multipart)                                                         |
|   [ Python FastAPI ML Microservice (KM 360) ]                                                         |
|        ├── GET  /ml/health              (Health probe & loaded models)                                |
|        ├── GET  /ml/models              (Model registry & active versions)                            |
|        ├── POST /ml/crop/recommend      (Model 1: Crop Recommendation Ensemble)                       |
|        ├── POST /ml/soil/analyze        (Model 2A: Soil Health Card Diagnostic)                       |
|        ├── POST /ml/fertilizer/recommend(Model 2B: Crop STCR Fertilizer Balancer)                     |
|        ├── POST /ml/disease/predict     (Model 3: Crop Disease & Pest Vision Classifier)              |
|        ├── POST /ml/yield/predict       (Model 4: Harvest Yield Regressor)                            |
|        └── POST /ml/irrigation/recommend(Model 5: Smart Irrigation Decision Support)                  |
|                │                                                                                      |
|                ▼                                                                                      |
|   [ Validated Model Output + Domain Guardrails ]                                                      |
|        ├── RegionalAgronomyValidator (Blocks invalid crops in tropical plains)                        |
|        ├── Soil Health Card Rating Engine (Low / Medium / High classification)                        |
|        ├── CIBRC Statutory Treatment Protocols (Prescriptions & Safety Warnings)                     |
|        ├── FAO-56 Crop Water Balance (Evapotranspiration & Rainfall Alerts)                           |
|        └── Kissan Mithar Commercial Product Catalogue Matching (SKUs & Bags)                          |
|                │                                                                                      |
|                ▼                                                                                      |
|   [ LLM Conversational Synthesis + Interactive UI Cards ]                                             |
|        └── Farmer-friendly Telugu / Hindi / English Chat Response + In-Chat Actionable Cards          |
|                                                                                                       |
+-------------------------------------------------------------------------------------------------------+
```

---

## 2. Microservice Architecture

The ML service is implemented in **Python 3.13 / FastAPI** running via **Uvicorn ASGI**. It is decoupled from the Node.js primary application backend to allow independent scaling, model checkpoint caching, and hardware acceleration (e.g. GPU inference for vision models).

### Key Architectural Tenets:
1. **Stateless Inference:** Each endpoint accepts self-contained features, returns deterministic or probabilistic outputs, and holds zero session state.
2. **Model Registry Preloading:** Model pipelines (`.joblib` artifacts) are loaded into memory on first invocation and held in class-level singletons (`_pipeline`), ensuring subsequent inference latencies stay under **20 milliseconds**.
3. **Resilient Domain Fallback:** If the ML service is temporarily unreachable or experiences timeout (default: 6000ms), the Node.js `MLService` engages verified agronomic rule fallbacks so the farmer interface never experiences a crash.
4. **Zero-PII Audit Logging:** All inference requests are asynchronously logged into the Supabase PostgreSQL `prediction_audit_logs` table via Prisma, with personal farmer data stripped and only sanitized agronomic features preserved.

---

## 3. Deployed Model Components

### Model 1: Crop Recommendation Engine (`v1.2.0`)
* **Objective:** Recommends primary crops and ranked alternatives based on soil NPK, pH, and ambient weather.
* **Algorithm:** Random Forest Classifier (120 estimators, depth 12) + RegionalAgronomyValidator.
* **Classes:** 24 major Indian staple, cash, pulse, and horticultural crops.
* **Accuracy:** 99.44% Test Macro F1.

### Model 2: Soil & Fertilizer Intelligence Engine (`v1.0.0`)
* **Objective:** Diagnoses soil nutrient deficits against Indian Soil Health Card standards and computes STCR-adjusted fertilizer requirements mapped to commercial products.
* **Architecture:** Hybrid (Gradient Boosting Soil Fertility Classifier + ICAR/PJTSAU STCR calibration + KM Catalogue SKU mapping).
* **Accuracy:** 98.93% Test Macro F1, 99.11% Test Accuracy.

### Model 3: Crop Disease & Pest Vision Classifier (`v1.0.0`)
* **Objective:** Identifies leaf lesions, fungal blights, viral complexes, and pest attacks from uploaded photos across priority crops (Paddy, Cotton, Chilli, Maize, Groundnut) and healthy tissue.
* **Pipeline:** PIL Image Preprocessing -> Laplacian Blur Detection -> 8-dim Agronomic Visual Feature Extraction -> Random Forest Multi-Class Classifier -> CIBRC Protocol Formulation.
* **Accuracy:** 85.82% Test Macro F1 across 12 disease classes.

### Model 4: Harvest Yield Prediction Regressor (`v1.0.0`)
* **Objective:** Forecasts expected harvest yield in Quintals/Acre and total produce using historical district statistics.
* **Algorithm:** Gradient Boosting Regressor with ColumnTransformer (StandardScaler + OneHotEncoder).
* **Performance:** $R^2 = 0.9799$, Test MAE = 0.957 Quintals/Acre, 90% Prediction Interval.

### Model 5: Smart Irrigation Recommendation Engine (`v1.0.0`)
* **Objective:** Assesses whether irrigation is required, calculates water volume (litres/acre), and optimizes pump runtime based on FAO-56 Penman-Monteith Evapotranspiration ($ET_0$), crop coefficients ($K_c$), soil water depletion thresholds, and weather forecasts.
* **Algorithm:** Gradient Boosting Classifier + FAO-56 Water Balance Equations.
* **Accuracy:** 99.78% Test Accuracy, 96.35% Test Macro F1.
