"""
Comprehensive Automated Tests for KM 360 Crop Recommendation Model & FastAPI Endpoints.
Covers:
1. Model Unit Tests (Agronomic validity, regional guardrails, edge cases, warnings).
2. FastAPI Integration Tests (POST /ml/crop/recommend, POST /api/v1/ml/crop-recommendation).
3. Pydantic schema validation & error handling.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.inference.crop_model import CropRecommendationModel
from app.inference.regional_agronomy import RegionalAgronomyValidator

client = TestClient(app)

# ============================================================================
# 1. MODEL UNIT TESTS
# ============================================================================

def test_wetland_paddy_recommendation():
    """Validates that high rain and humidity in alluvial/wetland conditions recommends Rice/Paddy."""
    result = CropRecommendationModel.recommend(
        n=80, p=45, k=40, ph=6.5, temp=24.0, humidity=85.0, rain=220.0,
        soil_type="Alluvial Clay", location="Nalgonda", season="Kharif"
    )
    assert len(result["recommended_crops"]) > 0
    top_crop = result["recommended_crops"][0]
    assert "Rice" in top_crop["crop"]
    assert top_crop["confidence"] >= 0.85
    assert result["model_version"] == "v1.2.0"
    assert "Paddy" in top_crop["description"] or "wetland" in top_crop["description"]

def test_black_cotton_soil_recommendation():
    """Validates that high Nitrogen in Black Cotton soil recommends Cotton with Chilli/Maize alternatives."""
    result = CropRecommendationModel.recommend(
        n=120, p=50, k=20, ph=7.2, temp=26.0, humidity=65.0, rain=85.0,
        soil_type="Black Cotton", location="Warangal", season="Kharif"
    )
    assert len(result["recommended_crops"]) > 0
    top_crop = result["recommended_crops"][0]
    assert "Cotton" in top_crop["crop"]
    assert result["confidence"] >= 0.80
    
    # Alternatives should contain viable candidates like Maize and Chilli
    alt_names = [a["crop"] for a in result["alternative_crops"]]
    assert any("Maize" in a or "Chilli" in a for a in alt_names)

def test_red_soil_groundnut_recommendation():
    """Validates low N, high P/K legume conditions recommend Groundnut in red soils."""
    result = CropRecommendationModel.recommend(
        n=22, p=50, k=48, ph=6.4, temp=27.0, humidity=58.0, rain=75.0,
        soil_type="Red Sandy Loam", location="Mahabubnagar", season="Kharif"
    )
    assert len(result["recommended_crops"]) > 0
    top_crop = result["recommended_crops"][0]
    assert "Groundnut" in top_crop["crop"]
    assert "Gypsum" in top_crop["agronomic_advisory"] or "oilseed" in top_crop["description"].lower()

def test_temperate_crop_guardrail_in_tropical_zone():
    """Verifies that temperate crops (Apple) are blocked in tropical Telangana/AP plains."""
    # Under low temp (15C) and specific inputs that might trigger Apple in a naive model:
    result = CropRecommendationModel.recommend(
        n=20, p=130, k=195, ph=6.0, temp=22.0, humidity=90.0, rain=110.0,
        location="Warangal, Telangana", season="Rabi"
    )
    rec_names = [c["crop"] for c in result["recommended_crops"]]
    assert not any("Apple" in c for c in rec_names), "Apple must not be recommended in Telangana plains"
    assert any("not commercially viable in tropical plains" in w or "chilling hours" in w for w in result["warnings"])

def test_soil_ph_acidic_and_alkaline_warnings():
    """Verifies that extreme pH conditions emit corrective reclamation advisory warnings."""
    # Acidic soil test
    res_acidic = CropRecommendationModel.recommend(
        n=70, p=40, k=40, ph=4.8, temp=25.0, humidity=70.0, rain=150.0
    )
    assert any("acidic" in w.lower() for w in res_acidic["warnings"])
    assert any("lime" in w.lower() for w in res_acidic["warnings"])

    # Alkaline soil test
    res_alkaline = CropRecommendationModel.recommend(
        n=70, p=40, k=40, ph=8.6, temp=25.0, humidity=70.0, rain=150.0
    )
    assert any("alkaline" in w.lower() for w in res_alkaline["warnings"])
    assert any("gypsum" in w.lower() for w in res_alkaline["warnings"])

def test_low_rainfall_warning_for_wetland_crops():
    """Verifies that recommending Rice with sub-optimal rainfall triggers irrigation warning."""
    result = CropRecommendationModel.recommend(
        n=80, p=45, k=40, ph=6.5, temp=24.0, humidity=85.0, rain=195.0,
        soil_type="Alluvial Clay"
    )
    assert any("wetland irrigation is necessary" in w or "high water demand" in w for w in result["warnings"])

def test_backward_compatible_predict_method():
    """Verifies the legacy predict() method returns expected keys and values."""
    res = CropRecommendationModel.predict(n=80, p=45, k=40, temp=24, humidity=85, ph=6.5, rain=220)
    assert res["recommended_crop"] == "Rice"
    assert res["confidence"] is not None
    assert len(res["top_candidates"]) == 3
    assert res["model_version"] == "v1.2.0"

# ============================================================================
# 2. FASTAPI ENDPOINT INTEGRATION TESTS
# ============================================================================

def test_api_crop_recommend_success():
    """Tests POST /ml/crop/recommend endpoint with full payload."""
    payload = {
        "N": 90.0,
        "P": 42.0,
        "K": 43.0,
        "ph": 6.5,
        "temperature": 26.5,
        "humidity": 82.0,
        "rainfall": 202.9,
        "soil_type": "Alluvial",
        "location": "Suryapet, Telangana",
        "season": "Kharif"
    }
    response = client.post("/ml/crop/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "recommended_crops" in data
    assert len(data["recommended_crops"]) > 0
    assert "alternative_crops" in data
    assert data["model_version"] == "v1.2.0"
    assert isinstance(data["confidence"], float)
    assert isinstance(data["warnings"], list)
    assert data["relevant_input_conditions"]["soil_type"] == "Alluvial"

def test_api_versioned_endpoint_alias():
    """Tests that POST /api/v1/ml/crop/recommend also functions as alias."""
    payload = {
        "N": 120.0,
        "P": 50.0,
        "K": 20.0,
        "ph": 7.2,
        "temperature": 26.0,
        "humidity": 65.0,
        "rainfall": 85.0,
        "soil_type": "Black Cotton",
        "location": "Adilabad",
        "season": "Kharif"
    }
    response = client.post("/api/v1/ml/crop/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Cotton" in data["recommended_crops"][0]["crop"]

def test_api_legacy_endpoint():
    """Tests POST /api/v1/ml/crop-recommendation for backward compatibility."""
    payload = {
        "N": 80.0,
        "P": 45.0,
        "K": 40.0,
        "temperature": 24.0,
        "humidity": 85.0,
        "ph": 6.5,
        "rainfall": 220.0
    }
    response = client.post("/api/v1/ml/crop-recommendation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_crop"] == "Rice"
    assert len(data["top_candidates"]) == 3

def test_api_validation_error_on_missing_fields():
    """Tests that missing required field returns 422 Unprocessable Entity."""
    incomplete_payload = {
        "P": 42.0,
        "K": 43.0,
        "temperature": 26.5
    }
    response = client.post("/ml/crop/recommend", json=incomplete_payload)
    assert response.status_code == 422
    assert "detail" in response.json()
