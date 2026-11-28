# Analytics & Telemetry Microservice

Independently deployable platform analytics, dashboard KPI aggregation, and service-level metrics microservice for the Kissan Mithar platform.

## Port
Default: `4016`

## Endpoints
- `GET /health` & `GET /api/health`
- `GET /readiness`
- `GET /metrics` — Service-level request telemetry & memory metrics
- `GET /api/analytics/summary` (EXPERT / ADMIN)
- `GET /api/analytics/executive-summary` (EXPERT / ADMIN)

## Commands
- `npm run build`
- `npm test`
- `npm start`
