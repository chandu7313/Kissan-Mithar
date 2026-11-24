#!/usr/bin/env bash
# ==============================================================================
# KISSAN MITHAR — AWS EC2 AUTOMATED DEPLOYMENT SCRIPT
# ==============================================================================
# Deploys the Kissan Mithar backend container onto an AWS EC2 instance.
# Supports Ubuntu 20.04/22.04/24.04, Debian, and Amazon Linux 2023.
#
# Usage:
#   chmod +x deploy-ec2.sh
#   ./deploy-ec2.sh
# ==============================================================================

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${APP_DIR}/backend"

echo "🌾 =================================================================="
echo "🌾 KISSAN MITHAR — DEPLOYING TO AWS EC2"
echo "🌾 Working Directory: ${APP_DIR}"
echo "🌾 =================================================================="

# 1. Check or Install Docker & Docker Compose
echo "🔍 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
  echo "⚠️ Docker is not installed on this machine."
  echo "📦 Attempting automatic installation for Linux..."
  
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "$ID" in
      ubuntu|debian)
        echo "Updating apt and installing Docker via official repository..."
        sudo apt-get update -y
        sudo apt-get install -y ca-certificates curl gnupg lsb-release
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/$ID/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$ID $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update -y
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo usermod -aG docker "$USER" || true
        ;;
      amzn|almalinux|rocky|rhel|centos)
        echo "Installing Docker on RPM-based system..."
        sudo dnf install -y docker
        sudo systemctl enable --now docker
        sudo usermod -aG docker "$USER" || true
        ;;
      *)
        echo "❌ Unsupported OS distribution ($ID). Please install Docker manually:"
        echo "   https://docs.docker.com/engine/install/"
        exit 1
        ;;
    esac
  else
    echo "❌ Cannot determine OS. Please install Docker manually."
    exit 1
  fi
fi

# Ensure Docker service is running
if ! sudo docker info &> /dev/null && ! docker info &> /dev/null; then
  echo "🚀 Starting Docker service..."
  sudo systemctl start docker || true
fi

# Determine docker compose command (v2 plugin 'docker compose' or standalone 'docker-compose')
if docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
elif sudo docker compose version &> /dev/null; then
  DOCKER_COMPOSE="sudo docker compose"
elif command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  DOCKER_COMPOSE="sudo docker-compose"
fi

echo "✅ Using Docker Compose: ${DOCKER_COMPOSE}"

# 2. Check Environment Configuration
echo "⚙️ Checking backend environment file..."
if [ ! -f "${BACKEND_DIR}/.env" ]; then
  if [ -f "${BACKEND_DIR}/.env.example" ]; then
    echo "⚠️ No backend/.env found. Creating from .env.example..."
    cp "${BACKEND_DIR}/.env.example" "${BACKEND_DIR}/.env"
    echo "📝 NOTE: Please review and edit ${BACKEND_DIR}/.env with your real Supabase & API keys."
  else
    echo "❌ Missing ${BACKEND_DIR}/.env file. Please create it before deploying."
    exit 1
  fi
fi

# 3. Build and Launch Containers
echo "🐳 Building and starting Kissan Mithar backend container..."
cd "${APP_DIR}"
${DOCKER_COMPOSE} down --remove-orphans || true
${DOCKER_COMPOSE} build --no-cache
${DOCKER_COMPOSE} up -d

# 4. Wait and Verify Health Check
echo "⏳ Waiting for backend to initialize and database warmup..."
MAX_ATTEMPTS=15
ATTEMPT=1
IS_HEALTHY=false

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  sleep 2
  if curl -sf http://localhost:4000/health &> /dev/null; then
    IS_HEALTHY=true
    break
  fi
  echo "   [Attempt $ATTEMPT/$MAX_ATTEMPTS] Service warming up..."
  ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "=================================================================="
if [ "$IS_HEALTHY" = true ]; then
  echo "🌾 ✅ KISSAN MITHAR BACKEND IS RUNNING ON EC2!"
  echo ""
  
  # Try to detect EC2 public IP or hostname
  PUBLIC_IP=$(curl -s --connect-timeout 2 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s --connect-timeout 2 https://checkip.amazonaws.com 2>/dev/null || echo "localhost")
  
  echo "📡 Local Endpoint:    http://localhost:4000"
  echo "🌐 Public Endpoint:   http://${PUBLIC_IP}:4000"
  echo "🏥 Health Probe:      http://${PUBLIC_IP}:4000/health"
  echo "🔌 API Prefix:        http://${PUBLIC_IP}:4000/api"
  echo "⚡ Socket.IO Live:    ws://${PUBLIC_IP}:4000"
  echo ""
  echo "Useful Commands:"
  echo "  View real-time logs:  ${DOCKER_COMPOSE} logs -f backend"
  echo "  Restart service:      ${DOCKER_COMPOSE} restart backend"
  echo "  Stop service:         ${DOCKER_COMPOSE} down"
  echo ""
  echo "Security Note: Ensure EC2 Security Group allows Inbound Traffic on:"
  echo "  - Port 4000 (Direct API access), or"
  echo "  - Ports 80 & 443 (if using Nginx reverse proxy)"
else
  echo "⚠️ Backend container started but did not respond to /health in time."
  echo "Check container logs to diagnose:"
  echo "   ${DOCKER_COMPOSE} logs backend"
fi
echo "=================================================================="

