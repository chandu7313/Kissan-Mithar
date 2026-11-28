# MIGRATION_PLAN.md — Strangler Fig Migration Roadmap

This plan executes a zero-downtime, incremental **Strangler Fig** migration from the Express monolith (`backend/`) into 9 independent domain microservices.

---

## Stage Overview & Gates

### Stage 1 — Architecture Audit *(Completed in this phase)*
- Inspect every route, controller, service, Prisma model, integration, background job, and deployment manifest.
- Produce the 9 architecture/migration documents.
- **Exit Gate:** Verified inventory (`CURRENT_BACKEND_AUDIT.md`, `CONTROLLER_SERVICE_MAPPING.md`, `DATABASE_OWNERSHIP.md`).

### Stage 2 — Infrastructure Foundation *(Implemented in this phase)*
- Add Request ID correlation middleware (`x-request-id`), `INTERNAL_SERVICE_SECRET` HMAC service auth, and `ServiceHttpClient` (with timeout, retries, and Strangler fallback) into `backend/src/gateway/`.
- Configure Gateway proxy routing hooks for extracted services while keeping all monolith routes intact when service URLs are unset.
- Establish containerized multi-service `docker-compose.platform.yml` local dev orchestration.
- **Exit Gate:** Gateway compiles (`npm run build`), preserves all existing endpoints when downstream services are disabled, and exposes request tracing headers.

### Stage 3 — Low-Risk Extractions: Media & Notification *(Implemented in this phase)*
1. **Extract `services/media-service`** (`upload.controller.ts` + `upload.service.ts`):
   - Standalone Express server, `/health`, `/readiness`, `/api/uploads/sign`, `/api/uploads/audio`, `/internal/audio`, Dockerfile, tests.
   - Refactor gateway + `FertilizerService` / `DiseaseService` / `LabourService` voice audio upload calls to route through `MediaClient` (calls `MEDIA_SERVICE_URL` when configured, falls back to local `UploadService` if disabled).
2. **Extract `services/notification-service`** (`notification.controller.ts` + `notification.service.ts`):
   - Standalone Express server, scoped Prisma client, Firebase Admin FCM dispatch, `/health`, `/readiness`, `/api/notifications/*`, `/internal/notifications/send`, Dockerfile, tests.
   - Refactor `NotificationService.sendNotification` callers (`Orchard`, `Consultation`, `Fertilizer`, `Disease`, `Labour`, `AgriBazaar`) to dispatch via `NotificationClient` when `NOTIFICATION_SERVICE_URL` is configured.
- **Exit Gate:** Independent `npm run build` and `npm test` pass in both `services/media-service` and `services/notification-service`, plus Gateway proxy integration tests pass against both live services.

### Stage 4 — Business Domain Extraction *(Planned Next)*
Extract core transactional domains into independent services under `services/`:
1. **`services/field-service`**: `expert`, `consultation`, `labour`, machinery booking, `collaboration` (gateway holds `/api/admin/collaborations` orchestration initially).
2. **`services/marketplace-service`**: `commerce`, `mandi`, `agriBazaar`.
3. **`services/agricultural-ai-service`**: `ai`, `advisory`, `disease`, `fertilizer`, `orchard`, `weather`. Refactor `ai/tools/registry.ts` so LLM tools call `Marketplace`, `Field`, `Weather`, `Mandi`, and `KM_360 ML` via authenticated REST clients rather than direct Prisma/service imports.
- **Exit Gate:** Transaction tests pass (cart -> order placement never executed by LLM directly), Socket.IO events relay cleanly via gateway internal emit hook, zero regression on web/mobile flows.

### Stage 5 — Identity & Farmer Service Migration *(Planned)*
1. Extract **`services/identity-service`** (`auth`, `farmer`, `device`, `sms`, `CleanupService`).
2. Expose `GET /internal/farmers/:id`, `GET /internal/devices`, `POST /internal/audit-logs`, and `POST /internal/auth/verify-token` for internal consumers.
3. Switch Notification Service from transitional `Device`/`Farmer`/`AuthAuditLog` DB access to Identity internal REST APIs.
- **Exit Gate:** All JWT, Phone OTP, Email OTP, Firebase verify, and RBAC tests pass (`test:auth-staff`).

### Stage 6 — Python ML Inference Service Hardening (`KM_360`) *(Planned)*
1. Package `KM_360` with service-to-service auth verification middleware (`x-service-signature` / API key), request ID propagation, Prometheus metrics, and container registry deployment.
2. Wire `services/agricultural-ai-service` exclusively via HTTP `MLClient` (`ML_SERVICE_URL`), keeping circuit-breaker rule fallbacks.
- **Exit Gate:** `pytest` suite passes inside `KM_360/` and end-to-end AI tool -> ML inference tests succeed.

### Stage 7 — Analytics Service & Production Hardening *(Planned)*
1. Extract **`services/analytics-service`** (`analytics.controller.ts` + `analytics.service.ts`).
2. Replace cross-domain direct table scans with read-optimized views / periodic domain snapshots or service aggregation APIs.
3. Introduce Redis (rate limiting + BullMQ broadcast queue + Socket.IO adapter) if multi-instance horizontal scaling is enabled, plus centralized log aggregation and alerting.
- **Exit Gate:** Full production load, health monitoring, and rollback drills verified.
