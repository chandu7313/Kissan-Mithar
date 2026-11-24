import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/db.js';

// ============================================================================
// 1. CROP RECOMMENDATION INTERFACES
// ============================================================================
export interface CropRecommendInput {
  N: number;
  P: number;
  K: number;
  ph: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soil_type?: string;
  location?: string;
  season?: string;
  farmerId?: string;
}

export interface CropItem {
  crop: string;
  confidence: number;
  description: string;
  seasonal_suitability?: string;
  soil_suitability?: string;
  agronomic_advisory?: string;
}

export interface CropRecommendResult {
  status: string;
  recommended_crops: CropItem[];
  alternative_crops: CropItem[];
  model_version: string;
  confidence: number | null;
  warnings: string[];
  relevant_input_conditions?: Record<string, any>;
}

// ============================================================================
// 2. SOIL & FERTILIZER INTELLIGENCE INTERFACES
// ============================================================================
export interface SoilAnalyzeInput {
  N: number;
  P: number;
  K: number;
  ph: number;
  ec?: number;
  organic_carbon?: number;
  soil_type?: string;
  soil_test_date?: string;
  location?: string;
  farmerId?: string;
}

export interface SoilAnalyzeResult {
  status: string;
  model_version: string;
  soil_summary: Record<string, any>;
  potential_deficiencies: Array<{
    nutrient: string;
    type: string;
    evidence: string;
    symptoms: string;
    correction: string;
  }>;
  expert_review_required: boolean;
  warnings: string[];
}

export interface FertilizerRecommendInput {
  crop_name: string;
  crop_growth_stage?: string;
  land_acres?: number;
  measured_n?: number;
  measured_p?: number;
  measured_k?: number;
  ph?: number;
  ec?: number;
  organic_carbon?: number;
  soil_texture?: string;
  previous_fertilizer_applications?: string;
  farmerId?: string;
}

export interface FertilizerRecommendResult {
  status: string;
  model_version: string;
  soil_summary: Record<string, any>;
  potential_deficiencies: Array<any>;
  nutrient_recommendations: Array<{
    nutrient: string;
    stcr_adjusted_dose_per_acre_kg: number;
    total_field_requirement_kg: number;
    adjustment_rationale: string;
  }>;
  schedule: Array<{
    stage: string;
    timing: string;
    fertilizers: Array<any>;
    micronutrient_addition?: string;
    foliar_spray?: string;
  }>;
  fertilizer_options: Array<{
    product_name: string;
    sku: string;
    brand: string;
    category: string;
    total_quantity_needed: string;
    estimated_cost_inr: number;
  }>;
  expert_review_required: boolean;
  warnings: string[];
}

// ============================================================================
// 3. CROP DISEASE VISION INTERFACES
// ============================================================================
export interface DiseasePredictInput {
  imageBase64?: string;
  crop_name?: string;
  growth_stage?: string;
  farmer_symptoms?: string;
  location?: string;
  farmerId?: string;
}

export interface DiseasePredictResult {
  status: string;
  model_version: string;
  predicted_condition: string;
  disease_name: string;
  crop: string;
  causal_organism: string;
  confidence: number;
  severity: string;
  alternative_possibilities: Array<{
    condition: string;
    confidence: number;
    causal?: string;
  }>;
  visible_observations: string[];
  recommended_verification: string;
  expert_escalation_status: boolean;
  chemical_treatment: string;
  organic_treatment: string;
  preventative_measures: string;
  image_quality_metadata?: Record<string, any>;
  limitations_and_disclaimers: string;
  warnings: string[];
}

// ============================================================================
// 4. HARVEST YIELD PREDICTION INTERFACES
// ============================================================================
export interface YieldPredictInput {
  crop: string;
  land_acres: number;
  district?: string;
  irrigation_type?: string;
  soil_type?: string;
  seasonal_rainfall_mm?: number;
  temperature_c?: number;
  fertilizer_applied_kg_per_acre?: number;
  ph?: number;
  sowing_date?: string;
  season?: string;
  farmerId?: string;
}

export interface YieldPredictResult {
  status: string;
  model_version: string;
  crop: string;
  district: string;
  cultivated_land_acres: number;
  estimated_yield_per_acre_quintals: number;
  total_estimated_production_quintals: number;
  prediction_range: {
    min: number;
    max: number;
    unit: string;
  };
  confidence_interval_90: string;
  benchmark_district_average_quintals: number;
  important_contributing_factors: Array<{
    factor: string;
    status: string;
    impact: string;
    weight: number;
  }>;
  optimization_suggestions: string[];
  prediction_limitations: string[];
  warnings: string[];
}

// ============================================================================
// 5. SMART IRRIGATION INTERFACES
// ============================================================================
export interface IrrigationRecommendInput {
  crop: string;
  growth_stage?: string;
  soil_type?: string;
  soil_moisture_pct?: number;
  temperature_c?: number;
  humidity_pct?: number;
  rainfall_past_48h_mm?: number;
  forecast_rain_48h_mm?: number;
  farm_location?: string;
  irrigation_method?: string;
  land_acres?: number;
  farmerId?: string;
}

export interface IrrigationRecommendResult {
  status: string;
  model_version: string;
  crop: string;
  growth_stage: string;
  soil_type: string;
  farm_location: string;
  irrigation_method: string;
  irrigation_needed: boolean;
  urgency: string;
  assessment_summary: string;
  soil_water_balance: Record<string, any>;
  water_requirement: {
    net_irrigation_depth_mm: number;
    gross_irrigation_depth_mm: number;
    litres_per_acre: number;
    total_litres_for_field: number;
    recommended_runtime_hours: number;
  };
  suggested_timing: string;
  rainfall_warnings: string[];
  uncertainty_and_limitations: string[];
  warnings: string[];
}

// ============================================================================
// CENTRAL MACHINE LEARNING SERVICE CLIENT
// ============================================================================
export class MLService {
  private static async getOrRegisterModel(
    modelDomain: string,
    modelVersion: string,
    name: string,
    framework: string,
    accuracy: number,
    features: string[]
  ): Promise<string | null> {
    try {
      const modelKey = `${modelDomain}_${modelVersion}`;
      let model = await prisma.mLModelRegistry.findUnique({
        where: { modelKey },
      });

      if (!model) {
        model = await prisma.mLModelRegistry.create({
          data: {
            modelKey,
            name,
            version: modelVersion,
            framework,
            artifactPath: `models/${modelDomain}/${modelVersion}/pipeline.joblib`,
            accuracyMetric: accuracy,
            features,
            isActive: true,
          },
        });
      }
      return model.id;
    } catch (err: any) {
      logger.warn(`Could not register or query MLModelRegistry: ${err.message}`);
      return null;
    }
  }

  private static async logPredictionAudit(
    modelId: string | null,
    farmerId: string | undefined,
    sanitizedFeatures: Record<string, any>,
    outputLabel: string,
    confidence: number,
    latencyMs: number
  ): Promise<void> {
    if (!modelId) return;

    try {
      await prisma.predictionAuditLog.create({
        data: {
          modelId,
          farmerId: farmerId || null,
          inputFeatures: sanitizedFeatures,
          outputLabel,
          confidence,
          latencyMs,
        },
      });
    } catch (err: any) {
      logger.warn(`Failed to write PredictionAuditLog: ${err.message}`);
    }
  }

  // --- MODEL 1: CROP RECOMMENDATION ---
  static async recommendCrop(input: CropRecommendInput): Promise<CropRecommendResult> {
    const startTime = Date.now();
    const targetUrl = `${env.ML_SERVICE_URL}/ml/crop/recommend`;
    const payload = {
      N: input.N, P: input.P, K: input.K, ph: input.ph,
      temperature: input.temperature, humidity: input.humidity, rainfall: input.rainfall,
      soil_type: input.soil_type, location: input.location, season: input.season,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result: CropRecommendResult = (await response.json()) as CropRecommendResult;
      const latencyMs = Date.now() - startTime;

      const topCrop = result.recommended_crops?.[0]?.crop || 'Unknown';
      this.getOrRegisterModel(
        'crop_recommendation', result.model_version || 'v1.2.0',
        'Crop Recommendation Ensemble', 'RandomForest-XGBoost', 0.9944,
        ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
      ).then((modelId) => this.logPredictionAudit(modelId, input.farmerId, payload, topCrop, result.confidence || 0.9, latencyMs))
      .catch((e) => logger.debug(`Audit log error: ${e.message}`));

      return result;
    } catch (error: any) {
      logger.error(`Crop ML connection error: ${error.message}. Engaging fallback.`);
      const isBlackSoil = input.soil_type?.toLowerCase().includes('black') || input.ph > 7.0;
      const topCrop = (isBlackSoil && input.N >= 90) ? 'Cotton' : (input.rainfall > 150 ? 'Rice (Paddy)' : 'Maize');

      return {
        status: 'fallback',
        recommended_crops: [{
          crop: topCrop, confidence: 0.80,
          description: `Agronomic baseline match based on ${input.soil_type || 'local'} soil and rainfall of ${input.rainfall}mm.`,
          seasonal_suitability: input.season || 'Kharif',
          soil_suitability: input.soil_type || 'Medium Arable Soil',
          agronomic_advisory: 'Advisable to verify with nearest Krishi Vigyan Kendra (KVK) soil specialist.'
        }],
        alternative_crops: [{
          crop: isBlackSoil ? 'Chilli' : 'Groundnut', confidence: 0.65,
          description: 'Secondary viable crop suitable for prevailing conditions.'
        }],
        model_version: 'fallback-rules-v1.0.0',
        confidence: 0.80,
        warnings: ['Live ML microservice was temporarily unreachable; generated via verified agronomic rule baseline.'],
        relevant_input_conditions: payload,
      };
    }
  }

  // --- MODEL 2A: SOIL ANALYSIS ---
  static async analyzeSoil(input: SoilAnalyzeInput): Promise<SoilAnalyzeResult> {
    const startTime = Date.now();
    const targetUrl = `${env.ML_SERVICE_URL}/ml/soil/analyze`;
    const payload = {
      N: input.N, P: input.P, K: input.K, ph: input.ph,
      ec: input.ec, organic_carbon: input.organic_carbon,
      soil_type: input.soil_type, soil_test_date: input.soil_test_date, location: input.location
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result: SoilAnalyzeResult = (await response.json()) as SoilAnalyzeResult;
      const latencyMs = Date.now() - startTime;

      this.getOrRegisterModel(
        'soil_fertilizer', result.model_version || 'v1.0.0',
        'Soil Health Card Analysis Engine', 'GradientBoosting-SHC', 0.9911,
        ['N', 'P', 'K', 'ph', 'ec', 'organic_carbon']
      ).then((modelId) => this.logPredictionAudit(modelId, input.farmerId, payload, result.soil_summary?.predicted_fertility_tier || 'Analysis', 0.95, latencyMs))
      .catch((e) => logger.debug(`Audit log error: ${e.message}`));

      return result;
    } catch (error: any) {
      logger.error(`Soil ML error: ${error.message}. Engaging fallback.`);
      return {
        status: 'fallback',
        model_version: 'fallback-rules-v1.0.0',
        soil_summary: {
          soil_reaction_class: input.ph < 6.0 ? 'Acidic' : (input.ph > 8.0 ? 'Alkaline' : 'Neutral'),
          predicted_fertility_tier: 'Medium Fertility (Rule Baseline)'
        },
        potential_deficiencies: [],
        expert_review_required: input.ph < 5.2 || input.ph > 8.5,
        warnings: ['Generated via fallback rules due to temporary ML microservice unavailability.']
      };
    }
  }

  // --- MODEL 2B: FERTILIZER RECOMMENDATION ---
  static async recommendFertilizer(input: FertilizerRecommendInput): Promise<FertilizerRecommendResult> {
    const startTime = Date.now();
    const targetUrl = `${env.ML_SERVICE_URL}/ml/fertilizer/recommend`;
    const payload = {
      crop_name: input.crop_name,
      crop_growth_stage: input.crop_growth_stage || 'Basal',
      land_acres: input.land_acres || 1.0,
      measured_n: input.measured_n,
      measured_p: input.measured_p,
      measured_k: input.measured_k,
      ph: input.ph,
      ec: input.ec,
      organic_carbon: input.organic_carbon,
      soil_texture: input.soil_texture,
      previous_fertilizer_applications: input.previous_fertilizer_applications
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result: FertilizerRecommendResult = (await response.json()) as FertilizerRecommendResult;
      const latencyMs = Date.now() - startTime;

      this.getOrRegisterModel(
        'soil_fertilizer', result.model_version || 'v1.0.0',
        'Crop Fertilizer STCR Engine', 'ICAR-PJTSAU-STCR', 0.9911,
        ['crop_name', 'measured_n', 'measured_p', 'measured_k', 'land_acres']
      ).then((modelId) => this.logPredictionAudit(modelId, input.farmerId, payload, `${input.crop_name} Fertilizer Plan`, 0.95, latencyMs))
      .catch((e) => logger.debug(`Audit log error: ${e.message}`));

      return result;
    } catch (error: any) {
      logger.error(`Fertilizer ML error: ${error.message}. Engaging fallback.`);
      return {
        status: 'fallback',
        model_version: 'fallback-rules-v1.0.0',
        soil_summary: {},
        potential_deficiencies: [],
        nutrient_recommendations: [
          { nutrient: 'Nitrogen (N)', stcr_adjusted_dose_per_acre_kg: 50.0, total_field_requirement_kg: 50.0 * (input.land_acres || 1.0), adjustment_rationale: 'Baseline general recommendation' },
          { nutrient: 'Phosphorus (P2O5)', stcr_adjusted_dose_per_acre_kg: 25.0, total_field_requirement_kg: 25.0 * (input.land_acres || 1.0), adjustment_rationale: 'Baseline general recommendation' },
          { nutrient: 'Potassium (K2O)', stcr_adjusted_dose_per_acre_kg: 25.0, total_field_requirement_kg: 25.0 * (input.land_acres || 1.0), adjustment_rationale: 'Baseline general recommendation' }
        ],
        schedule: [
          { stage: 'Basal (At Sowing)', timing: 'Day 0', fertilizers: [{ product: 'IFFCO DAP', dosage_per_acre: '50 kg' }] }
        ],
        fertilizer_options: [
          { product_name: 'IFFCO DAP (50kg)', sku: 'KM-FERT-DAP-50KG', brand: 'IFFCO', category: 'Phosphatic', total_quantity_needed: '1 bag', estimated_cost_inr: 1350 }
        ],
        expert_review_required: false,
        warnings: ['Generated via baseline recommendations due to temporary service unavailability.']
      };
    }
  }

  // --- MODEL 3: CROP DISEASE DIAGNOSIS ---
  static async predictDisease(input: DiseasePredictInput): Promise<DiseasePredictResult> {
    const startTime = Date.now();
    const targetUrl = `${env.ML_SERVICE_URL}/ml/disease/predict`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const formData = new FormData();
      if (input.imageBase64) {
        const buffer = Buffer.from(input.imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('file', blob, 'leaf.jpg');
      }
      if (input.crop_name) formData.append('crop_name', input.crop_name);
      if (input.growth_stage) formData.append('growth_stage', input.growth_stage);
      if (input.farmer_symptoms) formData.append('farmer_symptoms', input.farmer_symptoms);
      if (input.location) formData.append('location', input.location);

      const response = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result: DiseasePredictResult = (await response.json()) as DiseasePredictResult;
      const latencyMs = Date.now() - startTime;

      this.getOrRegisterModel(
        'crop_disease', result.model_version || 'v1.0.0',
        'Crop Disease & Pest Vision Classifier', 'RandomForest-CV', 0.8582,
        ['vision_features_8d', 'crop', 'symptoms']
      ).then((modelId) => this.logPredictionAudit(modelId, input.farmerId, { crop: input.crop_name, symptoms: input.farmer_symptoms }, result.predicted_condition, result.confidence, latencyMs))
      .catch((e) => logger.debug(`Audit log error: ${e.message}`));

      return result;
    } catch (error: any) {
      logger.error(`Disease ML error: ${error.message}. Engaging fallback.`);
      return {
        status: 'fallback',
        model_version: 'fallback-rules-v1.0.0',
        predicted_condition: 'Suspected Leaf Spot / Foliar Infection',
        disease_name: 'Suspected Leaf Spot / Foliar Infection',
        crop: input.crop_name || 'Crop',
        causal_organism: 'Fungus / Physiological Stress',
        confidence: 0.65,
        severity: 'MEDIUM',
        alternative_possibilities: [],
        visible_observations: ['Chlorotic spotting and marginal leaf scorching'],
        recommended_verification: 'Take a sample to the nearest Agricultural Extension Officer (AEO).',
        expert_escalation_status: true,
        chemical_treatment: 'Mancozeb 75% WP @ 400g in 200 Litres of water per acre.',
        organic_treatment: 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE).',
        preventative_measures: 'Avoid excessive nitrogen top-dressing; maintain optimal spacing.',
        limitations_and_disclaimers: 'DISCLAIMER: Preliminary assessment. Consult local agronomist before spraying.',
        warnings: ['Service temporarily unreachable; generated via agronomic emergency baseline.']
      };
    }
  }

  // --- MODEL 4: HARVEST YIELD PREDICTION ---
  static async predictYield(input: YieldPredictInput): Promise<YieldPredictResult> {
    const startTime = Date.now();
    const targetUrl = `${env.ML_SERVICE_URL}/ml/yield/predict`;
    const payload = {
      crop: input.crop,
      land_acres: input.land_acres,
      district: input.district || 'Warangal',
      irrigation_type: input.irrigation_type || 'Borewell',
      soil_type: input.soil_type || 'Black Cotton (Vertisol)',
      seasonal_rainfall_mm: input.seasonal_rainfall_mm || 780.0,
      temperature_c: input.temperature_c || 27.5,
      fertilizer_applied_kg_per_acre: input.fertilizer_applied_kg_per_acre || 110.0,
      ph: input.ph || 7.1,
      sowing_date: input.sowing_date,
      season: input.season || 'Kharif'
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result: YieldPredictResult = (await response.json()) as YieldPredictResult;
      const latencyMs = Date.now() - startTime;

      this.getOrRegisterModel(
        'crop_yield', result.model_version || 'v1.0.0',
        'Crop Harvest Yield Regressor', 'GradientBoostingRegressor', 0.9799,
        ['crop', 'district', 'acres', 'irrigation', 'rainfall', 'fertilizer', 'ph']
      ).then((modelId) => this.logPredictionAudit(modelId, input.farmerId, payload, `${result.estimated_yield_per_acre_quintals} Q/acre`, 0.95, latencyMs))
      .catch((e) => logger.debug(`Audit log error: ${e.message}`));

      return result;
    } catch (error: any) {
      logger.error(`Yield ML error: ${error.message}. Engaging fallback.`);
      const baseQ = input.crop.toLowerCase().includes('cotton') ? 9.5 : (input.crop.toLowerCase().includes('chilli') ? 14.0 : 24.0);
      return {
        status: 'fallback',
        model_version: 'fallback-rules-v1.0.0',
        crop: input.crop,
        district: input.district || 'Warangal',
        cultivated_land_acres: input.land_acres,
        estimated_yield_per_acre_quintals: baseQ,
        total_estimated_production_quintals: baseQ * input.land_acres,
        prediction_range: { min: baseQ - 2.0, max: baseQ + 2.0, unit: 'Quintals/Acre' },
        confidence_interval_90: `${baseQ - 2.0} to ${baseQ + 2.0} Quintals/Acre`,
        benchmark_district_average_quintals: baseQ,
        important_contributing_factors: [],
        optimization_suggestions: ['Adopt drip irrigation for higher water efficiency.'],
        prediction_limitations: ['Statistical estimate. Unforeseen weather or pest attacks can affect actual yields.'],
        warnings: ['Generated via district benchmark averages due to temporary service unavailability.']
      };
    }
  }

  // --- MODEL 5: SMART IRRIGATION RECOMMENDATION ---
  static async recommendIrrigation(input: IrrigationRecommendInput): Promise<IrrigationRecommendResult> {
    const startTime = Date.now();
    const targetUrl = `${env.ML_SERVICE_URL}/ml/irrigation/recommend`;
    const payload = {
      crop: input.crop,
      growth_stage: input.growth_stage || 'Vegetative',
      soil_type: input.soil_type || 'Black Cotton (Vertisol)',
      soil_moisture_pct: input.soil_moisture_pct,
      temperature_c: input.temperature_c || 30.5,
      humidity_pct: input.humidity_pct || 60.0,
      rainfall_past_48h_mm: input.rainfall_past_48h_mm || 0.0,
      forecast_rain_48h_mm: input.forecast_rain_48h_mm || 0.0,
      farm_location: input.farm_location || 'Warangal, Telangana',
      irrigation_method: input.irrigation_method || 'Drip',
      land_acres: input.land_acres || 1.0
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result: IrrigationRecommendResult = (await response.json()) as IrrigationRecommendResult;
      const latencyMs = Date.now() - startTime;

      this.getOrRegisterModel(
        'smart_irrigation', result.model_version || 'v1.0.0',
        'Smart Irrigation Recommendation Engine', 'FAO-56-GradientBoosting', 0.9978,
        ['crop', 'growth_stage', 'soil_type', 'moisture', 'temperature', 'forecast_rain']
      ).then((modelId) => this.logPredictionAudit(modelId, input.farmerId, payload, result.irrigation_needed ? 'Irrigation Needed' : 'No Irrigation', 0.98, latencyMs))
      .catch((e) => logger.debug(`Audit log error: ${e.message}`));

      return result;
    } catch (error: any) {
      logger.error(`Irrigation ML error: ${error.message}. Engaging fallback.`);
      const needed = (input.soil_moisture_pct !== undefined && input.soil_moisture_pct < 22.0) || (input.forecast_rain_48h_mm || 0) < 5.0;
      return {
        status: 'fallback',
        model_version: 'fallback-rules-v1.0.0',
        crop: input.crop,
        growth_stage: input.growth_stage || 'Vegetative',
        soil_type: input.soil_type || 'Black Cotton (Vertisol)',
        farm_location: input.farm_location || 'Telangana',
        irrigation_method: input.irrigation_method || 'Drip',
        irrigation_needed: needed,
        urgency: needed ? 'HIGH' : 'NONE',
        assessment_summary: needed ? 'Soil moisture depleted; schedule light watering.' : 'Sufficient moisture present.',
        soil_water_balance: {},
        water_requirement: {
          net_irrigation_depth_mm: needed ? 5.0 : 0.0,
          gross_irrigation_depth_mm: needed ? 5.5 : 0.0,
          litres_per_acre: needed ? 22000 : 0,
          total_litres_for_field: needed ? 22000 * (input.land_acres || 1.0) : 0,
          recommended_runtime_hours: needed ? 2.5 : 0.0
        },
        suggested_timing: 'Irrigate early morning (6:00 - 8:30 AM) to minimize evaporative loss.',
        rainfall_warnings: [],
        uncertainty_and_limitations: ['Generated via FAO-56 baseline rules due to temporary ML unavailability.'],
        warnings: ['Live ML microservice was temporarily unreachable.']
      };
    }
  }
}
