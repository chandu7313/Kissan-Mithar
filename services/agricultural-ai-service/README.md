# Kissan Mithar — Agricultural AI Service (`agricultural-ai-service`)

Independent microservice owning conversational AI orchestration, RAG retrieval, farmer memory, crop advisories, weather, disease diagnosis, fertilizer schedules, orchard planning, and KM 360 ML client integration.

## Endpoints

| Prefix | Ownership | Description |
| --- | --- | --- |
| `/health`, `/readiness` | Public | Liveness, LLM mode & Prisma DB readiness probes |
| `/api/ai/*` | `optionalAuth` | Conversational multi-agent assistant & sessions |
| `/api/advisories/*` | Public reads + ML `/crop-recommend` + `EXPERT`/`ADMIN` create | Crop advisories & ML crop suitability |
| `/api/disease-requests/*`, `/api/disease-help/*` | Mixed | Pathology catalog, inquiries & treatment plans |
| `/api/fertilizer-requests/*`, `/api/fertilizer-guide/*` | Mixed | Agronomic fertilizer catalog, inquiries & plans |
| `/api/orchard-requests/*` | Authenticated | Orchard surveys & plantation ROI reports |
| `/api/weather` | `optionalAuth` | Open-Meteo weather & spraying alerts |

## Local Commands

```bash
npm install
npm run build
npm test
npm run dev
```
