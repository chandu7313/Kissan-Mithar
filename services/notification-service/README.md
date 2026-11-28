# Kissan Mithar — Notification Service (`notification-service`)

Independent microservice owning farmer in-app notifications (`notifications`) and Firebase Cloud Messaging (FCM) push delivery.

## Endpoints

| Method | Path | Auth / RBAC | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Liveness & FCM mode check |
| `GET` | `/readiness` | Public | Prisma DB readiness check (`SELECT 1`) |
| `GET` | `/api/notifications` | `requireAuth` | Fetch farmer notifications |
| `PATCH` | `/api/notifications/:id/read` | `requireAuth` | Mark notification read |
| `PATCH` | `/api/notifications/read-all` | `requireAuth` | Mark all unread notifications read |
| `GET` | `/api/notifications/admin-stats` | `ADMIN` | Device & notification telemetry |
| `POST` | `/api/notifications/admin-broadcast` | `ADMIN` | Targeted announcement broadcast |
| `POST` | `/internal/notifications/send` | HMAC `x-service-signature` | Internal notification dispatch |

## Local Commands

```bash
npm install
npm run build
npm test
npm run dev
```
