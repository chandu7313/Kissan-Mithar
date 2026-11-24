from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
from app.schemas.ml_schemas import (
    CropRecommendRequest, CropRecommendResponse,
    CropRecommendationRequest, CropRecommendationResponse,
    SoilAnalyzeRequest, SoilAnalyzeResponse,
    FertilizerRecommendRequest, FertilizerRecommendResponse,
    FertilizerRecommendationRequest, FertilizerRecommendationResponse,
    DiseasePredictResponse, PlantDiseaseResponse,
    YieldPredictRequest, YieldPredictResponse,
    YieldPredictionRequest, YieldPredictionResponse,
    IrrigationRecommendRequest, IrrigationRecommendResponse,
    SoilClassificationRequest, SoilClassificationResponse
)
from app.inference.crop_model import CropRecommendationModel
from app.inference.fertilizer_model import FertilizerRecommendationModel
from app.inference.soil_fertilizer_engine import SoilFertilizerEngine
from app.inference.crop_disease_engine import CropDiseaseEngine
from app.inference.disease_model import PlantDiseaseDetectionModel
from app.inference.crop_yield_engine import CropYieldEngine
from app.inference.yield_model import YieldPredictionModel
from app.inference.smart_irrigation_engine import SmartIrrigationEngine
from app.inference.soil_model import SoilClassificationModel

router = APIRouter()

@router.post("/crop/recommend", response_model=CropRecommendResponse)
async def recommend_crop(payload: CropRecommendRequest):
    """
    KM 360 Production Crop Recommendation:
    Recommends primary crops and ranked alternatives based on soil characteristics,
    environmental conditions, soil type, location, and season.
    """
    result = CropRecommendationModel.recommend(
        n=payload.N,
        p=payload.P,
        k=payload.K,
        ph=payload.ph,
        temp=payload.temperature,
        humidity=payload.humidity,
        rain=payload.rainfall,
        soil_type=payload.soil_type,
        location=payload.location,
        season=payload.season
    )
    return CropRecommendResponse(**result)

@router.post("/crop-recommendation", response_model=CropRecommendationResponse)
async def recommend_crop_legacy(payload: CropRecommendationRequest):
    """
    Backward-compatible legacy endpoint.
    """
    result = CropRecommendationModel.predict(
        n=payload.N,
        p=payload.P,
        k=payload.K,
        temp=payload.temperature,
        humidity=payload.humidity,
        ph=payload.ph,
        rain=payload.rainfall
    )
    return CropRecommendationResponse(**result)

@router.post("/soil/analyze", response_model=SoilAnalyzeResponse)
async def analyze_soil(payload: SoilAnalyzeRequest):
    """
    KM 360 Soil Intelligence & Nutrient Deficit Analysis:
    Interprets soil chemistry (NPK, pH, EC, OC) against Indian Soil Health Card benchmarks,
    identifies deficiencies, evaluates edaphic hazards, and predicts fertility index.
    """
    result = SoilFertilizerEngine.analyze_soil(
        n=payload.N,
        p=payload.P,
        k=payload.K,
        ph=payload.ph,
        ec=payload.ec,
        organic_carbon=payload.organic_carbon,
        soil_type=payload.soil_type,
        soil_test_date=payload.soil_test_date,
        location=payload.location
    )
    return SoilAnalyzeResponse(**result)

@router.post("/fertilizer/recommend", response_model=FertilizerRecommendResponse)
async def recommend_fertilizer_stcr(payload: FertilizerRecommendRequest):
    """
    KM 360 Crop-Specific Fertilizer Decision Support:
    Calculates exact nutrient adjustments via ICAR/PJTSAU STCR calibration,
    generates stage-wise application schedules, and matches certified KM product SKUs.
    """
    result = SoilFertilizerEngine.recommend_fertilizer(
        crop_name=payload.crop_name,
        growth_stage=payload.crop_growth_stage,
        land_acres=payload.land_acres or 1.0,
        measured_n=payload.measured_n,
        measured_p=payload.measured_p,
        measured_k=payload.measured_k,
        ph=payload.ph,
        ec=payload.ec,
        organic_carbon=payload.organic_carbon,
        soil_texture=payload.soil_texture,
        previous_fertilizer_applications=payload.previous_fertilizer_applications,
        soil_test_date=payload.soil_test_date
    )
    return FertilizerRecommendResponse(**result)

@router.post("/fertilizer-recommendation", response_model=FertilizerRecommendationResponse)
async def recommend_fertilizer(payload: FertilizerRecommendationRequest):
    """
    Evaluates soil nutrient deficits and computes stage-wise commercial brand applications.
    """
    result = FertilizerRecommendationModel.evaluate(
        crop_type=payload.crop_type,
        soil_type=payload.soil_type,
        land_acres=payload.land_acres,
        measured_n=payload.measured_n,
        measured_p=payload.measured_p,
        measured_k=payload.measured_k,
        growth_stage=payload.growth_stage or "Vegetative"
    )
    return FertilizerRecommendationResponse(**result)

@router.post("/disease/predict", response_model=DiseasePredictResponse)
async def predict_crop_disease(
    file: Optional[UploadFile] = File(None),
    crop_name: Optional[str] = Form(None),
    crop_hint: Optional[str] = Form(None),
    growth_stage: Optional[str] = Form(None),
    farmer_symptoms: Optional[str] = Form(None),
    location: Optional[str] = Form(None)
):
    """
    KM 360 Crop Disease Vision Classifier:
    Processes crop photographs, validates image quality & blur, extracts agronomic vision features,
    and classifies lesions across Paddy, Cotton, Chilli, Maize, Groundnut, and Healthy crops.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()

    crop_target = crop_name or crop_hint or "paddy"
    result = CropDiseaseEngine.predict_disease(
        image_bytes=image_bytes,
        crop_hint=crop_target,
        growth_stage=growth_stage,
        farmer_symptoms=farmer_symptoms,
        location=location
    )
    return DiseasePredictResponse(**result)

@router.post("/disease-detection", response_model=PlantDiseaseResponse)
async def detect_disease(
    file: Optional[UploadFile] = File(None),
    crop_hint: Optional[str] = Form("paddy")
):
    """
    Classifies crop leaf lesions from uploaded images and provides CIBRC-registered treatment plans.
    """
    image_bytes = b""
    if file:
        image_bytes = await file.read()
    
    result = PlantDiseaseDetectionModel.diagnose_image(image_bytes, crop_hint or "paddy")
    return PlantDiseaseResponse(**result)

@router.post("/yield/predict", response_model=YieldPredictResponse)
async def predict_crop_yield(payload: YieldPredictRequest):
    """
    KM 360 Crop Yield Estimation:
    Forecasts expected harvest yield per acre and total production using historical district-level
    agricultural data (DES & PJTSAU) and Gradient Boosting regression with 90% prediction intervals.
    """
    result = CropYieldEngine.predict_yield(
        crop=payload.crop,
        land_acres=payload.land_acres,
        district=payload.district,
        irrigation_type=payload.irrigation_type,
        soil_type=payload.soil_type,
        seasonal_rainfall_mm=payload.seasonal_rainfall_mm,
        temperature_c=payload.temperature_c,
        fertilizer_applied_kg_per_acre=payload.fertilizer_applied_kg_per_acre,
        ph=payload.ph,
        sowing_date=payload.sowing_date,
        season=payload.season
    )
    return YieldPredictResponse(**result)

@router.post("/yield-prediction", response_model=YieldPredictionResponse)
async def predict_yield(payload: YieldPredictionRequest):
    """
    Forecasts harvest yield in quintals/acre based on crop, irrigation, acreage, and rainfall.
    """
    result = YieldPredictionModel.predict(
        crop_type=payload.crop_type,
        land_acres=payload.land_acres,
        irrigation_type=payload.irrigation_type,
        soil_type=payload.soil_type,
        seasonal_rainfall_mm=payload.seasonal_rainfall_mm,
        fertilizer_applied_kg=payload.fertilizer_applied_kg_per_acre or 120.0
    )
    return YieldPredictionResponse(**result)

@router.post("/irrigation/recommend", response_model=IrrigationRecommendResponse)
async def recommend_smart_irrigation(payload: IrrigationRecommendRequest):
    """
    KM 360 Smart Irrigation Decision Support:
    Combines FAO-56 Penman-Monteith Evapotranspiration (ET0), crop coefficients (Kc),
    soil-water depletion thresholds, and weather forecasts to determine watering need,
    required volume in litres/acre, and optimal application timing.
    """
    result = SmartIrrigationEngine.recommend_irrigation(
        crop=payload.crop,
        growth_stage=payload.growth_stage,
        soil_type=payload.soil_type,
        soil_moisture_pct=payload.soil_moisture_pct,
        temperature_c=payload.temperature_c,
        humidity_pct=payload.humidity_pct,
        rainfall_past_48h_mm=payload.rainfall_past_48h_mm,
        forecast_rain_48h_mm=payload.forecast_rain_48h_mm,
        farm_location=payload.farm_location,
        irrigation_method=payload.irrigation_method,
        land_acres=payload.land_acres
    )
    return IrrigationRecommendResponse(**result)

@router.post("/soil-classification", response_model=SoilClassificationResponse)
async def classify_soil(payload: SoilClassificationRequest):
    """
    Classifies soil type and computes water retention, aeration, and suitable crops.
    """
    result = SoilClassificationModel.classify(
        ph=payload.ph,
        organic_carbon_percent=payload.organic_carbon_percent,
        clay_percent=payload.clay_percent or 40.0,
        sand_percent=payload.sand_percent or 30.0,
        color=payload.color or "Deep Black"
    )
    return SoilClassificationResponse(**result)
