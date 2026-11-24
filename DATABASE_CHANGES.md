# Kissan Mithar Database Extension Specification
## Conversational AI, RAG pgvector, Commerce & ML Schema Extensions

---

### 1. Overview & Backward Compatibility Guarantee

The existing Kissan Mithar database consists of **22 models** supporting farmers, agronomists, staff RBAC, orchard planning, consultations, labour exchange, and the Agri-Bazaar marketplace.

**All existing tables, relations, and enums remain untouched.** 

This specification introduces additive extensions that support:
1. **Conversational Sessions & Chat Messages** (with interactive UI card metadata and multimodal media attachments).
2. **Farmer Memory & Context Store** (with explicit user consent tracking).
3. **Agricultural Knowledge Base & Chunks** (with PostgreSQL `pgvector` embeddings for semantic RAG retrieval).
4. **Conversational Commerce Ecosystem** (`ProductCatalog`, `Cart`, `CartItem`, `Order`, `OrderItem`, `PaymentTransaction`).
5. **Machine Learning Model Governance** (`MLModelRegistry`, `PredictionAuditLog`).

---

### 2. Schema Diff & New Models (`schema.prisma`)

```prisma
// ============================================================================
// EXTENSIONS TO EXISTING ENUMS & MODELS
// ============================================================================

// Extensions added to existing Farmer model:
// - memory            FarmerMemory?
// - sessions          ConversationSession[]
// - cart              Cart?
// - orders            Order[]
// - predictions       PredictionAuditLog[]

// ============================================================================
// 1. CONVERSATIONAL AI & SESSION MANAGEMENT
// ============================================================================

enum MessageSender {
  USER
  ASSISTANT
  SYSTEM
}

enum MessageContentType {
  TEXT
  VOICE
  IMAGE
  PRODUCT_CARD
  DIAGNOSIS_CARD
  BOOKING_CARD
  ORDER_CONFIRMATION
}

model ConversationSession {
  id              String         @id @default(uuid())
  farmerId        String
  title           String?        @default("New Farm Consultation")
  languageCode    String         @default("en") // "te", "hi", "en"
  isActive        Boolean        @default(true)
  metadata        Json?          // { channel: "APP" | "WEB", device: string }
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  farmer          Farmer         @relation(fields: [farmerId], references: [id], onDelete: Cascade)
  messages        ChatMessage[]

  @@index([farmerId])
  @@index([isActive])
  @@index([createdAt])
  @@map("conversation_sessions")
}

model ChatMessage {
  id              String             @id @default(uuid())
  sessionId       String
  sender          MessageSender
  contentType     MessageContentType @default(TEXT)
  text            String             @db.Text
  audioUrl        String?            // Voice recording or synthesized audio
  imageUrl        String?            // Leaf photo or soil report attachment
  toolCalls       Json?              // Executed tools [{ name, args, result }]
  uiCards         Json?              // Structured visual payload (products, diagnosis)
  tokensUsed      Int?               @default(0)
  createdAt       DateTime           @default(now())

  session         ConversationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([createdAt])
  @@map("chat_messages")
}

// ============================================================================
// 2. FARMER MEMORY & CONTEXT (WITH CONSENT)
// ============================================================================

model FarmerMemory {
  id               String   @id @default(uuid())
  farmerId         String   @unique
  consentGiven     Boolean  @default(false)
  consentTimestamp DateTime?
  
  // Structured agricultural profile
  soilType         String?
  totalLandAcres   Float?
  irrigationSource String?  // "Borewell", "Canal", "Rainfed", "Drip"
  farmLocationGps  Json?    // { latitude, longitude, village, mandal, district }
  activeCrops      Json?    // [{ crop: "Cotton", acreage: 3, stage: "Flowering", sowingDate: "2026-06-15" }]
  
  // Dynamic semantic memory key-values
  facts            Json?    // { "prefers_organic": true, "has_tractor": false, "past_pest_issues": ["Pink Bollworm"] }
  notes            String?  @db.Text
  updatedAt        DateTime @updatedAt

  farmer           Farmer   @relation(fields: [farmerId], references: [id], onDelete: Cascade)

  @@map("farmer_memories")
}

// ============================================================================
// 3. AGRICULTURAL RAG KNOWLEDGE BASE (PGVECTOR)
// ============================================================================

enum KnowledgeSourceType {
  ICAR_PUBLICATION
  STATE_AGRI_UNIVERSITY
  GOVT_DEPARTMENT
  RESEARCH_PAPER
  PRODUCT_LABEL
  VERIFIED_EXPERT
}

model KnowledgeDocument {
  id              String              @id @default(uuid())
  title           String
  sourceName      String              // e.g. "PJTSAU Rice Package of Practices 2026"
  sourceType      KnowledgeSourceType @default(STATE_AGRI_UNIVERSITY)
  sourceUrl       String?
  documentVersion String              @default("1.0")
  applicableCrops String[]            // ["Paddy", "Cotton", "Chilli"]
  applicableState String?             // "Telangana", "Andhra Pradesh", "All India"
  languageCode    String              @default("en")
  isVerified      Boolean             @default(true)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  chunks          KnowledgeChunk[]

  @@index([sourceType])
  @@index([applicableState])
  @@map("knowledge_documents")
}

model KnowledgeChunk {
  id              String            @id @default(uuid())
  documentId      String
  content         String            @db.Text
  metadata        Json?             // { section: "Pest Management", subCrop: "Bt Cotton" }
  chunkIndex      Int
  
  // Note: pgvector vector column is managed via Supabase raw SQL extension:
  // ALTER TABLE knowledge_chunks ADD COLUMN embedding vector(768);
  createdAt       DateTime          @default(now())

  document        KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@map("knowledge_chunks")
}

// ============================================================================
// 4. CONVERSATIONAL COMMERCE (CATALOG, CART, ORDERS, PAYMENTS)
// ============================================================================

enum ProductCategory {
  SEEDS
  FERTILIZERS
  ORGANIC_INPUTS
  CROP_PROTECTION_BIO
  CROP_PROTECTION_CHEMICAL
  FARM_MACHINERY_TOOLS
  IRRIGATION_EQUIPMENT
}

model ProductCatalog {
  id                String          @id @default(uuid())
  sku               String          @unique
  name              String
  brand             String
  category          ProductCategory
  technicalName     String?         // e.g. "Chlorantraniliprole 18.5% SC"
  npkRatio          String?         // e.g. "19:19:19" or "46-0-0"
  applicableCrops   String[]        // ["Cotton", "Chilli", "Paddy"]
  dosageGuide       String?         // "2ml per litre of water"
  packagingSize     String          // "1 Litre", "50 kg Bag", "500 ml"
  unit              String          // "Bottle", "Bag", "Pack"
  price             Float           // Selling Price in INR
  mrp               Float           // Maximum Retail Price in INR
  discountPercent   Float?          @default(0.0)
  stockQuantity     Int             @default(100)
  inStock           Boolean         @default(true)
  imageUrls         String[]
  description       String          @db.Text
  usageInstructions String?         @db.Text
  isOrganic         Boolean         @default(false)
  rating            Float           @default(4.7)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  cartItems         CartItem[]
  orderItems        OrderItem[]

  @@index([category])
  @@index([inStock])
  @@index([name])
  @@index([technicalName])
  @@map("product_catalog")
}

model Cart {
  id          String     @id @default(uuid())
  farmerId    String     @unique
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  farmer      Farmer     @relation(fields: [farmerId], references: [id], onDelete: Cascade)
  items       CartItem[]

  @@map("carts")
}

model CartItem {
  id          String         @id @default(uuid())
  cartId      String
  productId   String
  quantity    Int            @default(1)
  unitPrice   Float
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  cart        Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product     ProductCatalog @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([cartId, productId])
  @@index([cartId])
  @@map("cart_items")
}

enum OrderStatus {
  PLACED
  CONFIRMED
  PROCESSING
  DISPATCHED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  SUCCESS
  FAILED
  REFUNDED
}

enum PaymentMethod {
  CASH_ON_DELIVERY
  UPI
  RAZORPAY
  CREDIT_KISAN
}

model Order {
  id                 String              @id @default(uuid())
  orderNumber        String              @unique // e.g. "KM-ORD-2026-00492"
  farmerId           String
  totalAmount        Float
  discountAmount     Float               @default(0.0)
  deliveryFee        Float               @default(0.0)
  finalAmount        Float
  orderStatus        OrderStatus         @default(PLACED)
  paymentStatus      PaymentStatus       @default(PENDING)
  paymentMethod      PaymentMethod       @default(CASH_ON_DELIVERY)
  shippingAddress    Json                // { fullName, phone, addressLine, village, mandal, district, state, pincode }
  notes              String?
  placedAt           DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  farmer             Farmer              @relation(fields: [farmerId], references: [id], onDelete: Cascade)
  items              OrderItem[]
  payments           PaymentTransaction[]

  @@index([farmerId])
  @@index([orderStatus])
  @@index([orderNumber])
  @@map("orders")
}

model OrderItem {
  id          String         @id @default(uuid())
  orderId     String
  productId   String
  productName String
  packaging   String
  quantity    Int
  unitPrice   Float
  totalPrice  Float

  order       Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     ProductCatalog @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@map("order_items")
}

model PaymentTransaction {
  id                 String        @id @default(uuid())
  orderId            String
  transactionRef     String?       @unique // e.g. Razorpay payment_id
  amount             Float
  gateway            PaymentMethod
  status             PaymentStatus @default(PENDING)
  rawResponse        Json?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  order              Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([status])
  @@map("payment_transactions")
}

// ============================================================================
// 5. MACHINE LEARNING MODEL GOVERNANCE & AUDIT LOGS
// ============================================================================

model MLModelRegistry {
  id             String               @id @default(uuid())
  modelKey       String               @unique // e.g. "crop-recommendation-xgboost"
  name           String
  version        String               // "1.2.0"
  framework      String               // "Scikit-Learn", "XGBoost", "PyTorch"
  artifactPath   String               // S3 / disk path
  accuracyMetric Float                // 0.964
  features       Json                 // ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
  isActive       Boolean              @default(true)
  deployedAt     DateTime             @default(now())

  predictions    PredictionAuditLog[]

  @@map("ml_model_registry")
}

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

---

### 3. PostgreSQL `pgvector` Initialization Script

In Supabase PostgreSQL, vector embeddings are activated using the native `vector` extension:

```sql
-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add 768-dimension embedding vector column to knowledge_chunks (compatible with Gemini text-embedding-004)
ALTER TABLE "knowledge_chunks" 
ADD COLUMN IF NOT EXISTS "embedding" vector(768);

-- 3. Create an HNSW index for high-speed sub-millisecond approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS "knowledge_chunks_embedding_hnsw_idx" 
ON "knowledge_chunks" 
USING hnsw ("embedding" vector_cosine_ops);
```
