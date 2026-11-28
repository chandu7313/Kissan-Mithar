# Kissan Mithar — Marketplace Service (`marketplace-service`)

Independent microservice owning agri-input product catalog & orders (`commerce`), APMC Mandi pricing (`mandi-prices`), and AgriBazaar farmer-buyer procurement (`agri-bazaar`).

## Endpoints

| Prefix | Ownership | Description |
| --- | --- | --- |
| `/health`, `/readiness` | Public | Liveness & Prisma DB readiness probes |
| `/api/commerce/*` | Public catalog + `optionalAuth` cart/orders | Products, cart, checkout & orders |
| `/api/mandi-prices/*` | Public reads + `ADMIN` upsert | Commodity market rates & trends |
| `/api/agri-bazaar/*`, `/api/crop-buying-selling/*` | `optionalAuth` + `ADMIN`/`EXPERT` matching | Farmer produce supply, buyer procurement requests & matching |

## Local Commands

```bash
npm install
npm run build
npm test
npm run dev
```
