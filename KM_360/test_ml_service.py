"""
Comprehensive KM 360 Machine Learning Microservice Test Suite
Validates all 5 Production Agricultural Intelligence Models and Central FastAPI Inference Layer.
"""

import sys
import io
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.inference.crop_model import CropRecommendationModel
from app.inference.soil_fertilizer_engine import SoilFertilizerEngine
from app.inference.crop_disease_engine import CropDiseaseEngine
from app.inference.crop_yield_engine import CropYieldEngine
from app.inference.smart_irrigation_engine import SmartIrrigationEngine

# Backward compatibility modules
from app.inference.fertilizer_model import FertilizerRecommendationModel
from app.inference.disease_model import PlantDiseaseDetectionModel
from app.inference.yield_model import YieldPredictionModel
from app.inference.soil_model import SoilClassificationModel

client = TestClient(app)

def run_ml_tests():
    print("🌾 Starting KM 360 ML Models & Inference Service Test Suite...\n")
    passed = 0
    failed = 0

    def check(condition: bool, name: str, detail=""):
        nonlocal passed, failed
        if condition:
            print(f"✅ PASS: {name}")
            passed += 1
        else:
            print(f"❌ FAIL: {name} - {detail}")
            failed += 1

    # --- 1. Model 1: Crop Recommendation Engine ---
    print("--- 1. Testing Crop Recommendation Engine (Prompt 1) ---")
    rec_res1 = CropRecommendationModel.recommend(
        n=80, p=45, k=40, ph=6.5, temp=24, humidity=85, rain=220,
        soil_type="Alluvial Loam", location="Telangana", season="Kharif"
    )
    check(len(rec_res1["recommended_crops"]) > 0, "Crop Recommendation returns primary candidates")
    top_crop = rec_res1["recommended_crops"][0]["crop"]
    check("Rice" in top_crop or "Paddy" in top_crop, f"Recommends Rice under wetland conditions (Got {top_crop})")
    check(len(rec_res1["alternative_crops"]) > 0, "Provides ranked alternative crops")
    check(rec_res1["model_version"] == "v1.2.0", "Includes tracked model version v1.2.0")

    # Guardrail check: Temperate crop blocked in Telangana
    rec_res2 = CropRecommendationModel.recommend(
        n=20, p=15, k=30, ph=6.2, temp=15, humidity=60, rain=90,
        location="Warangal, Telangana"
    )
    crops_recommended = [c["crop"].lower() for c in rec_res2["recommended_crops"]]
    check("apple" not in crops_recommended, "Guardrail: Apple blocked in tropical Telangana plains")

    # --- 2. Model 2: Soil & Fertilizer Intelligence Engine ---
    print("\n--- 2. Testing Soil & Fertilizer Intelligence Engine (Prompt 2) ---")
    soil_res = SoilFertilizerEngine.analyze_soil(
        n=180.0, p=16.0, k=110.0, ph=7.2, ec=0.45, organic_carbon=0.35,
        soil_type="Black Cotton", location="Warangal, Telangana"
    )
    check(soil_res["status"] == "success", "Soil analysis executes successfully")
    check(soil_res["soil_summary"]["ratings"]["nitrogen"]["rating"] == "Low", "Correctly identifies Low Nitrogen rating")
    check(soil_res["soil_summary"]["ratings"]["phosphorus"]["rating"] == "Low", "Correctly identifies Low Phosphorus rating")
    check(len(soil_res["potential_deficiencies"]) >= 3, "Detects N, P, K, and OC potential deficiencies")

    fert_res = SoilFertilizerEngine.recommend_fertilizer(
        crop_name="Cotton", growth_stage="Vegetative", land_acres=3.0,
        measured_n=190.0, measured_p=16.0, measured_k=120.0, ph=7.5, soil_texture="Black Cotton"
    )
    check(fert_res["status"] == "success", "Fertilizer recommendation executes successfully")
    check(len(fert_res["nutrient_recommendations"]) == 3, "Formulates STCR adjusted NPK elemental doses")
    check(len(fert_res["schedule"]) == 3, "Formulates stage-wise schedule (Basal, Vegetative, Flowering)")
    check(len(fert_res["fertilizer_options"]) >= 3, "Matches certified KM catalogue SKUs (DAP, Urea, MOP)")

    # --- 3. Model 3: Crop Disease Diagnostic Vision Classifier ---
    print("\n--- 3. Testing Crop Disease Vision Classifier (Prompt 3) ---")
    # Synthetic leaf image
    arr = np.full((224, 224, 3), [34, 139, 34], dtype=np.uint8)
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG")
    leaf_bytes = buf.getvalue()

    disease_res = CropDiseaseEngine.predict_disease(
        image_bytes=leaf_bytes, crop_hint="cotton",
        farmer_symptoms="Upward curling leaves and enations on vein underside"
    )
    check(disease_res["status"] == "success", "Disease diagnosis executes successfully")
    check(bool(disease_res["disease_name"]), f"Predicts disease condition ({disease_res['disease_name']})")
    check(bool(disease_res["chemical_treatment"]), "Provides CIBRC-registered active chemical formulations")
    check(bool(disease_res["organic_treatment"]), "Provides organic bio-pesticide alternative")
    check("DISCLAIMER" in disease_res["limitations_and_disclaimers"], "Includes mandatory statutory disclaimer")

    # --- 4. Model 4: Crop Harvest Yield Prediction Regressor ---
    print("\n--- 4. Testing Harvest Yield Prediction Regressor (Prompt 4) ---")
    yield_res = CropYieldEngine.predict_yield(
        crop="paddy", land_acres=4.0, district="Warangal",
        irrigation_type="Borewell", soil_type="Black Cotton (Vertisol)",
        seasonal_rainfall_mm=820.0, temperature_c=27.0, fertilizer_applied_kg_per_acre=120.0
    )
    check(yield_res["status"] == "success", "Yield prediction executes successfully")
    check(yield_res["estimated_yield_per_acre_quintals"] > 18.0, "Accurately predicts paddy yield per acre")
    check(yield_res["total_estimated_production_quintals"] == round(yield_res["estimated_yield_per_acre_quintals"] * 4.0, 1), "Calculates total harvest production")
    check("Quintals/Acre" in yield_res["confidence_interval_90"], "Provides 90% confidence interval range")
    check(len(yield_res["important_contributing_factors"]) >= 4, "Ranks important contributing factors")

    # --- 5. Model 5: Smart Irrigation Recommendation Model ---
    print("\n--- 5. Testing Smart Irrigation Recommendation Model (Prompt 5) ---")
    irri_res1 = SmartIrrigationEngine.recommend_irrigation(
        crop="cotton", growth_stage="Vegetative", soil_type="Black Cotton (Vertisol)",
        soil_moisture_pct=19.0, temperature_c=32.0, irrigation_method="Drip", land_acres=2.5
    )
    check(irri_res1["status"] == "success", "Irrigation recommendation executes successfully")
    check(irri_res1["irrigation_needed"] is True, "Flags irrigation needed under soil moisture depletion")
    check(irri_res1["water_requirement"]["total_litres_for_field"] > 0, "Calculates exact water volume in litres")

    # Rain imminent guardrail
    irri_res2 = SmartIrrigationEngine.recommend_irrigation(
        crop="chilli", growth_stage="Flowering", soil_type="Black Cotton (Vertisol)",
        soil_moisture_pct=21.0, forecast_rain_48h_mm=30.0
    )
    check(irri_res2["irrigation_needed"] is False, "Delays irrigation when 30mm rain is forecast")
    check(len(irri_res2["rainfall_warnings"]) > 0, "Outputs rainfall delay alert")

    # --- 6. Central FastAPI Inference Endpoints ---
    print("\n--- 6. Testing Central FastAPI ML Inference Endpoints ---")
    # GET /ml/health
    r_health = client.get("/ml/health")
    check(r_health.status_code == 200, "GET /ml/health probe status 200")
    check(len(r_health.json()["models_loaded"]) == 5, "GET /ml/health reports all 5 models loaded")

    # GET /ml/models
    r_models = client.get("/ml/models")
    check(r_models.status_code == 200, "GET /ml/models catalog status 200")
    check(r_models.json()["active_models_count"] == 5, "GET /ml/models reports 5 active models")

    # POST /ml/crop/recommend
    r_crop = client.post("/ml/crop/recommend", json={
        "N": 90, "P": 42, "K": 43, "ph": 6.5, "temperature": 26.5, "humidity": 82, "rainfall": 202.9,
        "soil_type": "Black Cotton", "location": "Telangana", "season": "Kharif"
    })
    check(r_crop.status_code == 200, "POST /ml/crop/recommend status 200")

    # POST /ml/soil/analyze
    r_soil = client.post("/ml/soil/analyze", json={
        "N": 210, "P": 18, "K": 160, "ph": 7.4, "ec": 0.45, "organic_carbon": 0.50
    })
    check(r_soil.status_code == 200, "POST /ml/soil/analyze status 200")

    # POST /ml/fertilizer/recommend
    r_fert = client.post("/ml/fertilizer/recommend", json={
        "crop_name": "Cotton", "land_acres": 2.0, "measured_n": 200, "measured_p": 18, "measured_k": 150
    })
    check(r_fert.status_code == 200, "POST /ml/fertilizer/recommend status 200")

    # POST /ml/disease/predict
    r_dis = client.post(
        "/ml/disease/predict",
        files={"file": ("leaf.jpg", leaf_bytes, "image/jpeg")},
        data={"crop_name": "cotton", "farmer_symptoms": "Leaf curl"}
    )
    check(r_dis.status_code == 200, "POST /ml/disease/predict multipart status 200")

    # POST /ml/yield/predict
    r_yield = client.post("/ml/yield/predict", json={
        "crop": "Paddy", "land_acres": 3.0, "district": "Warangal", "irrigation_type": "Canal"
    })
    check(r_yield.status_code == 200, "POST /ml/yield/predict status 200")

    # POST /ml/irrigation/recommend
    r_irri = client.post("/ml/irrigation/recommend", json={
        "crop": "Cotton", "soil_moisture_pct": 18.5, "temperature_c": 31.0, "land_acres": 2.0
    })
    check(r_irri.status_code == 200, "POST /ml/irrigation/recommend status 200")

    # --- 7. Backward Compatibility Endpoints ---
    print("\n--- 7. Testing Legacy Backward Compatibility Endpoints ---")
    legacy_crop = CropRecommendationModel.predict(n=80, p=45, k=40, temp=24, humidity=85, ph=6.5, rain=220)
    check(legacy_crop["recommended_crop"] == "Rice", "Legacy CropRecommendationModel.predict works")

    legacy_fert = FertilizerRecommendationModel.evaluate("Cotton", "Black Cotton", 4.0, 30.0, 12.0, 20.0)
    check(len(legacy_fert["schedule"]) == 3, "Legacy FertilizerRecommendationModel.evaluate works")

    legacy_soil = SoilClassificationModel.classify(ph=7.5, organic_carbon_percent=0.6)
    check("Black Cotton" in legacy_soil["soil_type"], "Legacy SoilClassificationModel.classify works")

    print("\n=======================================================")
    print(f"📊 Overall KM 360 ML Suite: Total {passed + failed} | Passed {passed} | Failed {failed}")
    print("=======================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_ml_tests()
