# KM 360 — Agricultural Intelligence Machine Learning Microservice

KM 360 is the dedicated machine learning microservice for Kissan Mithar, delivering low-latency, production-grade agronomic predictions for farmers across India, with dedicated regional agro-climatic guardrails for Telangana and Andhra Pradesh.

## Deployed Intelligence Models
1. **Model 1: Crop Recommendation Engine (`v1.2.0`):**
   * Multi-class Random Forest / XGBoost ensemble trained across 24 authentic crop classes (99.44% Test Macro F1).
   * Regional and seasonal validation guardrails (`RegionalAgronomyValidator`).
   * REST Endpoint: `POST /ml/crop/recommend`.
2. **Model 2: Fertilizer Deficit & Balancing Engine:**
   * NPK elemental deficit analysis and stage-wise commercial dosage formulation.
3. **Model 3: Crop Disease & Pest Vision Classifier:**
   * CNN vision model for leaf lesion diagnosis and CIBRC treatment recommendations.
4. **Model 4: Harvest Yield Prediction Engine:**
   * Quintals/acre harvest volume forecasting.
5. **Model 5: Soil Classification Engine:**
   * Edaphic classification and water retention analysis.

## Running the Service Locally
```bash
# Activate virtual environment
source .venv/bin/activate

# Run microservice via Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Running Automated Tests
```bash
# Run KM 360 Microservice suite
python test_ml_service.py

# Run PyTest unit & API integration test suite
python -m pytest tests/test_crop_recommendation.py -v
```
