"""
Unit & Integration Tests for KM 360 Smart Irrigation Recommendation Model (Prompt 5 Spec)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.inference.smart_irrigation_engine import SmartIrrigationEngine

client = TestClient(app)

def test_irrigation_needed_under_moisture_depletion():
    """Validates that low soil moisture triggers urgent irrigation requirement and water volume calculation."""
    result = SmartIrrigationEngine.recommend_irrigation(
        crop="cotton",
        growth_stage="Vegetative",
        soil_type="Black Cotton (Vertisol)",
        soil_moisture_pct=19.5,  # Below allowable depletion threshold ~26%
        temperature_c=32.0,
        humidity_pct=45.0,
        rainfall_past_48h_mm=0.0,
        forecast_rain_48h_mm=0.0,
        irrigation_method="Drip",
        land_acres=2.0
    )

    assert result["status"] == "success"
    assert result["irrigation_needed"] is True
    assert result["urgency"] in ["HIGH", "CRITICAL"]

    water = result["water_requirement"]
    assert water["litres_per_acre"] > 0
    assert water["total_litres_for_field"] == water["litres_per_acre"] * 2
    assert water["recommended_runtime_hours"] > 0
    assert "morning" in result["suggested_timing"].lower()

def test_irrigation_delayed_when_rain_imminent():
    """Validates that impending rain forecast (>= 20mm) delays irrigation to prevent waterlogging."""
    result = SmartIrrigationEngine.recommend_irrigation(
        crop="chilli",
        growth_stage="Flowering",
        soil_type="Black Cotton (Vertisol)",
        soil_moisture_pct=21.0,
        forecast_rain_48h_mm=28.0
    )

    assert result["status"] == "success"
    assert result["irrigation_needed"] is False
    assert result["urgency"] == "NONE"
    assert len(result["rainfall_warnings"]) > 0
    alert_text = " ".join(result["rainfall_warnings"])
    assert "28" in alert_text or "delay" in alert_text.lower() or "postpone" in alert_text.lower()

def test_optimal_moisture_no_watering_needed():
    """Validates that field capacity moisture requires no watering."""
    result = SmartIrrigationEngine.recommend_irrigation(
        crop="paddy",
        growth_stage="Vegetative",
        soil_type="Alluvial Loam",
        soil_moisture_pct=30.0,  # Above FC of 28%
        temperature_c=27.0
    )

    assert result["status"] == "success"
    assert result["irrigation_needed"] is False
    assert result["water_requirement"]["litres_per_acre"] == 0

def test_api_irrigation_recommend_endpoint():
    """Tests POST /ml/irrigation/recommend HTTP endpoint."""
    payload = {
        "crop": "Maize",
        "growth_stage": "Flowering",
        "soil_type": "Red Sandy Loam (Alfisol)",
        "soil_moisture_pct": 11.0,
        "temperature_c": 33.0,
        "humidity_pct": 50.0,
        "rainfall_past_48h_mm": 0.0,
        "forecast_rain_48h_mm": 0.0,
        "farm_location": "Karimnagar, Telangana",
        "irrigation_method": "Drip",
        "land_acres": 3.0
    }
    response = client.post("/ml/irrigation/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["crop"] == "Maize"
    assert data["irrigation_needed"] is True
    assert "water_requirement" in data
    assert data["water_requirement"]["total_litres_for_field"] > 0
    assert len(data["suggested_timing"]) > 0
