# Kissan Mithar API Gateway (`port 4000`)

Single HTTP + WebSocket entry point for Web and Mobile clients, routing requests across all domain microservices under `services/` and `KM_360/`.

## Responsibilities
- JWT verification, RBAC enforcement, rate limiting, and CORS handling
- Request correlation (`x-request-id`) and HMAC-signed forwarding via `createGatewayProxy`
- Socket.IO real-time relay (`POST /internal/realtime/emit`)
- Admin orchestration (`/api/admin/*`, `/api/admin/system-health`)

## Downstream Services
- `media-service` (`4010`)
- `notification-service` (`4011`)
- `field-service` (`4012`)
- `marketplace-service` (`4013`)
- `agricultural-ai-service` (`4014`)
- `identity-service` (`4015`)
- `analytics-service` (`4016`)
- `ml-service` / `KM_360` (`8000`)

## Commands
- `npm run build`
- `npm test`
- `npm start`
