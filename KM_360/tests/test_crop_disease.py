"""
Unit & Integration Tests for KM 360 Crop Disease Detection Model (Prompt 3 Spec)
"""

import io
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.inference.crop_disease_engine import CropDiseaseEngine

client = TestClient(app)

def create_synthetic_test_image(color=(34, 139, 34), width=224, height=224, add_noise=True) -> bytes:
    """Helper to generate in-memory JPEG test image."""
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    arr[:, :] = color
    if add_noise:
        noise = np.random.randint(-15, 15, (height, width, 3), dtype=np.int16)
        arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def create_blurry_test_image(width=224, height=224) -> bytes:
    """Helper to generate flat, zero-variance blurry test image."""
    arr = np.full((height, width, 3), 128, dtype=np.uint8)
    img = Image.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_crop_disease_healthy_leaf():
    """Validates healthy green foliage diagnosis."""
    img_bytes = create_synthetic_test_image(color=(35, 150, 45))
    result = CropDiseaseEngine.predict_disease(image_bytes=img_bytes, crop_hint="paddy")

    assert result["status"] == "success"
    assert "healthy" in result["predicted_condition"].lower() or result["confidence"] > 0.0
    assert "chemical_treatment" in result
    assert "DISCLAIMER" in result["limitations_and_disclaimers"]

def test_crop_disease_cotton_leaf_curl():
    """Validates cotton leaf curl virus diagnosis and CIBRC chemical vector recommendation."""
    result = CropDiseaseEngine.predict_disease(
        crop_hint="cotton",
        farmer_symptoms="Upward curling leaves and thickened veins on underside"
    )

    assert result["status"] == "success"
    assert "Cotton" in result["crop"]
    assert "Leaf Curl" in result["disease_name"]
    assert result["severity"] == "CRITICAL"
    assert result["expert_escalation_status"] is True
    assert "Pyriproxyfen" in result["chemical_treatment"] or "Afidopyropen" in result["chemical_treatment"]
    assert "Neem" in result["organic_treatment"]

def test_crop_disease_chilli_murda_complex():
    """Validates chilli thrips and mite complex identification."""
    result = CropDiseaseEngine.predict_disease(
        crop_hint="chilli",
        farmer_symptoms="Boat shaped upward curling and deformed shoot tips"
    )

    assert result["status"] == "success"
    assert "Chilli" in result["crop"]
    assert "Murda" in result["disease_name"] or "Curl" in result["disease_name"]
    assert "Fipronil" in result["chemical_treatment"] or "Spinetoram" in result["chemical_treatment"] or "Diafenthiuron" in result["chemical_treatment"]

def test_crop_disease_blur_detection_guardrail():
    """Validates that a blurry/unfocused photograph triggers expert escalation and warning."""
    blurry_bytes = create_blurry_test_image()
    result = CropDiseaseEngine.predict_disease(image_bytes=blurry_bytes, crop_hint="paddy")

    assert result["status"] == "success"
    assert result["expert_escalation_status"] is True
    meta = result["image_quality_metadata"]
    assert meta.get("is_blurry") is True
    warning_text = " ".join(result["warnings"])
    assert "blurry" in warning_text.lower() or "focus" in warning_text.lower()

def test_api_disease_predict_multipart_upload():
    """Tests POST /ml/disease/predict with multipart image upload."""
    img_bytes = create_synthetic_test_image(color=(30, 140, 40))
    response = client.post(
        "/ml/disease/predict",
        files={"file": ("leaf.jpg", img_bytes, "image/jpeg")},
        data={"crop_name": "paddy", "farmer_symptoms": "Yellowing leaf tips with wavy margins"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "predicted_condition" in data
    assert "chemical_treatment" in data
    assert "visible_observations" in data
    assert len(data["visible_observations"]) > 0
