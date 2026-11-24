# 🚀 Kissan Mithar — Complete AWS Deployment Guide (Lambda & EC2)

This repository is engineered to run seamlessly across two production AWS architectures:
1. **AWS Lambda (Serverless)** — Containerized microservices fronted by Amazon API Gateway HTTP API ($0–$5/month).
2. **AWS EC2 (Virtual Server)** — Dedicated Ubuntu / Amazon Linux VM with Docker, persistent Socket.IO WebSockets, and Nginx.

---

## 📊 Quick Comparison: Lambda vs. EC2

| Feature | AWS Lambda (Serverless) | AWS EC2 (Dedicated Virtual Server) |
|---|---|---|
| **Best For** | Bootstrapped startups, variable traffic, zero idle cost | Steady traffic, persistent WebSockets (Socket.IO), long-running background tasks |
| **Container Engine** | AWS Lambda Custom Runtime (`public.ecr.aws/lambda/nodejs:20`) | Docker Engine (`node:20-bookworm-slim`) via `docker-compose` |
| **Port / Networking** | API Gateway HTTP API (Port 443 HTTPS) | Port 4000 (direct) or Ports 80/443 (via Nginx reverse proxy) |
| **Socket.IO Support** | External polling / WebSocket gateway | **100% Native, persistent full-duplex WebSockets** |
| **Monthly Cost** | Free Tier: \$0.00 / mo<br>100k req: ~\$0.64 / mo<br>1M req: ~\$5.12 / mo | t4g.small / t3.small: ~\$14–\$18 / mo |
| **Deploy Command** | `./deploy.sh` | `./deploy-ec2.sh` |

---

## 🛠️ ARCHITECTURE 1: Deploy to AWS EC2

### Prerequisites on your local machine or EC2:
- An active EC2 instance running **Ubuntu 22.04/24.04 LTS** or **Amazon Linux 2023** (Instance type recommendation: `t3.small` or `t4g.small` with 2GB RAM and 20GB EBS storage).
- **Security Group Inbound Rules** configured on AWS Console:
  - `SSH` (Port 22) from your IP
  - `HTTP` (Port 80) from `0.0.0.0/0`
  - `HTTPS` (Port 443) from `0.0.0.0/0`
  - `Custom TCP` (Port 4000) from `0.0.0.0/0` (if testing backend without Nginx)

---

### Method A: One-Command Automated EC2 Deployment (Recommended)

1. **SSH into your EC2 instance**:
   ```bash
   ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/kissan-mithar.git
   cd kissan-mithar
   ```

3. **Configure Environment Variables**:
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env # or vim backend/.env
   ```
   *Make sure `DATABASE_URL` (Supabase PgBouncer) and `JWT_SECRET` are configured.*

4. **Run the automated deployment script**:
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```
   *The script automatically installs Docker and Docker Compose (if not present), compiles the TypeScript backend, spins up the container, and verifies the `/health` endpoint.*

---

### Method B: Manual Docker Compose on EC2

```bash
# 1. Build and start container in detached mode
docker compose up -d --build

# 2. View real-time application logs
docker compose logs -f backend

# 3. Test health check
curl -s http://localhost:4000/health
# Output: {"status":"healthy","service":"kissan-mithar-backend",...}
```

---

### Method C: Configure Nginx Reverse Proxy with Free SSL (Let's Encrypt)

To serve your backend over `https://api.yourdomain.com` with WebSocket support:

1. **Install Nginx & Certbot**:
   ```bash
   sudo apt update -y
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **Copy the pre-configured Nginx config**:
   ```bash
   sudo cp nginx/kissan-mithar.conf /etc/nginx/sites-available/kissan-mithar.conf
   sudo nano /etc/nginx/sites-available/kissan-mithar.conf # Replace server_name with your domain
   sudo ln -s /etc/nginx/sites-available/kissan-mithar.conf /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **Issue SSL Certificate**:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## ⚡ ARCHITECTURE 2: Deploy to AWS Lambda (Serverless)

### Prerequisites:
- **AWS CLI** (`aws configure` with an IAM deployer user in `ap-south-1`).
- **AWS SAM CLI** (`sam --version`).
- **Docker Desktop** (running locally for SAM to build the Lambda container).

---

### Step-by-Step Lambda Deployment:

1. **Verify local tests pass**:
   ```bash
   cd backend && npm test && cd ..
   # Expected: 12 passed, 0 failed
   ```

2. **Configure SAM Parameters**:
   Inspect or edit `samconfig.toml` (or use `samconfig.toml.example`):
   ```bash
   # Ensure parameter_overrides contains your DATABASE_URL, JWT_SECRET, etc.
   ```

3. **Deploy using the automated SAM deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh production
   ```
   *Or run manually:*
   ```bash
   sam build
   sam deploy --resolve-image-repos --resolve-s3
   ```

4. **Verify Deployed Endpoint**:
   ```bash
   curl -s https://<api-id>.execute-api.ap-south-1.amazonaws.com/health
   # Output: {"status":"healthy","service":"kissan-mithar-backend",...}
   ```

---

## 📱 Connecting Web & Mobile Frontends

### Web Frontend (Vercel)
In your Vercel Project Settings $\rightarrow$ Environment Variables:
```env
# For AWS Lambda:
VITE_API_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/api

# For AWS EC2:
VITE_API_URL=https://api.yourdomain.com/api
# Or without domain:
VITE_API_URL=http://<EC2-PUBLIC-IP>:4000/api
```

### Flutter Mobile App
In `kissan_mithar_app/.env`:
```properties
# For AWS Lambda:
API_BASE_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com/api

# For AWS EC2:
API_BASE_URL=https://api.yourdomain.com/api
# Or:
API_BASE_URL=http://<EC2-PUBLIC-IP>:4000/api
```

---

## 🔍 Health & Observability Probes

Both EC2 and Lambda deployments expose standard HTTP probes:
- Root probe: `GET /health` (Quick 200 OK for Route53 / AWS ALB / API Gateway)
- Full API probe: `GET /api/health` (Reports uptime, memory consumption, and DB connectivity status)
- Readiness probe: `GET /api/readiness` (Returns 503 if database pooler is unreachable)

