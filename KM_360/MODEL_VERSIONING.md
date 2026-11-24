# KM 360 — Model Versioning, Governance & Audit Logging

## 1. Model Versioning Scheme

KM 360 adheres to **Semantic Versioning for Machine Learning (ML-SemVer)**:
`vMAJOR.MINOR.PATCH`

* **MAJOR:** Retraining on new agro-ecological data partitions, changes in input feature requirements, or altered output schemas.
* **MINOR:** Algorithm hyperparameter tuning, addition of regional rules, or incremental accuracy improvements.
* **PATCH:** Bug fixes, security patches, or updated package dependency versions.

### Directory Structure:
```
models/
├── crop_recommendation/
│   ├── registry.json
│   └── v1.2.0/
│       ├── crop_recommendation_pipeline.joblib
│       └── evaluation_report.json
├── soil_fertilizer/
│   ├── registry.json
│   └── v1.0.0/
│       ├── soil_fertility_pipeline.joblib
│       └── evaluation_report.json
├── crop_disease/
│   ├── registry.json
│   └── v1.0.0/
│       ├── crop_disease_pipeline.joblib
│       └── evaluation_report.json
├── crop_yield/
│   ├── registry.json
│   └── v1.0.0/
│       ├── crop_yield_pipeline.joblib
│       └── evaluation_report.json
└── smart_irrigation/
    ├── registry.json
    └── v1.0.0/
        ├── irrigation_pipeline.joblib
        └── evaluation_report.json
```

---

## 2. PostgreSQL Governance Schema (`MLModelRegistry`)

Model versions deployed to production are tracked in Supabase PostgreSQL:

```prisma
model MLModelRegistry {
  id             String               @id @default(uuid())
  modelKey       String               @unique // e.g. crop_recommendation_v1.2.0
  name           String
  version        String
  framework      String
  artifactPath   String
  accuracyMetric Float
  features       Json
  isActive       Boolean              @default(true)
  deployedAt     DateTime             @default(now())

  predictions    PredictionAuditLog[]

  @@map("ml_model_registry")
}
```

---

## 3. Privacy-Preserving Prediction Audit Logging (`PredictionAuditLog`)

Every inference request executed by the Node.js backend client (`MLService`) is asynchronously logged into `prediction_audit_logs`.

### Privacy Protection Standards:
* **No PII:** Farmer names, phone numbers, Aadhaar numbers, and survey numbers are strictly excluded from audit payloads.
* **Sanitized Features:** Only agronomic variables ($N, P, K, \text{pH}, \text{temperature}, \text{soil\_type}$) are retained for drift detection and model retraining.
* **Non-Blocking:** Logging is dispatched in background promises so audit persistence failures never delay or block the farmer's chat response.

```prisma
model PredictionAuditLog {
  id             String          @id @default(uuid())
  modelId        String
  farmerId       String?
  inputFeatures  Json
  outputLabel    String
  confidence     Float
  latencyMs      Int
  createdAt      DateTime        @default(now())

  model          MLModelRegistry @relation(fields: [modelId], references: [id], onDelete: Cascade)
  farmer         Farmer?         @relation(fields: [farmerId], references: [id], onDelete: SetNull)

  @@index([modelId])
  @@index([farmerId])
  @@index([createdAt])
  @@map("prediction_audit_logs")
}
```
