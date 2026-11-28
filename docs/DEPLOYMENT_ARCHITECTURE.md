# DEPLOYMENT_ARCHITECTURE.md — Hosting, Containers & Production Topology

## 1. Hybrid Deployment Strategy

Not every service fits Vercel serverless functions (30s–60s cold timeouts, no persistent Socket.IO WebSockets, large Python ML models in `KM_360`). Kissan Mithar uses a **hybrid deployment model**:

| Tier | Workload | Recommended Platform | Rationale |
| --- | --- | --- | --- |
| **Frontend Web** | `web/` (React + Vite) | **Vercel** | Existing setup; global edge CDN + instant preview deployments |
| **API Gateway + Socket.IO** | `backend/` | **AWS ECS Fargate / EC2 + Nginx** *(or AWS Lambda HTTP API for REST + EC2 for Socket.IO)* | Needs low latency routing, WebSockets (`/socket.io/`), and predictable cold-start performance |
| **Node Microservices** (`media`, `notification`, `field`, `marketplace`, `ai`, `identity`, `analytics`) | `services/*` | **Docker Containers (AWS ECS Fargate / Cloud Run / Railway)** OR **AWS Lambda Containers (SAM)** | Independent Dockerfiles allow deploying each service on containers or Lambda independently |
| **Python ML Inference** (`KM_360/`) | FastAPI + Scikit-Learn/XGBoost | **Dedicated Container Service (AWS ECS Fargate / EC2 / Render / Cloud Run, min 1 warm instance)** | Avoids ML model cold starts (`joblib` artifacts loaded into RAM at boot) |
| **Database** | PostgreSQL | **Supabase PostgreSQL (`ap-southeast-2`)** via PgBouncer (`6543`) | Managed Postgres, zero data migration risk |

---

## 2. Local Development Topology (`docker-compose.platform.yml`)

```text
React Web (localhost:5173) / Mobile App
         │
         ▼
   API Gateway (localhost:4000) ──► Socket.IO ws://localhost:4000
         │
         ├── /api/uploads/*        ──► Media Service (localhost:4010)
         ├── /api/notifications/*  ──► Notification Service (localhost:4011)
         ├── /ml/* (via AI/ML)     ──► KM_360 Python ML (localhost:8000)
         └── Remaining /api/*      ──► Transitional Monolith Modules (Strangler fallback)
```

---

## 3. Networking & Secrets Matrix

### 3.1 Network Segmentation
- Only **Vercel Frontend** and the **API Gateway** (HTTPS port `443`) are exposed to the public internet.
- Extracted microservices (`media-service`, `notification-service`, `KM_360`, etc.) run on a **private VPC subnet / Docker bridge network** (`kissan-platform-net`) and only accept traffic from the API Gateway or authorized peer services using `INTERNAL_SERVICE_SECRET`.

### 3.2 Environment & Secret Ownership

| Service | Required Environment Variables / Secrets |
| --- | --- |
| **API Gateway (`backend/`)** | `PORT`, `NODE_ENV`, `JWT_SECRET`, `CORS_ORIGINS`, `DATABASE_URL` *(transitional)*, `INTERNAL_SERVICE_SECRET`, `MEDIA_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`, `ML_SERVICE_URL`, `GATEWAY_STRICT_PROXY` |
| **Media Service (`services/media-service`)** | `PORT=4010`, `INTERNAL_SERVICE_SECRET`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`, `PUBLIC_BASE_URL` |
| **Notification Service (`services/notification-service`)** | `PORT=4011`, `DATABASE_URL`, `INTERNAL_SERVICE_SECRET`, `JWT_SECRET`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `MOCK_FIREBASE_AUTH` |
| **ML Inference (`KM_360/`)** | `PORT=8000`, `INTERNAL_SERVICE_SECRET` *(Stage 6)* |

> **Security Rule:** Never store API keys, private keys, or database passwords in source code or Docker images. Always pass them via runtime secret managers (AWS Secrets Manager / SSM Parameter Store / ECS Task env / Vercel Env) or `.env` files ignored by Git.
