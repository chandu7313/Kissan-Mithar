# ROLLBACK_PLAN.md — Instant Rollback & Disaster Recovery Plan

Every Strangler Fig extraction is gated by **runtime feature flags** in the API Gateway so traffic can be reverted in **under 30 seconds** without redeploying databases or rolling back schema changes.

---

## 1. Per-Service Instant Traffic Rollback

The transitional API Gateway (`backend/`) checks service URL environment variables on every routed call:

| Extracted Service | Enabling Variable | Instant Rollback Action | Fallback Behavior |
| --- | --- | --- | --- |
| **Media Service** | `MEDIA_SERVICE_URL` | Unset `MEDIA_SERVICE_URL` (or set empty `""`) and restart/reload Gateway | Gateway serves `/api/uploads/*` and internal `UploadService.saveAudio()` directly in-process |
| **Notification Service** | `NOTIFICATION_SERVICE_URL` | Unset `NOTIFICATION_SERVICE_URL` (or set empty `""`) and restart/reload Gateway | Gateway serves `/api/notifications/*` and `NotificationService.sendNotification()` in-process |
| **Automatic Circuit Fallback** *(Dev / Transitional Mode)* | `GATEWAY_FALLBACK_ON_DOWN=true` | Automatically enabled by default in non-strict mode | If an extracted service times out or fails (`502/503/ECONNREFUSED`), Gateway logs a warning with `requestId` and falls back to the legacy module cleanly |

> Set `GATEWAY_STRICT_PROXY=true` in production staging once a microservice has passed soak testing and you want strict isolation (fail-fast `502/504` rather than silent monolith fallback).

---

## 2. Database Safety & Schema Rollback

1. **Zero Destructive Drops:** No tables, columns, or enums are dropped or renamed during Stages 1–6. Both old monolith modules and extracted services use the same table definitions (`notifications`, `devices`, `farmers`, `auth_audit_logs`).
2. **Rollback Safe:** Because `NotificationService` writes identical rows to `public.notifications` and `public.auth_audit_logs`, rolling traffic back to the monolith requires **zero database migration or backfill**.

---

## 3. Container & AWS Lambda Rollback

- **Docker Compose / ECS:** Keep the previous container image tag (`:prev`) or revert `docker compose up -d api-gateway` with the service URL env var cleared.
- **AWS CloudFormation / SAM:**
  ```bash
  # Check deployed stack events
  aws cloudformation describe-stack-events --stack-name kissan-mithar-backend --region ap-southeast-2
  # Revert to previous template/image by checking out previous commit and re-running:
  sam build && sam deploy --config-file samconfig.toml
  ```
- **Vercel Frontend:** No frontend changes are coupled to backend extraction stages; `VITE_API_URL` continues pointing to the API Gateway.
