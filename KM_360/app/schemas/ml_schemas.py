from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# 1. Crop Recommendation Schemas (KM 360 Production Spec)
class CropItem(BaseModel):
    crop: str = Field(..., description="Crop common name", example="Cotton")
    confidence: float = Field(..., description="Calibrated suitability score [0.0 - 1.0]", example=0.92)
    description: str = Field(..., description="Agronomic summary and characteristics", example="Deep-rooted commercial cash crop...")
    seasonal_suitability: Optional[str] = Field(None, description="Recommended growing season", example="Kharif")
    soil_suitability: Optional[str] = Field(None, description="Optimum soil type", example="Black / Vertisol")
    agronomic_advisory: Optional[str] = Field(None, description="Actionable field guidance", example="Avoid waterlogging in early stages.")

class CropRecommendRequest(BaseModel):
    N: float = Field(..., description="Nitrogen content ratio in soil (kg/ha)", example=90.0)
    P: float = Field(..., description="Phosphorus content ratio in soil (kg/ha)", example=42.0)
    K: float = Field(..., description="Potassium content ratio in soil (kg/ha)", example=43.0)
    ph: float = Field(..., description="Soil pH value (0-14)", example=6.5)
    temperature: float = Field(..., description="Ambient temperature in Celsius", example=26.5)
    humidity: float = Field(..., description="Relative humidity %", example=82.0)
    rainfall: float = Field(..., description="Seasonal rainfall in mm", example=202.9)
    soil_type: Optional[str] = Field(None, description="Soil type e.g. Black Cotton, Red Sandy Loam, Alluvial", example="Black Cotton")
    location: Optional[str] = Field(None, description="District or State e.g. Warangal, Adilabad, Telangana", example="Telangana")
    season: Optional[str] = Field(None, description="Agricultural season: Kharif, Rabi, Zaid", example="Kharif")

class CropRecommendResponse(BaseModel):
    status: str = "success"
    recommended_crops: List[CropItem] = Field(default_factory=list, description="Primary recommended crops")
    alternative_crops: List[CropItem] = Field(default_factory=list, description="Ranked viable alternative crops")
    model_version: str = Field(..., description="Trained model version identifier", example="v1.2.0")
    confidence: Optional[float] = Field(None, description="Top prediction confidence or suitability score", example=0.94)
    warnings: List[str] = Field(default_factory=list, description="Agronomic, seasonal, and regional guardrail warnings")
    relevant_input_conditions: Optional[Dict[str, Any]] = None
    recommended_crop: Optional[str] = None
    top_candidates: Optional[List[Dict[str, Any]]] = None

# Backward compatibility schemas
class CropRecommendationRequest(BaseModel):
    N: float = Field(..., description="Nitrogen content ratio in soil (kg/ha)", example=90.0)
    P: float = Field(..., description="Phosphorus content ratio in soil (kg/ha)", example=42.0)
    K: float = Field(..., description="Potassium content ratio in soil (kg/ha)", example=43.0)
    temperature: float = Field(..., description="Ambient temperature in Celsius", example=26.5)
    humidity: float = Field(..., description="Relative humidity %", example=82.0)
    ph: float = Field(..., description="Soil pH value (0-14)", example=6.5)
    rainfall: float = Field(..., description="Annual/seasonal rainfall in mm", example=202.9)
    soil_type: Optional[str] = None
    location: Optional[str] = None
    season: Optional[str] = None

class CropSuitabilityItem(BaseModel):
    crop: str
    confidence: float
    description: str

class CropRecommendationResponse(BaseModel):
    status: str = "success"
    recommended_crop: str
    confidence: float
    top_candidates: List[CropSuitabilityItem]
    model_version: str = "v1.2.0"
    warnings: List[str] = []

# 2. Soil & Fertilizer Intelligence Schemas (Prompt 2 Spec)
class SoilAnalyzeRequest(BaseModel):
    N: float = Field(..., description="Available Nitrogen in soil (kg/ha or kg/acre)", json_schema_extra={"example": 210.0})
    P: float = Field(..., description="Available Phosphorus in soil (kg/ha or kg/acre)", json_schema_extra={"example": 18.0})
    K: float = Field(..., description="Available Potassium in soil (kg/ha or kg/acre)", json_schema_extra={"example": 160.0})
    ph: float = Field(..., description="Soil pH value (0-14)", json_schema_extra={"example": 7.4})
    ec: Optional[float] = Field(None, description="Electrical Conductivity (dS/m)", json_schema_extra={"example": 0.45})
    organic_carbon: Optional[float] = Field(None, description="Soil Organic Carbon %", json_schema_extra={"example": 0.48})
    soil_type: Optional[str] = Field(None, description="Soil texture/type e.g. Black Cotton, Red Sandy Loam", json_schema_extra={"example": "Black Cotton"})
    soil_test_date: Optional[str] = Field(None, description="Date of lab test (YYYY-MM-DD)", json_schema_extra={"example": "2026-10-15"})
    location: Optional[str] = Field(None, description="District / State", json_schema_extra={"example": "Warangal, Telangana"})

class SoilAnalyzeResponse(BaseModel):
    status: str = "success"
    model_version: str = "v1.0.0"
    soil_summary: Dict[str, Any] = Field(..., description="Nutrient ratings, pH class, salinity status")
    potential_deficiencies: List[Dict[str, Any]] = Field(default_factory=list, description="Deficiency identification with agronomic symptoms")
    nutrient_recommendations: Optional[List[Dict[str, Any]]] = None
    fertilizer_options: Optional[List[Dict[str, Any]]] = None
    expert_review_required: bool = False
    warnings: List[str] = Field(default_factory=list)

class FertilizerRecommendRequest(BaseModel):
    crop_name: str = Field(..., description="Target crop e.g. Cotton, Paddy, Chilli, Maize", json_schema_extra={"example": "Cotton"})
    crop_growth_stage: Optional[str] = Field("Basal", description="Growth stage: Basal, Vegetative, Flowering, Maturity", json_schema_extra={"example": "Vegetative"})
    land_acres: Optional[float] = Field(1.0, description="Farm acreage", json_schema_extra={"example": 2.5})
    measured_n: Optional[float] = Field(None, description="Soil test Nitrogen (kg/ha)", json_schema_extra={"example": 210.0})
    measured_p: Optional[float] = Field(None, description="Soil test Phosphorus (kg/ha)", json_schema_extra={"example": 18.0})
    measured_k: Optional[float] = Field(None, description="Soil test Potassium (kg/ha)", json_schema_extra={"example": 160.0})
    ph: Optional[float] = Field(None, description="Soil pH", json_schema_extra={"example": 7.4})
    ec: Optional[float] = Field(None, description="Electrical Conductivity (dS/m)", json_schema_extra={"example": 0.45})
    organic_carbon: Optional[float] = Field(None, description="Soil Organic Carbon %", json_schema_extra={"example": 0.48})
    soil_texture: Optional[str] = Field(None, description="Soil texture / type", json_schema_extra={"example": "Black Cotton"})
    previous_fertilizer_applications: Optional[str] = Field(None, description="Previous inputs applied", json_schema_extra={"example": "DAP applied at sowing"})
    soil_test_date: Optional[str] = Field(None, description="Soil test date", json_schema_extra={"example": "2026-10-15"})

class FertilizerRecommendResponse(BaseModel):
    status: str = "success"
    model_version: str = "v1.0.0"
    soil_summary: Dict[str, Any] = Field(..., description="Comprehensive soil nutrient assessment")
    potential_deficiencies: List[Dict[str, Any]] = Field(default_factory=list)
    nutrient_recommendations: List[Dict[str, Any]] = Field(default_factory=list, description="STCR adjusted elemental NPK requirements")
    schedule: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Stage-wise commercial application schedule")
    fertilizer_options: List[Dict[str, Any]] = Field(default_factory=list, description="Matched KM product catalogue SKUs and bag counts")
    expert_review_required: bool = False
    warnings: List[str] = Field(default_factory=list)

# Backward compatibility schemas
class FertilizerRecommendationRequest(BaseModel):
    crop_type: str = Field(..., description="Target crop e.g. Paddy, Cotton, Chilli", example="Cotton")
    soil_type: str = Field(..., description="Black, Red, Alluvial, Sandy", example="Black")
    land_acres: float = Field(..., description="Acreage of the field", example=3.0)
    measured_n: float = Field(..., description="Soil test Nitrogen value (kg/acre)", example=35.0)
    measured_p: float = Field(..., description="Soil test Phosphorus value (kg/acre)", example=12.0)
    measured_k: float = Field(..., description="Soil test Potassium value (kg/acre)", example=40.0)
    growth_stage: Optional[str] = Field("Vegetative", description="Basal, Vegetative, Flowering, Fruiting")

class FertilizerScheduleItem(BaseModel):
    stage: str
    days_after_sowing: str
    fertilizer_name: str
    dosage_per_acre: str
    application_method: str
    purpose: str

class FertilizerRecommendationResponse(BaseModel):
    status: str = "success"
    crop: str
    soil_health_assessment: str
    deficiencies: List[str]
    schedule: List[FertilizerScheduleItem]
    organic_alternatives: List[str]

# 3. Plant Disease Detection Schemas (Prompt 3 Spec)
class AlternativeDisease(BaseModel):
    condition: str
    confidence: float
    causal: Optional[str] = None

class DiseasePredictResponse(BaseModel):
    status: str = "success"
    model_version: str = "v1.0.0"
    predicted_condition: str
    disease_name: str
    crop: str
    causal_organism: str
    confidence: float
    severity: str
    alternative_possibilities: List[AlternativeDisease] = Field(default_factory=list)
    visible_observations: List[str] = Field(default_factory=list)
    recommended_verification: str
    expert_escalation_status: bool = False
    chemical_treatment: str
    organic_treatment: str
    preventative_measures: str
    image_quality_metadata: Optional[Dict[str, Any]] = None
    limitations_and_disclaimers: str
    warnings: List[str] = Field(default_factory=list)

class PlantDiseaseResponse(BaseModel):
    status: str = "success"
    disease_detected: str
    causal_organism: str  # Fungus, Bacteria, Virus, Pest, Healthy
    confidence: float
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    immediate_action: str
    verified_chemical_treatment: str
    organic_treatment: str
    preventative_measures: str

# 4. Yield Prediction Schemas (Prompt 4 Spec)
class YieldPredictRequest(BaseModel):
    crop: str = Field(..., description="Target crop e.g. Paddy, Cotton, Chilli, Maize, Groundnut", json_schema_extra={"example": "Paddy"})
    land_acres: float = Field(..., description="Cultivated land area in acres", json_schema_extra={"example": 3.0})
    district: Optional[str] = Field("Warangal", description="District name", json_schema_extra={"example": "Warangal"})
    irrigation_type: Optional[str] = Field("Borewell", description="Irrigation method: Drip, Borewell, Canal, Rainfed", json_schema_extra={"example": "Borewell"})
    soil_type: Optional[str] = Field("Black Cotton (Vertisol)", description="Soil type", json_schema_extra={"example": "Black Cotton (Vertisol)"})
    seasonal_rainfall_mm: Optional[float] = Field(780.0, description="Seasonal rainfall in mm", json_schema_extra={"example": 780.0})
    temperature_c: Optional[float] = Field(27.5, description="Average temperature in Celsius", json_schema_extra={"example": 27.5})
    fertilizer_applied_kg_per_acre: Optional[float] = Field(110.0, description="Fertilizer applied (kg/acre)", json_schema_extra={"example": 110.0})
    ph: Optional[float] = Field(7.1, description="Soil pH", json_schema_extra={"example": 7.1})
    sowing_date: Optional[str] = Field(None, description="Sowing date (YYYY-MM-DD)", json_schema_extra={"example": "2026-06-15"})
    season: Optional[str] = Field("Kharif", description="Season: Kharif, Rabi, Zaid", json_schema_extra={"example": "Kharif"})

class YieldPredictResponse(BaseModel):
    status: str = "success"
    model_version: str = "v1.0.0"
    crop: str
    district: str
    cultivated_land_acres: float
    estimated_yield_per_acre_quintals: float
    total_estimated_production_quintals: float
    prediction_range: Dict[str, Any]
    confidence_interval_90: str
    benchmark_district_average_quintals: float
    important_contributing_factors: List[Dict[str, Any]] = Field(default_factory=list)
    optimization_suggestions: List[str] = Field(default_factory=list)
    prediction_limitations: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

# Backward compatibility schemas
class YieldPredictionRequest(BaseModel):
    crop_type: str = Field(..., example="Paddy")
    land_acres: float = Field(..., example=4.0)
    irrigation_type: str = Field("Canal", example="Borewell")
    soil_type: str = Field("Alluvial", example="Black Cotton")
    seasonal_rainfall_mm: float = Field(850.0, example=800.0)
    fertilizer_applied_kg_per_acre: Optional[float] = 120.0

class YieldPredictionResponse(BaseModel):
    status: str = "success"
    crop: str
    estimated_yield_per_acre_quintals: float
    total_estimated_production_quintals: float
    confidence_interval_90: str
    benchmark_district_average_quintals: float
    optimization_suggestions: List[str]

# 5. Smart Irrigation Recommendation Schemas (Prompt 5 Spec)
class IrrigationRecommendRequest(BaseModel):
    crop: str = Field(..., description="Target crop e.g. Cotton, Paddy, Chilli, Maize, Groundnut", json_schema_extra={"example": "Cotton"})
    growth_stage: Optional[str] = Field("Vegetative", description="Crop growth stage: Initial, Vegetative, Flowering, Maturity", json_schema_extra={"example": "Vegetative"})
    soil_type: Optional[str] = Field("Black Cotton (Vertisol)", description="Soil texture/type e.g. Black Cotton, Red Sandy Loam", json_schema_extra={"example": "Black Cotton (Vertisol)"})
    soil_moisture_pct: Optional[float] = Field(None, description="Measured volumetric soil moisture %", json_schema_extra={"example": 22.0})
    temperature_c: Optional[float] = Field(30.5, description="Ambient temperature in Celsius", json_schema_extra={"example": 31.0})
    humidity_pct: Optional[float] = Field(60.0, description="Relative humidity %", json_schema_extra={"example": 55.0})
    rainfall_past_48h_mm: Optional[float] = Field(0.0, description="Rainfall received in past 48 hours (mm)", json_schema_extra={"example": 0.0})
    forecast_rain_48h_mm: Optional[float] = Field(0.0, description="Rainfall forecast for next 48 hours (mm)", json_schema_extra={"example": 0.0})
    farm_location: Optional[str] = Field("Warangal, Telangana", description="Farm location/district", json_schema_extra={"example": "Warangal, Telangana"})
    irrigation_method: Optional[str] = Field("Drip", description="Irrigation method: Drip, Sprinkler, Flood, Furrow", json_schema_extra={"example": "Drip"})
    land_acres: Optional[float] = Field(1.0, description="Farm acreage", json_schema_extra={"example": 2.5})

class IrrigationRecommendResponse(BaseModel):
    status: str = "success"
    model_version: str = "v1.0.0"
    crop: str
    growth_stage: str
    soil_type: str
    farm_location: str
    irrigation_method: str
    irrigation_needed: bool
    urgency: str
    assessment_summary: str
    soil_water_balance: Dict[str, Any]
    water_requirement: Dict[str, Any]
    suggested_timing: str
    rainfall_warnings: List[str] = Field(default_factory=list)
    uncertainty_and_limitations: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

# 6. Soil Classification Schemas
class SoilClassificationRequest(BaseModel):
    ph: float = Field(..., example=7.2)
    organic_carbon_percent: float = Field(..., example=0.55)
    clay_percent: Optional[float] = Field(45.0, example=45.0)
    sand_percent: Optional[float] = Field(25.0, example=25.0)
    color: Optional[str] = Field("Deep Black", example="Deep Black")

class SoilClassificationResponse(BaseModel):
    status: str = "success"
    soil_type: str
    water_retention_capacity: str
    aeration: str
    suitable_crops: List[str]
    reclamation_advisory: str
