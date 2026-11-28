# Kissan Mithar — Field Services & Booking Service (`field-service`)

Independent microservice owning expert profiles, agronomy consultations, farm labour management & allocations, machinery availability, and partnership collaborations.

## Endpoints

| Prefix | Ownership | Description |
| --- | --- | --- |
| `/health`, `/readiness` | Public | Liveness & Prisma DB readiness probes |
| `/api/experts` | Authenticated (`ADMIN`, `EXPERT`) | Expert directory & staff provisioning |
| `/api/consultations` | Authenticated | Farmer-expert scheduling & prescriptions |
| `/api/labour-requests`, `/api/labour-help` | Mixed (`optionalAuth` create/catalog, auth reads/admin) | Farm labour requests, wage guidelines & worker allocations |
| `/api/collaborations`, `/api/partnerships` | Public | B2B/FPO/Agri-input partnership proposal intake |
| `/api/admin/collaborations` | Staff RBAC | Admin partnership review, verification, notes & KPIs |
| `/internal/machinery/availability` | HMAC internal | Machinery booking availability lookup |

## Local Commands

```bash
npm install
npm run build
npm test
npm run dev
```
