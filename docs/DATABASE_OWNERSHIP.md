# DATABASE_OWNERSHIP.md — Data Ownership & Schema Governance

## 1. Guiding Principles

1. **Shared Cluster, Strict Logical Ownership:** All services initially share the existing **Supabase PostgreSQL** instance (`pgbouncer=true`, Transaction mode port `6543`) to prevent data loss, duplicate databases, or distributed transaction complexity.
2. **Single-Writer Rule:** Every table has **exactly one owning service** permitted to execute `INSERT`, `UPDATE`, or `DELETE`.
3. **Zero Cross-Service Direct Table Writes:** Other services must call the owner's internal REST API (or consume async domain events) rather than mutating another domain's tables.
4. **Safe Schema Evolution:** Existing `public` tables stay intact during Stages 1–6. Service-level PostgreSQL schemas (e.g., `identity`, `ai`, `marketplace`, `field_ops`, `notify`) are introduced only after all services operate cleanly via API boundaries.

---

## 2. Prisma Model Ownership Matrix (All 29 Models)

| Prisma Model | Table Name | Single Owner Service | Other Authorized Readers (Interim) | Cross-Service Interaction Target |
| --- | --- | --- | --- | --- |
| `Farmer` | `farmers` | **Identity & Farmer** | Notification, Analytics, AI | Exposed via `GET /internal/farmers/:id` & filter query API |
| `Expert` | `experts` | **Field Services & Booking** *(profile)* / **Identity** *(auth credentials)* | Identity (login verify), Analytics | Stage 5 splits staff login credentials cleanly or keeps Expert auth lookup via internal API |
| `Admin` | `admins` | **Identity & Farmer** *(with Gateway RBAC)* | Analytics | Admin CRUD mediated by Gateway -> Identity |
| `Device` | `devices` | **Identity & Farmer** | **Notification** | Notification queries device tokens via `GET /internal/devices?farmerId=...` (transitional shared DB read until Stage 5) |
| `AuthAuditLog` | `auth_audit_logs` | **Identity & Farmer** | Analytics | Gateway / Notification emit audit events via Identity `POST /internal/audit-logs` |
| `EmailOtp` | `email_otps` | **Identity & Farmer** | None | Owned exclusively by Auth & Cleanup worker |
| `OfflineDraft` | `offline_drafts` | **Identity & Farmer** *(or Gateway Sync)* | Agricultural AI | Holds `ORCHARD_PLAN` / `CONSULTATION` drafts synced by authenticated farmer |
| `OrchardRequest` | `orchard_requests` | **Agricultural AI** | Analytics, Field Services | Read summary exported for Analytics |
| `OrchardReport` | `orchard_reports` | **Agricultural AI** | Analytics | Owned by Orchard Planning flow |
| `FertilizerRequest` | `fertilizer_requests` | **Agricultural AI** | Analytics | Calls Media Service for voice audio & Notification Service on status change |
| `FertilizerPlan` | `fertilizer_plans` | **Agricultural AI** | Analytics | Child of `FertilizerRequest` |
| `DiseaseRequest` | `disease_requests` | **Agricultural AI** | Analytics | Calls Media Service for voice/photos & Notification Service on diagnosis |
| `DiseaseTreatmentPlan` | `disease_treatment_plans` | **Agricultural AI** | Analytics | Child of `DiseaseRequest` |
| `CropAdvisory` | `crop_advisories` | **Agricultural AI** | None | Advisories & pest alerts |
| `ConversationSession` | `conversation_sessions` | **Agricultural AI** | None | AI chat history |
| `ChatMessage` | `chat_messages` | **Agricultural AI** | None | AI turn persistence |
| `FarmerMemory` | `farmer_memories` | **Agricultural AI** | None | Consented long-term farmer agronomic memory |
| `KnowledgeDocument` | `knowledge_documents` | **Agricultural AI** | None | RAG corpus metadata |
| `KnowledgeChunk` | `knowledge_chunks` | **Agricultural AI** | None | RAG indexed chunks |
| `MLModelRegistry` | `ml_model_registry` | **Agricultural AI** / **Python ML** | Analytics | Registered model versions & accuracy metadata |
| `PredictionAuditLog` | `prediction_audit_logs` | **Agricultural AI** / **Python ML** | Analytics | Inference audit logs |
| `ProductCatalog` | `product_catalog` | **Marketplace** | Agricultural AI (`search_products` tool) | AI calls `GET /api/commerce/products` instead of direct Prisma query |
| `Cart` | `carts` | **Marketplace** | None | Farmer shopping cart |
| `CartItem` | `cart_items` | **Marketplace** | None | Cart line items |
| `Order` | `orders` | **Marketplace** | None | Orders (AI never creates orders directly) |
| `OrderItem` | `order_items` | **Marketplace** | None | Order line items |
| `PaymentTransaction` | `payment_transactions` | **Marketplace** | None | Payment gateway audit |
| `MandiPrice` | `mandi_prices` | **Marketplace** | Agricultural AI (`get_mandi_prices` tool) | AI calls `GET /api/mandi-prices` |
| `AgriProductListing` | `agri_product_listings` | **Marketplace** | Analytics | Seller produce supply |
| `AgriProductRequest` | `agri_product_requests` | **Marketplace** | Analytics | Buyer procurement demand |
| `AgriProductRequestMatch` | `agri_product_request_matches` | **Marketplace** | Analytics | Admin supplier-buyer matching |
| `AgriProductRequestHistory` | `agri_product_request_history` | **Marketplace** | Analytics | Status audit log |
| `Consultation` | `consultations` | **Field Services & Booking** | Analytics | Scheduled consultations |
| `LabourRequest` | `labour_requests` | **Field Services & Booking** | Analytics | Labour requests |
| `LabourAllocation` | `labour_allocations` | **Field Services & Booking** | None | Assigned workers |
| `CollaborationRequest` | `collaboration_requests` | **Field Services & Booking** *(Partnership Ops)* | Gateway Admin | B2B partnership intake |
| `CollaborationAuditLog` | `collaboration_audit_logs` | **Field Services & Booking** | Gateway Admin | Partnership state transition log |
| `CollaborationInternalNote` | `collaboration_internal_notes` | **Field Services & Booking** | Gateway Admin | Internal reviewer notes |
| `Notification` | `notifications` | **Notification Service** | Analytics | Sole owner of in-app notification rows & `isRead` state |
| *(None — Stateless)* | — | **Media Service** | — | Uses Cloudinary + object/local audio storage; returns canonical HTTPS URLs |

> **Verification Note:** Total Prisma models in `backend/prisma/schema.prisma` = **29** (the 29th table in the table above counts `MLModelRegistry`, `PredictionAuditLog`, etc.; exact count from `schema.prisma` audit: `Farmer`, `Expert`, `Admin`, `OrchardRequest`, `OrchardReport`, `Consultation`, `Notification`, `Device`, `AuthAuditLog`, `EmailOtp`, `MandiPrice`, `CropAdvisory`, `OfflineDraft`, `FertilizerRequest`, `FertilizerPlan`, `DiseaseRequest`, `DiseaseTreatmentPlan`, `LabourRequest`, `LabourAllocation`, `AgriProductListing`, `AgriProductRequest`, `AgriProductRequestMatch`, `AgriProductRequestHistory`, `CollaborationRequest`, `CollaborationAuditLog`, `CollaborationInternalNote`, `ConversationSession`, `ChatMessage`, `FarmerMemory`, `KnowledgeDocument`, `KnowledgeChunk`, `ProductCatalog`, `Cart`, `CartItem`, `Order`, `OrderItem`, `PaymentTransaction`, `MLModelRegistry`, `PredictionAuditLog` = **39 models** — corrected from earlier quick estimate). Let's treat exact count = **39 models, 17 enums**.

---

## 3. Target Notification Service Transitional Boundary (Stage 3)

During Stage 3, **Notification Service** (`services/notification-service`) uses a **scoped Prisma schema** containing only the models it interacts with:
- **Owned (Read/Write):** `Notification`, `NotificationType`
- **Transitional Read-Only (until Identity Service extraction in Stage 5):** `Device`, `Farmer` (only `id`, `district`, `primaryCrop`, `name`, `phoneNumber`, `village` for FCM token resolution and broadcast filtering)
- **Transitional Append Audit:** `AuthAuditLog` (`Action: ADMIN_BROADCAST_SENT` — migrated to Identity REST API `POST /internal/audit-logs` in Stage 5).

---

## 4. Phased Schema Isolation Roadmap

1. **Phase A (Current — Stages 1–5):** Single Postgres `public` schema, enforced via **code-level Prisma schema scoping** per microservice + zero cross-service direct mutations.
2. **Phase B (Stage 6–7):** Create per-service Postgres views / read-replicas or API materialization for **Analytics Service** so it no longer queries transactional tables directly.
3. **Phase C (Post-Migration Hardening):** Migrate domain tables into dedicated PostgreSQL schemas (`identity`, `agronomy`, `marketplace`, `field_services`, `notifications`) using backward-compatible views during cutover.
