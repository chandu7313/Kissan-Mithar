# Kissan Mithar — API Compatibility & Migration Guide

## 1. Overview & Strategy

This document details the API migration strategy from the legacy monolithic/Vercel server to **AWS Lambda (Docker container) + Amazon API Gateway HTTP API**.

### Zero Breaking Changes Guarantee
- **100% Endpoint Contract Preservation**: Every route path, HTTP method, header requirement, request payload structure, and response schema remains identical.
- **Identical Base Prefix**: All endpoints remain served under `/api/*` (e.g., `https://<api-gateway-id>.execute-api.ap-south-1.amazonaws.com/api/*` or `https://api.kissanmithar.in/api/*`).
- **Added Root Health Probes**: `/health` is now also available directly at the root URL (without `/api` prefix) for automated AWS Route53 and uptime monitoring probes.

---

## 2. API Contract & Route Inventory

All endpoints preserve their existing status codes, error models, and RBAC rules.

### 2.1 Authentication & Profile (`/api/auth`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/verify` | Public (Rate-limited) | Login / register with phone number (alias `/login`) |
| `POST` | `/api/auth/send-email-otp` | Public (OTP rate-limited) | Send 6-digit email OTP for expert/admin |
| `POST` | `/api/auth/verify-email-otp`| Public (OTP rate-limited) | Verify email OTP and return JWT session |
| `POST` | `/api/auth/send-phone-otp` | Public (OTP rate-limited) | Send SMS OTP via Fast2SMS |
| `POST` | `/api/auth/verify-phone-otp`| Public (OTP rate-limited) | Verify SMS OTP and authenticate |
| `POST` | `/api/auth/login-password` | Public (Rate-limited) | Authenticate expert/admin via bcrypt password |
| `POST` | `/api/auth/reset-password` | Public | Reset password using verified OTP |
| `POST` | `/api/auth/logout` | Public | Stateless session invalidation |
| `PATCH`| `/api/auth/profile` | `requireAuth` (Any) | Update user profile details |
| `GET`  | `/api/auth/audit-logs` | `requireAuth`, `ADMIN` | Fetch audit logs for security oversight |

### 2.2 Farmers (`/api/farmers`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `GET`  | `/api/farmers/me` | `requireAuth` (Any) | Retrieve logged-in farmer's profile |
| `PATCH`| `/api/farmers/me` | `requireAuth` (Any) | Update logged-in farmer's profile |
| `GET`  | `/api/farmers/` | `requireAuth`, `EXPERT`, `ADMIN` | List all registered farmers |

### 2.3 Uploads & Media (`/api/uploads`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `POST` | `/api/uploads/sign` | `requireAuth` (Any) | Generate signed Cloudinary upload params |
| `POST` | `/api/uploads/audio`| Public | Upload voice recording note directly |

### 2.4 Orchard Planning (`/api/orchard-requests`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `POST` | `/api/orchard-requests` | `requireAuth` (Any) | Submit a new orchard planning request |
| `GET`  | `/api/orchard-requests` | `requireAuth` (Any) | List requests (with in-memory caching) |
| `GET`  | `/api/orchard-requests/my-requests` | `requireAuth` (Any) | List farmer's own orchard requests |
| `GET`  | `/api/orchard-requests/:id` | `requireAuth` (Any) | Get request details & generated report |
| `PATCH`| `/api/orchard-requests/:id/status` | `requireAuth`, `EXPERT`, `ADMIN` | Update request progression status |
| `PATCH`| `/api/orchard-requests/:id/details`| `requireAuth`, `EXPERT`, `ADMIN` | Update orchard survey details |
| `POST` | `/api/orchard-requests/:id/report` | `requireAuth`, `EXPERT`, `ADMIN` | Submit expert orchard plan report |

### 2.5 Expert Consultations (`/api/consultations`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `POST` | `/api/consultations` | `requireAuth` (Any) | Book a new expert consultation |
| `GET`  | `/api/consultations` | `requireAuth` (Any) | List consultations |
| `GET`  | `/api/consultations/:id` | `requireAuth` (Any) | View specific consultation details |
| `PATCH`| `/api/consultations/:id` | `requireAuth`, `EXPERT`, `ADMIN` | Update notes and status |

### 2.6 Notifications & Devices (`/api/notifications`, `/api/devices`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `GET`  | `/api/notifications` | `requireAuth` (Any) | List user notifications |
| `PATCH`| `/api/notifications/:id/read` | `requireAuth` (Any) | Mark single notification as read |
| `PATCH`| `/api/notifications/read-all` | `requireAuth` (Any) | Mark all notifications as read |
| `POST` | `/api/devices` | `requireAuth` (Any) | Register FCM push device token |

### 2.7 Agricultural Weather (`/api/weather`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `GET`  | `/api/weather` | `optionalAuth` | Live weather forecast & farmer advisory |

### 2.8 Mandi Prices & Crop Advisories (`/api/mandi-prices`, `/api/advisories`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `GET`  | `/api/mandi-prices` | Public | Real-time market commodity prices |
| `GET`  | `/api/mandi-prices/commodities` | Public | List available commodity names |
| `POST` | `/api/mandi-prices` | `requireAuth`, `ADMIN` | Publish updated mandi prices |
| `GET`  | `/api/advisories` | Public | Public seasonal crop advisories |
| `POST` | `/api/advisories` | `requireAuth`, `EXPERT`, `ADMIN` | Create crop advisory bulletin |

### 2.9 Fertilizer Guide (`/api/fertilizer-requests` & `/api/fertilizer-guide`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `GET`  | `/api/fertilizer-requests/catalog` | Public (Cached) | Common fertilizer dosage catalog |
| `POST` | `/api/fertilizer-requests` | `optionalAuth` | Submit fertilizer advisory request |
| `GET`  | `/api/fertilizer-requests` | `requireAuth` (Any) | List fertilizer requests |
| `GET`  | `/api/fertilizer-requests/my-requests` | `requireAuth` (Any) | List farmer's own requests |
| `GET`  | `/api/fertilizer-requests/:id` | `requireAuth` (Any) | Request details & dosage plan |
| `PATCH`| `/api/fertilizer-requests/:id/status` | `requireAuth`, `EXPERT`, `ADMIN` | Update request status |
| `POST` | `/api/fertilizer-requests/:id/assign` | `requireAuth`, `EXPERT`, `ADMIN` | Assign request to agricultural expert |
| `POST` | `/api/fertilizer-requests/:id/plan` | `requireAuth`, `EXPERT`, `ADMIN` | Issue official fertilizer plan |
| `DELETE`| `/api/fertilizer-requests/:id` | `requireAuth` (Owner/Admin) | Delete fertilizer request |

### 2.10 Crop Disease Help (`/api/disease-requests` & `/api/disease-help`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `GET`  | `/api/disease-requests/catalog` | Public (Cached) | Crop disease reference guide |
| `POST` | `/api/disease-requests` | `optionalAuth` | Submit crop disease photo & description |
| `GET`  | `/api/disease-requests` | `requireAuth` (Any) | List disease requests |
| `GET`  | `/api/disease-requests/my-requests` | `requireAuth` (Any) | List farmer's own requests |
| `GET`  | `/api/disease-requests/:id` | `requireAuth` (Any) | View diagnosis & treatment plan |
| `PATCH`| `/api/disease-requests/:id/status` | `requireAuth`, `EXPERT`, `ADMIN` | Update disease diagnosis status |
| `POST` | `/api/disease-requests/:id/assign` | `requireAuth`, `EXPERT`, `ADMIN` | Assign to plant pathologist |
| `POST` | `/api/disease-requests/:id/treatment`| `requireAuth`, `EXPERT`, `ADMIN` | Attach treatment prescription |
| `DELETE`| `/api/disease-requests/:id` | `requireAuth` (Owner/Admin) | Delete disease request |

### 2.11 Agricultural Labour Discovery (`/api/labour-requests` & `/api/labour-help`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `GET`  | `/api/labour-requests/catalog` | Public (Cached) | Labour work type catalog |
| `POST` | `/api/labour-requests` | `optionalAuth` | Post farm labour requirement |
| `GET`  | `/api/labour-requests` | `requireAuth` (Any) | List labour requests |
| `GET`  | `/api/labour-requests/my-requests` | `requireAuth` (Any) | Farmer's own labour postings |
| `GET`  | `/api/labour-requests/:id` | `requireAuth` (Any) | Details & worker allocations |
| `PATCH`| `/api/labour-requests/:id/status` | `requireAuth`, `EXPERT`, `ADMIN` | Update labour request status |
| `POST` | `/api/labour-requests/:id/assign` | `requireAuth`, `EXPERT`, `ADMIN` | Assign coordinator |
| `POST` | `/api/labour-requests/:id/allocations` | `requireAuth`, `EXPERT`, `ADMIN` | Add labourer allocation |
| `PATCH`| `/api/labour-requests/:id/allocations/:allocationId` | `requireAuth` | Update worker count / wage |
| `DELETE`| `/api/labour-requests/:id/allocations/:allocationId`| `requireAuth` | Remove worker allocation |
| `DELETE`| `/api/labour-requests/:id` | `requireAuth` (Owner/Admin) | Cancel labour request |

### 2.12 Agri Bazaar (`/api/agri-bazaar` & `/api/crop-buying-selling`)
| HTTP Method | Route | Auth / Role | Description |
|---|---|---|---|
| `POST` | `/api/agri-bazaar/listings` | `optionalAuth` | Create seller crop listing |
| `GET`  | `/api/agri-bazaar/listings` | `optionalAuth` | Browse seller crop listings |
| `GET`  | `/api/agri-bazaar/listings/:id` | `optionalAuth` | View single listing |
| `PUT`  | `/api/agri-bazaar/listings/:id` | `optionalAuth` | Update seller listing |
| `DELETE`| `/api/agri-bazaar/listings/:id` | `optionalAuth` | Delete seller listing |
| `POST` | `/api/agri-bazaar/requests` | `optionalAuth` | Post buyer crop purchase request |
| `GET`  | `/api/agri-bazaar/requests` | `optionalAuth` | Browse buyer crop requests |
| `GET`  | `/api/agri-bazaar/requests/:id` | `optionalAuth` | View single request |
| `GET`  | `/api/agri-bazaar/requests/:id/history` | `optionalAuth` | Request timeline history |
| `PUT`  | `/api/agri-bazaar/requests/:id` | `optionalAuth` | Update buyer request |
| `PATCH`| `/api/agri-bazaar/requests/:id` | `optionalAuth` | Partial update buyer request |
| `DELETE`| `/api/agri-bazaar/requests/:id` | `optionalAuth` | Cancel buyer request |
| `PATCH`| `/api/agri-bazaar/requests/:id/status` | `requireAuth`, `ADMIN`, `EXPERT` | Manage transaction status |
| `GET`  | `/api/agri-bazaar/requests/:id/matches`| `requireAuth`, `ADMIN`, `EXPERT` | Find matching listings |
| `POST` | `/api/agri-bazaar/requests/:id/match` | `requireAuth`, `ADMIN`, `EXPERT` | Create buyer-seller match |
| `PATCH`| `/api/agri-bazaar/matches/:matchId` | `requireAuth`, `ADMIN`, `EXPERT` | Update match status |

### 2.13 Operational Probes
| HTTP Method | Route | Auth | Description |
|---|---|---|---|
| `GET`  | `/health` | None | AWS API Gateway / Route53 root probe |
| `GET`  | `/api/health` | None | API health probe with DB connectivity check |
| `GET`  | `/api/readiness` | None | Readiness probe (returns 503 if DB disconnected) |

---

## 3. Frontend Switchover (Vercel & Flutter)

### 3.1 Vercel Frontend Cutover Steps
The React + Vite frontend uses `VITE_API_URL` to establish API calls.

1. **Verify Lambda deployment**:
   ```bash
   curl -s https://<api-id>.execute-api.ap-south-1.amazonaws.com/health
   # Expected response: {"status":"healthy", ...}
   ```
2. **Update Vercel Environment Variables**:
   - Go to your Vercel Dashboard → Project Settings → **Environment Variables**.
   - Update `VITE_API_URL`:
     ```
     VITE_API_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/api
     ```
     *(Or `https://api.kissanmithar.in/api` if custom domain is bound)*
   - Save and trigger a new deployment (Deployments → Redeploy).

### 3.2 Flutter Mobile App Cutover Steps
The Flutter app uses `API_BASE_URL` in its `.env` configuration (`lib/core/config/env_config.dart`).

1. Open `kissan_mithar_app/.env`
2. Update:
   ```properties
   API_BASE_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/api
   ```
3. Rebuild and test release APK / iOS bundle.

---

## 4. Rollback Plan
If any unforeseen issue occurs with the AWS Lambda deployment:
1. Revert `VITE_API_URL` in Vercel to the previous backend URL (e.g. `https://kissan-mithar-app.vercel.app/api`).
2. Trigger an immediate Vercel redeployment.
3. The previous backend continues running undisturbed.
