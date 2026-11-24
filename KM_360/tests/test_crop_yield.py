"""
Unit & Integration Tests for KM 360 Crop Yield Prediction Model (Prompt 4 Spec)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.inference.crop_yield_engine import CropYieldEngine

client = TestClient(app)

def test_crop_yield_paddy_prediction():
    """Validates paddy yield estimation, production calculation, and 90% confidence interval."""
    result = CropYieldEngine.predict_yield(
        crop="paddy",
        land_acres=4.0,
        district="Warangal",
        irrigation_type="Borewell",
        soil_type="Black Cotton (Vertisol)",
        seasonal_rainfall_mm=850.0,
        temperature_c=26.5,
        fertilizer_applied_kg_per_acre=120.0,
        ph=7.2
    )

    assert result["status"] == "success"
    assert result["crop"] == "paddy"
    assert result["district"] == "Warangal"
    assert result["cultivated_land_acres"] == 4.0
    assert 18.0 <= result["estimated_yield_per_acre_quintals"] <= 35.0
    assert result["total_estimated_production_quintals"] == round(result["estimated_yield_per_acre_quintals"] * 4.0, 1)

    # Check prediction interval
    pr = result["prediction_range"]
    assert pr["min"] < result["estimated_yield_per_acre_quintals"] < pr["max"]
    assert "Quintals/Acre" in pr["unit"]

    # Factors and suggestions
    factors = result["important_contributing_factors"]
    assert len(factors) >= 4
    factor_names = [f["factor"] for f in factors]
    assert any("Irrigation" in f for f in factor_names)
    assert any("Rainfall" in f for f in factor_names)

def test_crop_yield_drip_irrigation_bonus():
    """Validates that drip irrigation yields higher than rainfed for cotton."""
    drip_res = CropYieldEngine.predict_yield(
        crop="cotton",
        land_acres=2.0,
        district="Guntur",
        irrigation_type="Drip",
        soil_type="Black Cotton (Vertisol)",
        seasonal_rainfall_mm=700.0
    )

    rainfed_res = CropYieldEngine.predict_yield(
        crop="cotton",
        land_acres=2.0,
        district="Guntur",
        irrigation_type="Rainfed",
        soil_type="Black Cotton (Vertisol)",
        seasonal_rainfall_mm=700.0
    )

    assert drip_res["estimated_yield_per_acre_quintals"] > rainfed_res["estimated_yield_per_acre_quintals"]
    assert len(drip_res["prediction_limitations"]) >= 2

def test_api_yield_predict_endpoint():
    """Tests POST /ml/yield/predict HTTP endpoint."""
    payload = {
        "crop": "Chilli",
        "land_acres": 2.5,
        "district": "Khammam",
        "irrigation_type": "Drip",
        "soil_type": "Black Cotton (Vertisol)",
        "seasonal_rainfall_mm": 750.0,
        "temperature_c": 28.0,
        "fertilizer_applied_kg_per_acre": 130.0,
        "ph": 6.8
    }
    response = client.post("/ml/yield/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["crop"] == "Chilli"
    assert data["estimated_yield_per_acre_quintals"] > 0
    assert data["total_estimated_production_quintals"] > 0
    assert "confidence_interval_90" in data
    assert len(data["optimization_suggestions"]) > 0
