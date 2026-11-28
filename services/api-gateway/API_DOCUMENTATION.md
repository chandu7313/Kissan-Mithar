# API_DOCUMENTATION.md — Gateway & Extracted Microservice Contracts

## 1. Public API Gateway Surface (Unchanged External Contract)

Base URL: `<GATEWAY_ORIGIN>/api` (and `/health`, `/readiness`)

### Core Standardized Headers
- `Authorization: Bearer <JWT>` (for authenticated Farmer / Expert / Admin routes)
- `x-request-id: <uuid>` (returned on every Gateway & microservice response for tracing)
- `Idempotency-Key: <key>` (optional; propagated for safe retries on mutating calls)

---

## 2. Extracted Microservice #1 — Media Service (`services/media-service`)

Default local port: `4010` | Detailed docs: `services/media-service/README.md`

### Public / Gateway-Proxied Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Service liveness check (`service: "kissan-mithar-media-service"`) |
| `GET` | `/readiness` | Public | Verifies Cloudinary / filesystem storage readiness |
| `POST` | `/api/uploads/sign` | `requireAuth` (User JWT or forwarded context) | Generates signed Cloudinary direct-upload signature `{ timestamp, signature, apiKey, cloudName, folder }` |
| `POST` | `/api/uploads/audio` | Optional / Gateway | Stores voice audio (base64/data URL or URL) to Cloudinary (prod) or `/uploads/voice` fallback |
| `GET` | `/uploads/*` | Public static | Serves locally saved audio files in dev/fallback mode |

### Internal Service-to-Service Endpoints (`requireInternalService`)

| Method | Path | Caller | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/internal/audio` | Agricultural AI / Field Services | `{ "audioData": "data:audio/webm;base64,...", "filename": "optional.webm" }` | `{ "success": true, "data": { "url": "...", "filename": "...", "size": 1234 } }` |

---

## 3. Extracted Microservice #2 — Notification Service (`services/notification-service`)

Default local port: `4011` | Detailed docs: `services/notification-service/README.md`

### Public / Gateway-Proxied Endpoints

| Method | Path | Auth / RBAC | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Service liveness check (`service: "kissan-mithar-notification-service"`) |
| `GET` | `/readiness` | Public | Verifies Supabase PostgreSQL connectivity (`SELECT 1`) |
| `GET` | `/api/notifications?limit=20` | `requireAuth` | Lists authenticated farmer's notifications ordered newest first |
| `PATCH` | `/api/notifications/:id/read` | `requireAuth` | Marks single notification read for authenticated farmer |
| `PATCH` | `/api/notifications/read-all` | `requireAuth` | Marks all unread notifications read for authenticated farmer |
| `GET` | `/api/notifications/admin-stats` | `requireAuth` + `ADMIN` | Device platform counts, unread stats, and recent 50 notifications |
| `POST` | `/api/notifications/admin-broadcast` | `requireAuth` + `ADMIN` | Targeted announcement broadcast (`ALL`, `DISTRICT`, `CROP`) in batches of 100 DB rows + 500 FCM tokens |

### Internal Service-to-Service Endpoints (`requireInternalService`)

| Method | Path | Caller | Request Body | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/internal/notifications/send` | Agronomy / Field / Marketplace / Gateway | `{ "farmerId": "uuid", "title": "...", "body": "...", "type": "INFO\|ALERT\|SUCCESS\|CONSULTATION\|MARKET", "deepLink": "...", "data": {} }` | `{ "success": true, "data": { "id": "uuid", ... } }` |

---

## 4. Python ML Inference Service (`KM_360/`, port `8000`)

Detailed contract: `KM_360/ML_API_DOCUMENTATION.md`
- `GET /health`, `GET /ml/health`
- `POST /ml/crop/recommend`
- `POST /ml/soil/analyze`
- `POST /ml/fertilizer/recommend`
- `POST /ml/disease/predict`
- `POST /ml/yield/predict`
- `POST /ml/irrigation/recommend`
