# CI/CD Pipeline Guide (GitHub Actions + AWS SAM Lambda)

Automated Continuous Integration and Continuous Deployment is defined in [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml).

## Pipeline Stages

1. **Continuous Integration (Runs on every PR and push to `main`)**
   - `test-domain-services`: Independently installs, compiles (`prisma generate && tsc`), and tests all 7 Node domain microservices (`media`, `notification`, `field`, `marketplace`, `agricultural-ai`, `identity`, `analytics`).
   - `test-api-gateway`: Runs the pure microservices API Gateway end-to-end suite verifying routing across all 7 services, HMAC internal auth, and `502` failure behavior.
   - `test-km360-ml`: Runs Python `KM_360` inference tests (`test_ml_service.py` + `pytest tests/`).
   - `test-web`: Runs React + TypeScript + Vite production build (`web/`).
   - `test-flutter`: Runs `flutter analyze` and `flutter test` (`kissan_mithar_app/`).
   - `validate-infra`: Validates `docker-compose.platform.yml` and AWS SAM `template.yaml`.

2. **Continuous Deployment (Runs on `main` pushes or manual `workflow_dispatch` after CI passes)**
   - `deploy-aws-lambda`: Builds all 9 `arm64` Lambda container images via QEMU/Buildx + AWS SAM (`template.yaml`), pushes images to ECR, updates CloudFormation stack `kissan-mithar-backend` in `ap-southeast-2`, and verifies `/health`.
   - `deploy-web-vercel`: Optional Vercel production deployment when repository variable `ENABLE_VERCEL_CD=true` and `VERCEL_TOKEN` secret are set.

## Required GitHub Repository Secrets
Configure these under **GitHub Repository -> Settings -> Secrets and variables -> Actions**:

| Secret | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | IAM access key with ECR/SAM/Lambda/CloudFormation deploy access |
| `AWS_SECRET_ACCESS_KEY` | IAM secret access key |
| `DATABASE_URL` | Supabase PostgreSQL PgBouncer URL (`:6543`) |
| `DIRECT_URL` | Direct PostgreSQL connection string |
| `JWT_SECRET` | `>= 32` character JWT signing secret |
| `INTERNAL_SERVICE_SECRET` | Shared HMAC-SHA256 internal microservice secret |
| `GEMINI_API_KEY` | Google Gemini API key (Agricultural AI Service) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (`MediaService`) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID (`Identity` & `Notification` services) |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key |
| `WEATHER_API_KEY` | OpenWeatherMap API key |
| `SMS_API_KEY` | SMS OTP provider API key |
| `VERCEL_TOKEN` *(optional)* | Used when `vars.ENABLE_VERCEL_CD == 'true'` |
