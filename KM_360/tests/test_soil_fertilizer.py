"""
Unit & Integration Tests for KM 360 Soil & Fertilizer Intelligence Model (Prompt 2 Spec)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.inference.soil_fertilizer_engine import SoilFertilizerEngine

client = TestClient(app)

def test_soil_analysis_low_nutrient_profile():
    """Validates that low NPK values correctly trigger Low ratings and deficiency advisories."""
    result = SoilFertilizerEngine.analyze_soil(
        n=180.0,
        p=14.0,
        k=110.0,
        ph=6.8,
        ec=0.4,
        organic_carbon=0.35,
        soil_type="Red Sandy Loam"
    )

    assert result["status"] == "success"
    ratings = result["soil_summary"]["ratings"]
    assert ratings["nitrogen"]["rating"] == "Low"
    assert ratings["phosphorus"]["rating"] == "Low"
    assert ratings["potassium"]["rating"] == "Low"
    assert ratings["organic_carbon"]["rating"] == "Low"

    # Deficiencies should report Nitrogen, Phosphorus, Potassium and Organic Carbon
    deficiencies = result["potential_deficiencies"]
    nutrient_names = [d["nutrient"] for d in deficiencies]
    assert any("Nitrogen" in n for n in nutrient_names)
    assert any("Phosphorus" in n for n in nutrient_names)
    assert any("Potassium" in n for n in nutrient_names)

def test_soil_analysis_acidic_hazard():
    """Validates that strong acidity (pH < 5.5) triggers Lime advisory and expert review."""
    result = SoilFertilizerEngine.analyze_soil(
        n=220.0,
        p=25.0,
        k=200.0,
        ph=4.9,
        ec=0.3,
        organic_carbon=0.55
    )

    assert result["expert_review_required"] is True
    assert result["soil_summary"]["soil_reaction_class"] == "Strongly Acidic"
    warning_text = " ".join(result["warnings"])
    assert "Lime" in warning_text or "Dolomite" in warning_text

def test_soil_analysis_sodic_and_saline_hazards():
    """Validates that sodic (pH > 8.5) and saline (EC >= 2.0) hazards are flagged with Gypsum and drainage warnings."""
    result = SoilFertilizerEngine.analyze_soil(
        n=260.0,
        p=22.0,
        k=310.0,
        ph=8.8,
        ec=2.4,
        organic_carbon=0.45
    )

    assert result["expert_review_required"] is True
    assert "Sodic" in result["soil_summary"]["soil_reaction_class"]
    warning_text = " ".join(result["warnings"])
    assert "gypsum" in warning_text.lower()
    assert "salinity" in warning_text.lower()

def test_fertilizer_stcr_adjustment_and_product_matching():
    """Validates STCR adjustments, bag counts, and KM product catalogue mapping for Cotton."""
    result = SoilFertilizerEngine.recommend_fertilizer(
        crop_name="cotton",
        growth_stage="Vegetative",
        land_acres=2.5,
        measured_n=190.0,  # Low -> +25% STCR boost
        measured_p=16.0,   # Low -> +25% STCR boost
        measured_k=120.0,  # Low -> +25% STCR boost
        ph=7.5,
        ec=0.5,
        organic_carbon=0.52,
        soil_texture="Black Cotton"
    )

    assert result["status"] == "success"
    nutrients = result["nutrient_recommendations"]
    assert len(nutrients) == 3
    # Cotton base GRD is 60 N, 24 P, 24 K -> with 1.25x: 75.0 N, 30.0 P, 30.0 K
    n_rec = next(item for item in nutrients if "Nitrogen" in item["nutrient"])
    assert n_rec["stcr_adjusted_dose_per_acre_kg"] == 75.0
    assert n_rec["total_field_requirement_kg"] == 75.0 * 2.5

    # Check commercial products matched
    options = result["fertilizer_options"]
    skus = [p["sku"] for p in options]
    assert "KM-FERT-DAP-50KG" in skus
    assert "KM-FERT-UREA-45KG" in skus
    assert "KM-FERT-MOP-50KG" in skus

    # Schedule should contain Basal, Active Vegetative, and Flowering stages
    schedule = result["schedule"]
    assert len(schedule) == 3
    assert "Basal" in schedule[0]["stage"]
    assert "Vegetative" in schedule[1]["stage"]
    assert "Flowering" in schedule[2]["stage"]

def test_api_soil_analyze_endpoint():
    """Tests POST /ml/soil/analyze HTTP endpoint."""
    payload = {
        "N": 240.0,
        "P": 22.0,
        "K": 180.0,
        "ph": 7.2,
        "ec": 0.45,
        "organic_carbon": 0.55,
        "soil_type": "Black Cotton",
        "location": "Warangal, Telangana"
    }
    response = client.post("/ml/soil/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "soil_summary" in data
    assert "ratings" in data["soil_summary"]
    assert data["soil_summary"]["location"] == "Warangal, Telangana"

def test_api_fertilizer_recommend_endpoint():
    """Tests POST /ml/fertilizer/recommend HTTP endpoint."""
    payload = {
        "crop_name": "Paddy",
        "crop_growth_stage": "Basal",
        "land_acres": 4.0,
        "measured_n": 220.0,
        "measured_p": 18.0,
        "measured_k": 160.0,
        "ph": 6.8,
        "soil_texture": "Alluvial Clay Loam"
    }
    response = client.post("/ml/fertilizer/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["fertilizer_options"]) >= 3
    assert len(data["schedule"]) == 3
    assert data["expert_review_required"] is False
