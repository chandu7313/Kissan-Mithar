# 🌾 Kisan Mithar - Production Backend Service

A high-performance **Node.js + Express + TypeScript + PostgreSQL (Prisma ORM)** backend powering the **Kisan Mithar** mobile application.

---

## 🏗️ Architecture & Features

- **Authentication & Security**:
  - `POST /api/auth/verify`: Verifies Firebase ID Tokens via Firebase Admin SDK and issues secure custom JWTs.
  - Role-Based Access Control (RBAC) with three distinct roles: `FARMER`, `EXPERT`, `ADMIN`.
  - Rate limiting via `express-rate-limit` & HTTP hardening via `helmet`.
- **Cloudinary Signed Uploads**:
  - `POST /api/uploads/sign`: Server-side signed signature generation enabling secure direct photo/audio uploads from the mobile app without exposing API secrets.
- **Orchard Survey & Planning Workflow**:
  - `POST /api/orchard-requests`: Farmers submit land surveys, photos, and soil details.
  - `PATCH /api/orchard-requests/:id/status`: Expert/Admin role-restricted status transitions (`SUBMITTED` ➔ `UNDER_REVIEW` ➔ `EXPERT_ASSIGNED` ➔ `PLAN_READY` ➔ `COMPLETED`).
  - `POST /api/orchard-requests/:id/report`: Generation of custom PDF-linked horticultural reports with spacing, fertilization, and budget estimates.
- **FCM Push Notifications & In-App Activity**:
  - Automatic push dispatch via `firebase-admin` messaging on survey status updates and consultation scheduling.
  - Stores all notifications in PostgreSQL `Notification` table for offline retrieval (`GET /api/notifications`).
- **Weather Proxy & Agriculture Alerts Engine**:
  - `GET /api/weather?lat=&lng=`: 10-minute in-memory caching with rule engine generating timely agricultural alerts (e.g., *"Delay Spraying — Heavy Rain Alert"* or *"High Heatwave Advisory"*).
- **Consultation Booking & History**:
  - `POST /api/consultations`: Books voice, video, or chat agronomy sessions with audio note and image attachments.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or Supabase connection string)

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```

### 4. Database Setup & Seed
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with sample farmers, experts, orchard surveys, and reports
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:4000/api`.

---

## 🧪 Automated Testing
Run the complete end-to-end API test suite:
```bash
npm test
```

---

## 📑 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Health check & uptime |
| `POST` | `/api/auth/verify` | None | Verify Firebase token & get JWT |
| `GET` | `/api/farmers/me` | Bearer JWT | Get authenticated farmer profile |
| `PATCH` | `/api/farmers/me` | Bearer JWT | Update farmer profile & language |
| `POST` | `/api/uploads/sign` | Bearer JWT | Get signed Cloudinary upload params |
| `POST` | `/api/orchard-requests` | Farmer JWT | Submit land survey for planning |
| `GET` | `/api/orchard-requests` | Bearer JWT | List orchard surveys |
| `GET` | `/api/orchard-requests/:id` | Bearer JWT | Get survey details & report |
| `PATCH` | `/api/orchard-requests/:id/status` | Expert/Admin | Advance survey status |
| `POST` | `/api/orchard-requests/:id/report` | Expert/Admin | Create final orchard layout report |
| `POST` | `/api/consultations` | Farmer JWT | Book agronomy consultation |
| `GET` | `/api/consultations` | Bearer JWT | List consultation history |
| `GET` | `/api/consultations/:id` | Bearer JWT | Get consultation details |
| `GET` | `/api/notifications` | Bearer JWT | List in-app notifications |
| `PATCH` | `/api/notifications/:id/read` | Bearer JWT | Mark notification as read |
| `PATCH` | `/api/notifications/read-all` | Bearer JWT | Mark all notifications as read |
| `POST` | `/api/devices` | Bearer JWT | Register device FCM token |
| `GET` | `/api/weather` | Optional | Proxy weather & agriculture alerts |
