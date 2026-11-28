# Identity & Farmer Microservice

Independently deployable identity, authentication, farmer profile, device registration, SMS OTP, and cleanup microservice for the Kissan Mithar platform.

## Port
Default: `4015`

## Responsibilities
- Firebase OTP, Email OTP, Password login, Registration, JWT issuance & profile updates (`/api/auth/*`)
- Farmer self-service profile, dossier, directory & status (`/api/farmers/*`)
- FCM Device token registration (`/api/devices/*`)
- Scheduled cleanup of expired OTPs and stale audit logs (`CleanupService`)
- Internal service REST APIs for peer microservices (`/internal/farmers/*`, `/internal/devices/*`, `/internal/audit-logs`)

## Health Endpoints
- `GET /health`
- `GET /api/health`
- `GET /readiness`

## Commands
- `npm run build`
- `npm test`
- `npm start`
