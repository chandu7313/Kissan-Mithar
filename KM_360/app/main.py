import os
import json
import time
import hmac
import hashlib
import uuid
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import router as ml_router

INTERNAL_SERVICE_SECRET = os.getenv(
    "INTERNAL_SERVICE_SECRET",
    "kissan_mithar_internal_service_secret_dev_2026",
)
REQUIRE_INTERNAL_AUTH = os.getenv("REQUIRE_INTERNAL_AUTH", "false").lower() == "true"

_PUBLIC_PATHS = {"/health", "/ml/health", "/readiness", "/metrics", "/models", "/ml/models", "/docs", "/openapi.json", "/redoc"}
_METRICS = {"requests_total": 0, "errors_total": 0, "total_inference_ms": 0.0}

app = FastAPI(
    title="KM 360 — Agricultural Intelligence Machine Learning Microservice",
    description="Production-grade ML inference API for KM 360: Crop Recommendation, Soil Analysis, Fertilizer Decision Support, Crop Disease Diagnosis, Harvest Yield Prediction, and Smart Irrigation.",
    version="1.2.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_tracing_and_service_auth(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    start_time = time.perf_counter()

    if REQUIRE_INTERNAL_AUTH and request.method != "OPTIONS" and request.url.path not in _PUBLIC_PATHS:
        service_name = request.headers.get("x-service-name", "")
        timestamp = request.headers.get("x-service-timestamp", "")
        signature = request.headers.get("x-service-signature", "")

        valid = False
        try:
            ts_ms = int(timestamp)
            now_ms = int(time.time() * 1000)
            if service_name and abs(now_ms - ts_ms) <= 5 * 60 * 1000:
                payload = f"{service_name}:{timestamp}:{request.method.upper()}:{request.url.path}"
                expected = hmac.new(
                    INTERNAL_SERVICE_SECRET.encode("utf-8"),
                    payload.encode("utf-8"),
                    hashlib.sha256,
                ).hexdigest()
                valid = hmac.compare_digest(signature, expected)
        except Exception:
            valid = False

        if not valid:
            return JSONResponse(
                status_code=403,
                content={
                    "success": False,
                    "error": {
                        "message": "Forbidden: Valid internal service signature required",
                        "statusCode": 403,
                        "requestId": request_id,
                    },
                },
                headers={"x-request-id": request_id},
            )

    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
    _METRICS["requests_total"] += 1
    _METRICS["total_inference_ms"] += elapsed_ms
    if response.status_code >= 500:
        _METRICS["errors_total"] += 1

    response.headers["x-request-id"] = request_id
    response.headers["x-inference-ms"] = str(elapsed_ms)
    return response


@app.get("/readiness")
def readiness_check():
    return {"ready": True, "service": "KM 360", "version": "1.2.0"}


@app.get("/metrics")
def ml_metrics():
    total = _METRICS["requests_total"]
    avg_ms = round(_METRICS["total_inference_ms"] / total, 2) if total > 0 else 0.0
    return {
        "service": "KM 360",
        "requests_total": total,
        "errors_total": _METRICS["errors_total"],
        "avg_inference_ms": avg_ms,
        "require_internal_auth": REQUIRE_INTERNAL_AUTH,
    }

def get_loaded_models_registry():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "models")
    model_keys = ["crop_recommendation", "soil_fertilizer", "crop_disease", "crop_yield", "smart_irrigation"]
    registry_summary = {}

    for key in model_keys:
        reg_file = os.path.join(models_dir, key, "registry.json")
        if os.path.exists(reg_file):
            try:
                with open(reg_file, "r") as f:
                    registry_summary[key] = json.load(f)
            except Exception:
                registry_summary[key] = {"status": "registered", "version": "v1.0.0"}
        else:
            registry_summary[key] = {"status": "active", "version": "v1.0.0"}
    return registry_summary

# Health Check Endpoints
@app.get("/health")
@app.get("/ml/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KM 360",
        "project": "KM 360",
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

# Model Registry Endpoints
@app.get("/models")
@app.get("/ml/models")
def get_models_catalog():
    return {
        "status": "success",
        "service": "KM 360",
        "active_models_count": 5,
        "models": get_loaded_models_registry()
    }

# Mount ML Endpoints
# 1. Primary KM 360 ML route prefix: /ml (e.g. POST /ml/crop/recommend)
app.include_router(ml_router, prefix="/ml", tags=["KM 360 Agricultural Intelligence"])

# 2. Versioned API route prefix: /api/v1/ml (e.g. POST /api/v1/ml/crop/recommend)
app.include_router(ml_router, prefix="/api/v1/ml", tags=["Agricultural ML Models"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
