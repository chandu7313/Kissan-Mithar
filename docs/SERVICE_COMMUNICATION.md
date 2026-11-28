# SERVICE_COMMUNICATION.md — Inter-Service Communication & Reliability

## 1. Communication Patterns

| Pattern | Mechanism | Use Cases |
| --- | --- | --- |
| **Synchronous Client -> Gateway** | HTTPS / REST JSON + Socket.IO WebSockets | Frontend web (`web/`) & Flutter mobile app (`kissan_mithar_app/`) |
| **Synchronous Gateway -> Microservice** | HTTP/REST via `ServiceHttpClient` (`backend/src/gateway/serviceClient.ts`) | Forwarding `/api/uploads/*`, `/api/notifications/*`, and domain APIs |
| **Synchronous Service -> Service** | Authenticated internal REST (`/internal/*`) | Domain services calling Media Service (`POST /internal/audio`), AI calling ML/Marketplace/Field/Weather |
| **Asynchronous Notifications & Realtime** | Non-blocking HTTP dispatch + Event queue ready (BullMQ/Redis or EventBridge optional) | Push notifications (`POST /internal/notifications/send`), Socket.IO dashboard updates, Analytics telemetry |

---

## 2. Authentication & Security Model

### 2.1 External Authentication (Edge / Gateway)
1. Client sends `Authorization: Bearer <JWT>` to the **API Gateway**.
2. Gateway validates the JWT using `JWT_SECRET` and evaluates RBAC rules (`FARMER`, `EXPERT`, `ADMIN`, `staffRole`).
3. Gateway forwards the original `Authorization` header **plus** verified user context headers (`x-user-id`, `x-user-role`, `x-farmer-id`, `x-expert-id`) signed by service auth.

### 2.2 Internal Service-to-Service Authentication
Internal endpoints (`/internal/*`) and proxied calls include:
- **`x-service-name`**: Caller identifier (e.g., `api-gateway`, `agronomy-service`).
- **`x-service-timestamp`**: Unix epoch milliseconds.
- **`x-service-signature`**: HMAC-SHA256 of `${serviceName}:${timestamp}:${method}:${path}` using `INTERNAL_SERVICE_SECRET` (with constant-time verification and 5-minute replay window), OR exact shared `x-internal-service-token` verified in middleware (`requireInternalService`).
- **Rule:** Never expose `INTERNAL_SERVICE_SECRET` to the frontend or internet-facing routes; strip incoming external `x-service-*` and `x-user-*` headers at the API Gateway before forwarding.

---

## 3. Request Tracing, Timeouts & Retries

### 3.1 Distributed Request Correlation
- Every incoming request receives a UUID `x-request-id` at the Gateway (preserving an existing header if valid).
- `x-request-id` is attached to every response header, every Pino structured log entry (`reqId`), and every downstream `ServiceHttpClient` call.

### 3.2 Timeouts & Retry Policy
- **Default Gateway -> Microservice timeout:** `5000ms` (Media audio/AI inference configurable up to `15000ms`–`30000ms`).
- **Retries:** Automatic exponential backoff (`150ms`, `400ms`) ONLY on **idempotent methods (`GET`, `HEAD`, `OPTIONS`)** or requests carrying an **`Idempotency-Key`**, and ONLY on transient transport errors (`ECONNRESET`, `ETIMEDOUT`, HTTP `502`, `503`, `504`). Never blind-retry mutating `POST` requests without idempotency keys.

---

## 4. Idempotency & Consistent Error Contract

### 4.1 Idempotency
- Sensitive mutating operations (`checkout`, `payment`, `admin-broadcast`, `notification send`) accept `Idempotency-Key` headers.
- Gateway propagates `Idempotency-Key` downstream. Services key replay caches or unique constraints (`transactionRef`, `orderNumber`) to prevent duplicate side effects.

### 4.2 Standardized Error Envelope
All services return the exact Kissan Mithar error shape expected by existing web and Flutter clients:
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "statusCode": 400,
    "code": "VALIDATION_ERROR",
    "requestId": "550e8400-e29b-41d4-a71d-446655440000",
    "timestamp": "2026-11-28T14:00:00.000Z"
  }
}
```

---

## 5. Async Queue & Real-Time Evaluation (No Over-Engineering)

- **Why not Kafka:** Current traffic patterns (farmer advisory submissions, FCM push notifications, OTPs, order status updates) do not require Kafka's broker/Zookeeper/KRaft operational overhead.
- **Stage 3 Pattern:** Non-blocking fire-and-forget HTTP `POST /internal/notifications/send` with bounded timeout (`3000ms`) and automatic in-process Strangler fallback preserves exact resilience.
- **Stage 7 / High-Volume Broadcast Option:** Introduce **Redis + BullMQ** (or **AWS SQS**) specifically for:
  1. Large admin FCM broadcasts (`>500` devices)
  2. Retryable delivery queues when Firebase/SMS providers experience temporary outages
  3. Cross-instance Socket.IO Redis adapter (`@socket.io/redis-adapter`) when scaling the API Gateway horizontally.
