# Kissan Mithar — Media Service (`media-service`)

Independent microservice owning media asset upload signatures (Cloudinary) and voice recording persistence.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Liveness & Cloudinary configuration check |
| `GET` | `/readiness` | Public | Readiness probe |
| `POST` | `/api/uploads/sign` | JWT or signed Gateway user headers | Returns signed Cloudinary payload |
| `POST` | `/api/uploads/audio` | Public / Gateway | Saves voice audio (`http` URL, `data:audio/...`, or base64) |
| `POST` | `/internal/audio` | HMAC `x-service-signature` | Internal service-to-service audio upload endpoint |

## Local Commands

```bash
npm install
npm run build
npm test
npm run dev
```
