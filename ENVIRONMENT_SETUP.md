# Kissan Mithar Environment Configuration & Setup Guide
## Multi-Platform AI & Conversational Commerce Configuration

---

### 1. Unified Environment Matrix

#### 1.1 Backend Configuration (`/backend/.env`)

```ini
# ==============================================================================
# ENVIRONMENT & CORE HTTP CONFIGURATION
# ==============================================================================
NODE_ENV=development
PORT=4000
API_PREFIX=/api
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# ==============================================================================
# DATABASE (SUPABASE POSTGRESQL WITH PGBOUNCER)
# ==============================================================================
# Transaction Pooler (Port 6543) for high concurrency
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct Connection (Port 5432) for Prisma Migrations
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

# ==============================================================================
# SECURITY & AUTHENTICATION
# ==============================================================================
JWT_SECRET="kissan_mithar_jwt_super_secret_key_2026_dev_min32char"
JWT_EXPIRES_IN="30d"

# Firebase Admin SDK (Farmer Phone Auth & Push Notifications)
FIREBASE_PROJECT_ID="kissan-mithar-app"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@kissan-mithar.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----\n"
MOCK_FIREBASE_AUTH=false

# SMS Gateway (Fast2SMS / Twilio)
SMS_PROVIDER="FAST2SMS"
SMS_API_KEY="your_fast2sms_api_key_here"

# ==============================================================================
# AI PROVIDERS & MULTI-AGENT ENGINE
# ==============================================================================
# Primary LLM Provider: Google Gemini
GEMINI_API_KEY="your_google_gemini_api_key_here"
GEMINI_MODEL="gemini-1.5-pro"
GEMINI_EMBEDDING_MODEL="text-embedding-004"

# Fallback LLM Provider: OpenAI
OPENAI_API_KEY="your_openai_api_key_here"
OPENAI_MODEL="gpt-4o"

# Python ML Microservice Gateway
ML_SERVICE_URL="http://localhost:8000"
ML_SERVICE_TIMEOUT_MS=5000

# ==============================================================================
# THIRD-PARTY AGRICULTURAL APIS & MEDIA STORAGE
# ==============================================================================
# OpenWeatherMap
WEATHER_API_KEY="your_openweathermap_api_key_here"
WEATHER_API_URL="https://api.openweathermap.org/data/2.5"
MOCK_WEATHER_FALLBACK=false

# Cloudinary CDN (Crop leaf images, voice notes, PDFs)
CLOUDINARY_CLOUD_NAME="kissan-mithar"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
CLOUDINARY_UPLOAD_PRESET="kissan_mithar_uploads"

# Payment Gateway (Razorpay UPI / Netbanking)
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
```

---

#### 1.2 Web Frontend Configuration (`/web/.env`)

```ini
VITE_API_URL="http://localhost:4000/api"
VITE_SOCKET_URL="http://localhost:4000"
VITE_ENABLE_AI_CHAT=true
VITE_DEFAULT_LANGUAGE="te"
```

---

#### 1.3 Python ML Microservice Configuration (`/ml_service/.env`)

```ini
PORT=8000
HOST="0.0.0.0"
WORKERS=2
MODEL_STORAGE_DIR="./models"
CROP_MODEL_PATH="./models/crop_recommendation_xgb.joblib"
FERTILIZER_MODEL_PATH="./models/fertilizer_recommendation.joblib"
DISEASE_CNN_PATH="./models/plant_disease_mobilenetv2.pt"
LOG_LEVEL="info"
```

---

### 2. Local Development Quickstart

#### Step 1: Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
npm run dev
# The backend will start on http://localhost:4000
```

#### Step 2: Web Frontend Setup
```bash
cd web
npm install
npm run dev
# The web app will start on http://localhost:5173
```

#### Step 3: Python ML Microservice Setup
```bash
cd ml_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# The ML microservice will start on http://localhost:8000
```

#### Step 4: Flutter Mobile App
```bash
cd kissan_mithar_app
flutter pub get
flutter run
```

---

### 3. Production Deployment Notes (EC2 & Lambda)

* **AWS EC2 (Dockerized):** Run `./deploy-ec2.sh` to build the unified multi-stage Docker container and launch the Nginx reverse proxy with PM2 process manager.
* **AWS Lambda (Serverless SAM):** Run `./deploy.sh` to build the 6 specialized Lambda micro-monolith functions with cold-start connection pooling pre-warming.
