# CURRENT_BACKEND_AUDIT.md — Kissan Mithar Backend Audit

> **Scope:** Ground-truth audit of `/Volumes/My Files/Projects/Kissan Mithar/backend` and `/Volumes/My Files/Projects/Kissan Mithar/KM_360` prior to Strangler Fig microservices extraction.

---

## 1. Runtime & Deployment Inventory

| Component | Entry Point | Runtime / Packaging | Notes |
| --- | --- | --- | --- |
| **HTTP + WebSocket Server** | `backend/src/server.ts` | Node.js 20 + Express + Socket.IO | Pre-warms Prisma DB, starts `CleanupService` timer, attaches Socket.IO |
| **Vercel Serverless Entry** | `backend/api/index.ts` | `@vercel/node` (`backend/vercel.json`) | Wraps Express `createApp()`, no WebSocket persistence |
| **AWS Lambda Monolith Fallback** | `backend/src/lambda.ts` | `@codegenie/serverless-express` + Docker (`backend/Dockerfile`) | Serves `/{proxy+}` and `/` via HTTP API Gateway |
| **AWS Lambda Modular Handlers** | `backend/src/handlers/*.handler.ts` | Shared Docker image (`backend/Dockerfile`) | Currently 7 route-sliced Lambda handlers + 1 EventBridge cleanup handler sharing one codebase and DB client |
| **EC2 / Container Server** | `backend/Dockerfile.ec2`, `ecosystem.config.cjs`, `nginx/` | Docker / PM2 cluster | Nginx reverse proxy to port `4000` with `/socket.io/` upgrade |
| **Python ML Service (`KM_360`)** | `KM_360/app/main.py` | Python 3.11 + FastAPI + Uvicorn (`KM_360/Dockerfile.ml`) | Already separated on port `8000`; mounted at `/ml` and `/api/v1/ml` |

---

## 2. Codebase Component Counts (Verified)

- **Route Modules:** `21` domain route files + `src/routes/index.ts`
- **Controllers:** `20` controller files in `backend/src/controllers/` (note: `agriBazaar.controller.ts` was present in addition to the 19 named in the prompt)
- **Services:** `31` files in `backend/src/services/` (`22` root service files + `9` under `src/services/ai/`)
- **Prisma Schema (`backend/prisma/schema.prisma`):** `29` models, `17` enums on Supabase PostgreSQL
- **Shared Middleware:** `auth.ts` (`requireAuth`, `optionalAuth`), `rbac.ts` (`requireRole`, `requireStaffRole`), `errorHandler.ts` (`AppError`, Prisma/Zod/JWT error mapping), `rateLimiter.ts` (`globalLimiter`, `otpSendLimiter`, `otpVerifyLimiter`, `authLimiter`), `validate.ts` (`validateRequest`), `cache.ts` (in-memory `Map` TTL cache)

---

## 3. Complete Route & Controller Inventory

| Route Prefix (`src/routes/index.ts`) | Route File | Controller | Auth / RBAC |
| --- | --- | --- | --- |
| `/api/health`, `/api/readiness` | `index.ts` | Inline | Public (runs `SELECT 1`) |
| `/api/auth` | `auth.routes.ts` | `AuthController` | Mixed: OTP/login rate-limited public; `/profile` auth; `/audit-logs` `ADMIN` |
| `/api/farmers` | `farmer.routes.ts` | `FarmerController` | `requireAuth`; list/dossier `EXPERT`/`ADMIN`; admin patch `ADMIN` |
| `/api/experts` | `expert.routes.ts` | `expert.controller.ts` | `requireAuth`; `GET` `ADMIN`/`EXPERT`; `POST` `ADMIN` |
| `/api/devices` | `device.routes.ts` | `DeviceController` | `requireAuth` |
| `/api/notifications` | `notification.routes.ts` | `NotificationController` | `requireAuth`; `/admin-stats` & `/admin-broadcast` require `ADMIN` |
| `/api/uploads` | `upload.routes.ts` | `UploadController` | `/sign` requires `requireAuth`; `/audio` currently open |
| `/api/admin` | `admin.routes.ts` | `AdminController` | `requireAuth` + `requireRole('ADMIN')` |
| `/api/weather` | `weather.routes.ts` | `WeatherController` | `optionalAuth` |
| `/api/mandi-prices` | `mandi.routes.ts` | `MandiController` | `GET` public; `POST` requires `ADMIN` |
| `/api/advisories` | `advisory.routes.ts` | `AdvisoryController` | `GET` & `POST /crop-recommend` public; `POST /` `EXPERT`/`ADMIN` |
| `/api/analytics` | `analytics.routes.ts` | `AnalyticsController` | `requireAuth` + `requireRole('EXPERT', 'ADMIN')` + in-memory cache |
| `/api/orchard-requests` | `orchard.routes.ts` | `OrchardController` | `requireAuth`; status/details/report `EXPERT`/`ADMIN` |
| `/api/consultations` | `consultation.routes.ts` | `ConsultationController` | `requireAuth`; `PATCH /:id` `EXPERT`/`ADMIN` |
| `/api/fertilizer-requests`, `/api/fertilizer-guide` | `fertilizer.routes.ts` | `FertilizerController` | `POST` `optionalAuth`; reads `requireAuth`; mutations `EXPERT`/`ADMIN` |
| `/api/disease-requests`, `/api/disease-help` | `disease.routes.ts` | `DiseaseController` | `GET /catalog` public; `POST` `optionalAuth`; reads `requireAuth`; mutations `EXPERT`/`ADMIN` |
| `/api/labour-requests`, `/api/labour-help` | `labour.routes.ts` | `LabourController` | `GET /catalog` public; `POST` `optionalAuth`; reads `requireAuth`; allocations/mutations `EXPERT`/`ADMIN` |
| `/api/agri-bazaar`, `/api/crop-buying-selling` | `agriBazaar.routes.ts` | `AgriBazaarController` | `optionalAuth` for public listings/requests; matching & status `ADMIN`/`EXPERT` |
| `/api/collaborations`, `/api/partnerships` | `collaboration.routes.ts` | `CollaborationController` | Public `POST /` B2B partnership intake |
| `/api/admin/collaborations` | `adminCollaboration.routes.ts` | `CollaborationController` | `requireAuth` + `requireStaffRole('SUPER_ADMIN', 'SYSTEM_ADMIN', 'OPERATIONS_MANAGER', 'BUSINESS_ANALYST')` |
| `/api/ai` | `ai.routes.ts` | `AIController` | `optionalAuth` (`chat`, `sessions`) |
| `/api/commerce` | `commerce.routes.ts` | `CommerceController` | `GET /products` public; cart/checkout/orders `optionalAuth` |

---

## 4. Audit Findings & Architectural Risks

### 4.1 Cross-Domain Service Coupling (Direct In-Process Calls)
1. **Agronomy & Field Services -> Notification + Media + Socket.IO:**
   - `FertilizerService`, `DiseaseService`, and `LabourService` import `UploadService.saveAudio()`, `NotificationService.sendNotification()`, and `getIO()`.
   - `OrchardService`, `ConsultationService`, and `AgriBazaarService` import `NotificationService.sendNotification()`, and `OrchardService` / `AgriBazaarService` emit via `getIO()`.
2. **Agricultural AI Orchestrator -> Market, Weather, Commerce, ML:**
   - `src/services/ai/tools/registry.ts` directly imports `MandiPriceService`, `WeatherService`, `MLService`, `RAGService`, and queries `prisma.productCatalog` directly.
   - `AdvisoryController.recommendCrop` calls `MLService.recommendCrop()`, which writes directly to `MLModelRegistry` and `PredictionAuditLog`.
3. **Controllers Directly Importing Prisma:**
   - `agriBazaar.controller.ts`, `ai.controller.ts`, `disease.controller.ts`, `fertilizer.controller.ts`, and `labour.controller.ts` import `prisma` directly instead of delegating strictly to services.
4. **Shared Security Audit & Read-Fanout Queries:**
   - `AuthService`, `AdminService`, and `NotificationService` all write directly to `AuthAuditLog`.
   - `AnalyticsService.getExecutiveSummary()` queries across `Farmer`, `Device`, `OrchardRequest`, `FertilizerRequest`, `DiseaseRequest`, `LabourRequest`, `Consultation`, `AgriProductListing`, `AgriProductRequest`, `AgriProductRequestMatch`, `Admin`, and `Expert` in one process.
   - `NotificationService` reads `Farmer` and `Device` (for targeted broadcasts and device tokens) and writes to `Notification` and `AuthAuditLog`.

### 4.2 Feature & Domain Audits
- **Machinery:** Currently exists as an AI assistant tool (`book_machinery` in `src/services/ai/tools/registry.ts`) returning availability cards with `/services/machinery/confirm` metadata rather than a standalone Prisma model/controller. It belongs cleanly inside **Field Services & Booking Service**.
- **Collaboration (`collaboration.controller.ts` + `adminCollaboration.routes.ts`):** Audited `collaboration.service.ts` and `schema.prisma` (`CollaborationRequest`, `CollaborationAuditLog`, `CollaborationInternalNote`). It is an **external organization / Agri-input / FPO partnership proposal intake and multi-stage admin verification & review workflow** (`KM-COL-*`), distinct from farmer field operations, though mapped under Field Services / Partnership Operations until traffic justifies a dedicated partner portal.
- **Pre-existing In-Memory State:** `middleware/rateLimiter.ts` and `middleware/cache.ts` use process-local memory `Map`s, which do not share state across horizontal microservice instances (acceptable for transitional gateway; Redis can back rate limiting later).

### 4.3 External Integrations
- **Database:** Supabase PostgreSQL via PgBouncer transaction pooler (`port 6543`, `pgbouncer=true`).
- **Push & Auth:** Firebase Admin SDK (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`; mock mode disabled in production).
- **Media Storage:** Cloudinary (`cloudinary` v2 signed uploads + server-side base64 audio upload, fallback to local `/uploads/voice` or `/tmp/uploads/voice` on Lambda).
- **SMS OTP:** Fast2SMS (`sms.service.ts`).
- **Weather:** OpenWeatherMap (`weather.service.ts`).
- **LLMs:** Google Gemini (`gemini.provider.ts`, with `MockAgronomicProvider` fallback).
- **Payments:** Razorpay config present in `env.ts`; `Order` / `PaymentTransaction` models exist in Prisma.

### 4.4 Background Jobs & Real-Time Events
- **Scheduled Hygiene:** `CleanupService` deletes expired/used `EmailOtp` records (`>1h`) and `AuthAuditLog` entries (`>90d`) every 6 hours (`setInterval` in `server.ts`, AWS EventBridge in `cleanup-handler.ts`).
- **WebSockets (`Socket.IO`):** Maintains `room:admins`, `room:experts`, `room:staff`, and `expert:<expertId>` authenticated rooms for live admin/expert dashboard updates. Must stay hosted in a stateful Gateway or dedicated WebSocket service (not Vercel serverless).
