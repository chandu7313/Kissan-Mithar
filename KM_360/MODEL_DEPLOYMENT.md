# KM 360 — Model Deployment Guide

## 1. Local & Development Execution

```bash
# 1. Navigate to the KM_360 microservice directory
cd "/Volumes/My Files/Projects/Kissan Mithar/KM_360"

# 2. Activate Python 3.13 virtual environment
source .venv/bin/activate

# 3. Launch Uvicorn ASGI server with hot-reloading
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 2. Production Docker Deployment

The service is packaged using `Dockerfile.ml`:

```dockerfile
FROM python:3.13-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency requirements
COPY requirements.txt pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy microservice application source and model artifacts
COPY app/ ./app/
COPY models/ ./models/
COPY data/ ./data/

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/ml/health || exit 1

# Production multi-worker execution via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Building & Running the Container:
```bash
# Build Docker image
docker build -t kissanmithar/km-360:v1.2.0 -f Dockerfile.ml .

# Run container
docker run -d --name km-360-service -p 8000:8000 --restart always kissanmithar/km-360:v1.2.0
```

---

## 3. Node.js Backend Integration Setup

In the Node.js backend (`backend/.env`), set:
```env
ML_SERVICE_URL="http://localhost:8000"
```

For production Kubernetes or Docker-Compose:
```env
ML_SERVICE_URL="http://km-360-service:8000"
```

---

## 4. Operational Monitoring & Health Probes

* **Liveness Probe:** `GET /ml/health` (resumes in < 5ms).
* **Readiness Probe:** `GET /ml/models` (verifies model artifact existence).
* **Latency Profile:**
  * Tabular Models (Crop, Soil, Yield, Irrigation): **~12–18 ms**.
  * Vision Model (Disease Image upload & Laplacian check): **~35–65 ms**.
* **Memory Footprint:** ~180MB RAM per worker process.
