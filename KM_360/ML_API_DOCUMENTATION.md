# KM 360 — Machine Learning REST API Documentation

Base URLs:
* Primary ML Prefix: `http://localhost:8000/ml`
* Versioned Prefix: `http://localhost:8000/api/v1/ml`

---

## 1. System Endpoints

### GET `/ml/health`
Checks health status of all 5 models and ASGI microservice runtime.
* **Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "KM 360",
  "version": "1.2.0",
  "models_loaded": [
    "crop_recommendation_ensemble_v1.2.0",
    "soil_fertilizer_intelligence_v1.0.0",
    "crop_disease_vision_v1.0.0",
    "crop_yield_regressor_v1.0.0",
    "smart_irrigation_classifier_v1.0.0"
  ],
  "frameworks": ["Scikit-Learn", "GradientBoosting", "RandomForest", "FAO-56 Hydrology", "Pillow"]
}
```

### GET `/ml/models`
Returns active models, architectures, metrics, and artifact file paths from the registry.
* **Response `200 OK`:**
```json
{
  "status": "success",
  "service": "KM 360",
  "active_models_count": 5,
  "models": { ... }
}
```

---

## 2. Model Inference Endpoints

### 1. POST `/ml/crop/recommend`
Recommends primary crops and ranked alternatives with regional agronomic guardrails.
* **Request Body:**
```json
{
  "N": 90.0,
  "P": 42.0,
  "K": 43.0,
  "ph": 6.5,
  "temperature": 26.5,
  "humidity": 82.0,
  "rainfall": 202.9,
  "soil_type": "Black Cotton",
  "location": "Warangal, Telangana",
  "season": "Kharif"
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "recommended_crops": [
    {
      "crop": "Cotton",
      "confidence": 0.94,
      "description": "Deep-rooted commercial cash crop...",
      "seasonal_suitability": "Kharif",
      "soil_suitability": "Black / Vertisol",
      "agronomic_advisory": "Avoid waterlogging in early stages."
    }
  ],
  "alternative_crops": [
    {
      "crop": "Chilli",
      "confidence": 0.82,
      "description": "High-value spice crop suited for black soils."
    }
  ],
  "model_version": "v1.2.0",
  "confidence": 0.94,
  "warnings": []
}
```

---

### 2. POST `/ml/soil/analyze`
Interprets soil chemistry (NPK, pH, EC, OC) against Indian Soil Health Card criteria and edaphic hazards.
* **Request Body:**
```json
{
  "N": 190.0,
  "P": 16.0,
  "K": 120.0,
  "ph": 7.4,
  "ec": 0.45,
  "organic_carbon": 0.40,
  "soil_type": "Black Cotton",
  "location": "Warangal, Telangana"
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "model_version": "v1.0.0",
  "soil_summary": {
    "soil_type": "Black Cotton",
    "location": "Warangal, Telangana",
    "soil_reaction_class": "Neutral / Optimum Arable",
    "salinity_class": "Non-Saline (Safe)",
    "organic_matter_status": "Low",
    "predicted_fertility_tier": "Low Fertility",
    "ratings": {
      "nitrogen": { "value": 190.0, "rating": "Low" },
      "phosphorus": { "value": 16.0, "rating": "Low" },
      "potassium": { "value": 120.0, "rating": "Low" }
    }
  },
  "potential_deficiencies": [ ... ],
  "expert_review_required": false,
  "warnings": []
}
```

---

### 3. POST `/ml/fertilizer/recommend`
Computes STCR nutrient adjustments and matches commercial Kissan Mithar catalogue items.
* **Request Body:**
```json
{
  "crop_name": "Cotton",
  "crop_growth_stage": "Vegetative",
  "land_acres": 3.0,
  "measured_n": 190.0,
  "measured_p": 16.0,
  "measured_k": 120.0,
  "ph": 7.5,
  "soil_texture": "Black Cotton"
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "model_version": "v1.0.0",
  "soil_summary": { ... },
  "potential_deficiencies": [ ... ],
  "nutrient_recommendations": [
    {
      "nutrient": "Nitrogen (N)",
      "stcr_adjusted_dose_per_acre_kg": 75.0,
      "total_field_requirement_kg": 225.0,
      "adjustment_rationale": "Adjusted by 125% based on soil test available N of 190.0 kg/ha"
    }
  ],
  "schedule": [
    { "stage": "Basal (At Sowing / Transplanting)", "fertilizers": [ ... ] },
    { "stage": "Active Vegetative (First Top Dressing)", "fertilizers": [ ... ] },
    { "stage": "Flowering / Panicle Initiation", "fertilizers": [ ... ] }
  ],
  "fertilizer_options": [
    {
      "product_name": "IFFCO DAP (Di-Ammonium Phosphate 18:46:0)",
      "sku": "KM-FERT-DAP-50KG",
      "brand": "IFFCO",
      "total_quantity_needed": "195.7 kg (4 bags of 50kg)",
      "estimated_cost_inr": 5400
    }
  ],
  "expert_review_required": false,
  "warnings": []
}
```

---

### 4. POST `/ml/disease/predict`
Diagnoses crop condition from uploaded leaf image (multipart) and symptoms.
* **Content-Type:** `multipart/form-data`
* **Form Fields:** `file` (binary), `crop_name`, `growth_stage`, `farmer_symptoms`, `location`.
* **Response `200 OK`:**
```json
{
  "status": "success",
  "model_version": "v1.0.0",
  "predicted_condition": "Cotton Leaf Curl Virus (CLCuV)",
  "disease_name": "Cotton Leaf Curl Virus (CLCuV)",
  "crop": "Cotton",
  "causal_organism": "Virus (Vector: Whitefly Bemisia tabaci)",
  "confidence": 0.94,
  "severity": "CRITICAL",
  "alternative_possibilities": [ ... ],
  "visible_observations": [
    "Upward leaf curling, thickening of veins on leaf underside.",
    "Enations (small leaf-like outgrowth) developing on veins."
  ],
  "recommended_verification": "Turn leaf over and check for vein thickening and cup-like enations.",
  "expert_escalation_status": true,
  "chemical_treatment": "Vector Control: Pyriproxyfen 10% EC @ 400ml/acre or Afidopyropen 50g/L DC @ 400ml/acre.",
  "organic_treatment": "Neem Oil 10,000 PPM @ 2ml/L or Verticillium lecanii bio-insecticide.",
  "preventative_measures": "Destroy alternate weed hosts; install yellow sticky traps (15/acre).",
  "limitations_and_disclaimers": "DISCLAIMER: Preliminary assessment. Cross-verify with AEO.",
  "warnings": []
}
```

---

### 5. POST `/ml/yield/predict`
Estimates harvest volume per acre and total field production with 90% confidence range.
* **Request Body:**
```json
{
  "crop": "Paddy",
  "land_acres": 4.0,
  "district": "Warangal",
  "irrigation_type": "Borewell",
  "soil_type": "Black Cotton (Vertisol)",
  "seasonal_rainfall_mm": 850.0,
  "temperature_c": 26.5,
  "fertilizer_applied_kg_per_acre": 120.0,
  "ph": 7.2
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "model_version": "v1.0.0",
  "crop": "Paddy",
  "district": "Warangal",
  "cultivated_land_acres": 4.0,
  "estimated_yield_per_acre_quintals": 25.5,
  "total_estimated_production_quintals": 102.0,
  "prediction_range": {
    "min": 23.3,
    "max": 27.7,
    "unit": "Quintals/Acre"
  },
  "confidence_interval_90": "23.3 to 27.7 Quintals/Acre",
  "benchmark_district_average_quintals": 25.5,
  "important_contributing_factors": [ ... ],
  "optimization_suggestions": [ ... ],
  "prediction_limitations": [ ... ],
  "warnings": []
}
```

---

### 6. POST `/ml/irrigation/recommend`
Evaluates crop water requirements and irrigation timing via FAO-56 Penman-Monteith methodology.
* **Request Body:**
```json
{
  "crop": "Cotton",
  "growth_stage": "Vegetative",
  "soil_type": "Black Cotton (Vertisol)",
  "soil_moisture_pct": 19.5,
  "temperature_c": 32.0,
  "humidity_pct": 45.0,
  "rainfall_past_48h_mm": 0.0,
  "forecast_rain_48h_mm": 0.0,
  "irrigation_method": "Drip",
  "land_acres": 2.5
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "model_version": "v1.0.0",
  "crop": "Cotton",
  "growth_stage": "Vegetative",
  "soil_type": "Black Cotton (Vertisol)",
  "farm_location": "Warangal, Telangana",
  "irrigation_method": "Drip",
  "irrigation_needed": true,
  "urgency": "HIGH",
  "assessment_summary": "Soil moisture (19.5%) has dropped below critical allowable depletion threshold (26.0%). Irrigation required.",
  "soil_water_balance": {
    "soil_moisture_pct": 19.5,
    "field_capacity_pct": 38.0,
    "wilting_point_pct": 18.0,
    "reference_et0_mm_day": 5.86,
    "crop_coefficient_kc": 0.85,
    "crop_evapotranspiration_etc_mm_day": 4.98
  },
  "water_requirement": {
    "net_irrigation_depth_mm": 4.98,
    "gross_irrigation_depth_mm": 5.53,
    "litres_per_acre": 22380,
    "total_litres_for_field": 55950,
    "recommended_runtime_hours": 10.2
  },
  "suggested_timing": "Schedule irrigation during early morning hours (6:00 AM – 8:30 AM)...",
  "rainfall_warnings": [],
  "uncertainty_and_limitations": [ ... ],
  "warnings": []
}
```
