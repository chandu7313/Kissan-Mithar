# Kissan Mithar — Docker + AWS Lambda Deployment & Operations Guide

## 1. Architecture Summary

The Kissan Mithar backend is containerized using Docker and deployed to **AWS Lambda** fronted by **Amazon API Gateway HTTP API (v2)**, running in the `ap-south-1` (Mumbai) region.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Frontend / Mobile App                 │
│              (Web React/Vite + Flutter Mobile Client)            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                   Amazon API Gateway HTTP API                    │
│            https://<api-id>.execute-api.ap-south-1.amazonaws.com │
│                       /{proxy+}  and  /                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               kissan-mithar-api (AWS Lambda Function)           │
│        PackageType: Image (public.ecr.aws/lambda/nodejs:20)     │
│       512MB RAM, 30s Timeout, Shared Container Cold Start       │
│                                                                 │
│   • Express App with all 80+ endpoints                          │
│   • @codegenie/serverless-express Adapter                       │
│   • Persistent Prisma Client on global context                  │
│   • Firebase Admin SDK & Cloudinary Integrations                │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 ▼                               ▼
┌────────────────────────────────┐ ┌──────────────────────────────┐
│  PostgreSQL (Supabase Pooler)   │ │  Amazon CloudWatch Logs      │
│  Port 6543 (?pgbouncer=true)   │ │  14-Day Strict Retention     │
└────────────────────────────────┘ └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            kissan-mithar-cleanup (AWS Lambda Function)          │
│        Trigger: EventBridge Rule (Every 6 hours)                │
│        Image: Same ECR container image (Command override)       │
│        Hygiene: Cleans expired OTPs and old audit logs          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites

Before deploying to AWS, ensure the following tools are installed and configured:

### 2.1 AWS CLI & Credentials
```bash
# Verify installation
aws --version

# Configure AWS credentials for your IAM deployer user
aws configure
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region name: ap-south-1
# Default output format: json
```

### 2.2 AWS SAM CLI
```bash
# macOS (via Homebrew)
brew install aws-sam-cli

# Verify installation
sam --version
```

### 2.3 Docker Desktop
Docker is required by AWS SAM to build the multi-stage Lambda container image:
```bash
# Start Docker Desktop on macOS
open -a Docker

# Verify daemon is running
docker info
```

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Pre-flight Verification
Run local TypeScript compilation and the Lambda handler test suite:
```bash
cd backend
npm run build
npm test
cd ..
```
*Expected: 9 test assertions pass with 0 failures.*

### Step 2: Configure Deployment Parameters
1. Copy the example SAM configuration:
   ```bash
   cp samconfig.toml.example samconfig.toml
   ```
2. Open `samconfig.toml` in your editor.
3. Replace the placeholder values in `parameter_overrides`:
   - `DatabaseUrl`: Supabase connection pooler URL (`...pooler.supabase.com:6543/postgres?pgbouncer=true`).
   - `DirectUrl`: Supabase direct connection URL (`...pooler.supabase.com:5432/postgres`).
   - `JwtSecret`: 32+ character secure random secret.
   - `FirebaseProjectId`, `FirebaseClientEmail`, `FirebasePrivateKey`: Service account details (or set `MockFirebaseAuth="true"` for testing).
   - `Cloudinary*`: Cloudinary credentials for media upload signing.
   - `WeatherApiKey`: OpenWeatherMap API key.
   - `SmsApiKey`: Fast2SMS API key.

### Step 3: Automated Build & Deploy via Script
Run the automated deployment script:
```bash
./deploy.sh production
```
Or execute SAM CLI commands manually:
```bash
# 1. Build the container image
sam build

# 2. Deploy (Guided for the first time to create ECR repository automatically)
sam deploy --guided

# On first guided deployment:
# Stack Name [kissan-mithar-backend]: kissan-mithar-backend
# AWS Region [ap-south-1]: ap-south-1
# Confirm changes before deploy [Y/n]: y
# Allow SAM CLI IAM role creation [Y/n]: y
# Disable rollback for debugging [y/N]: n
# Save arguments to configuration file [Y/n]: y
```

### Step 4: Verify Deployed Endpoint
SAM will output your API Gateway endpoints upon completion:
```bash
# Test the root health check probe
curl -s https://<api-id>.execute-api.ap-south-1.amazonaws.com/health

# Test the API health probe
curl -s https://<api-id>.execute-api.ap-south-1.amazonaws.com/api/health
```
Expected output:
```json
{"status":"healthy","service":"kissan-mithar-backend","timestamp":"2026-10-15T..."}
```

---

## 4. Frontend & Mobile Client Cutover

### 4.1 Vercel Web Dashboard (Admin & Farmer Web App)
1. Navigate to [Vercel Dashboard](https://vercel.com) → Select **kissan-mithar-app**.
2. Go to **Settings** → **Environment Variables**.
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/api
   ```
4. Click **Save** and trigger a **Redeploy** on the latest production deployment.

### 4.2 Flutter Mobile App (`kissan_mithar_app`)
1. Open `kissan_mithar_app/.env` (or production env config).
2. Set:
   ```properties
   API_BASE_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/api
   ```
3. Build and publish the release APK:
   ```bash
   flutter build apk --release
   ```

---

## 5. Startup Budget & Cost Optimization

This deployment is specifically engineered for bootstrapped startups with minimal operational costs.

### 5.1 Monthly Cost Breakdown (Region: `ap-south-1`)

| Component | Free Tier (First 12 Months) | Moderate Traffic (100k requests/mo) | Growth Traffic (1M requests/mo) |
|---|---|---|---|
| **API Gateway HTTP API** | 1,000,000 requests free | ~$0.10 | ~$1.00 |
| **AWS Lambda Compute (512MB)** | 400,000 GB-seconds free | ~$0.02 | ~$2.10 |
| **Amazon ECR Storage** | 500MB free tier | ~$0.02 (one ~150MB image) | ~$0.02 |
| **Amazon CloudWatch Logs** | 5GB free tier | ~$0.50 (14-day retention) | ~$2.00 |
| **Amazon EventBridge** | All scheduled rules free | $0.00 | $0.00 |
| **Data Transfer Out** | 100GB/month free | $0.00 | $0.00 |
| **Total Estimated Cost** | **$0.00 / month** | **~$0.64 / month** | **~$5.12 / month** |

### 5.2 Key Cost Controls Applied
1. **Single Container Image**: Both `ApiFunction` and `CleanupFunction` share the exact same ECR container image (using SAM `ImageConfig.Command` override). No redundant container storage costs.
2. **Strict CloudWatch Log Retention**: CloudWatch log retention is explicitly set to **14 days** in `template.yaml`. This avoids default indefinite log accumulation which is a frequent source of surprise AWS bills.
3. **Zero Idle Compute**: No servers or EC2/ECS tasks run when there is no traffic.
4. **No VPC / NAT Gateway**: Supabase is reached securely over public TLS via PgBouncer. A NAT Gateway would cost ~$32/month and is intentionally avoided.
5. **Connection Pooling**: PgBouncer port `6543` prevents Lambda concurrency from exhausting database connection limits.

---

## 6. Operational Monitoring & Logs

### View Real-time Lambda Logs
```bash
# Stream API logs directly from CloudWatch
sam logs -n ApiFunction --stack-name kissan-mithar-backend --tail

# Stream Scheduled Cleanup logs
sam logs -n CleanupFunction --stack-name kissan-mithar-backend --tail
```

### AWS Billing Alarm Setup (Recommended)
To ensure your AWS bill never exceeds your budget:
1. Open the [AWS Billing & Cost Management Console](https://console.aws.amazon.com/billing/).
2. Select **Budgets** → **Create budget**.
3. Choose **Cost budget** → Set target amount to **$10.00 USD / month**.
4. Configure email alert recipients when forecast or actual spend exceeds 80%.

---

## 7. Rollback & Disaster Recovery

### Immediate Rollback (< 60 seconds)
If the new Lambda deployment experiences errors:
1. In Vercel Project Settings, change `VITE_API_URL` back to your previous backend endpoint (`https://kissan-mithar-app.vercel.app/api`).
2. Trigger an immediate Vercel redeployment.
3. All web traffic immediately reverts to the previous backend with zero downtime.

### CloudFormation Stack Rollback / Removal
```bash
# Rollback CloudFormation changes
aws cloudformation rollback-stack --stack-name kissan-mithar-backend --region ap-south-1

# Completely remove all deployed AWS resources (if needed)
sam delete --stack-name kissan-mithar-backend --region ap-south-1
```
