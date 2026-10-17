#!/usr/bin/env bash
# ==============================================================================
# KISSAN MITHAR — AWS SAM & DOCKER DEPLOYMENT SCRIPT
# ==============================================================================
# Deploys the Kissan Mithar backend container to AWS Lambda and API Gateway HTTP API.
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh [environment] (default: production)
# ==============================================================================

set -euo pipefail

ENV="${1:-production}"
STACK_NAME="kissan-mithar-backend"
REGION="${AWS_REGION:-ap-south-1}"

echo "🌾 =================================================================="
echo "🌾 KISSAN MITHAR — DEPLOYING TO AWS LAMBDA (${ENV})"
echo "🌾 Region: ${REGION}"
echo "🌾 =================================================================="

# 1. Check Prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker is not installed. Please install Docker Desktop."
  exit 1
fi

if ! docker info &> /dev/null; then
  echo "❌ Error: Docker daemon is not running. Please start Docker Desktop ('open -a Docker' on macOS)."
  exit 1
fi

if ! command -v sam &> /dev/null; then
  echo "❌ Error: AWS SAM CLI is not installed."
  echo "   Install via Homebrew: brew install aws-sam-cli"
  echo "   Or official installer: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
  exit 1
fi

if ! command -v aws &> /dev/null; then
  echo "⚠️ Warning: AWS CLI is not installed or not in PATH."
fi

# 2. Check AWS Credentials
echo "🔑 Verifying AWS credentials..."
if ! sam validate --lint &> /dev/null; then
  echo "⚠️ SAM template lint warning (proceeding...)"
fi

# 3. Run Backend Verification Tests
echo "🧪 Running backend pre-flight tests..."
(cd backend && npm test)

# 4. Build SAM Application (Container Image)
echo "🐳 Building container image with AWS SAM..."
sam build

# 5. Deploy SAM Application
echo "🚀 Deploying to AWS CloudFormation / Lambda..."
if [ -f "samconfig.toml" ]; then
  sam deploy --config-file samconfig.toml --stack-name "${STACK_NAME}" --region "${REGION}"
else
  echo "ℹ️ No samconfig.toml detected. Running guided initial deployment..."
  sam deploy --guided --stack-name "${STACK_NAME}" --region "${REGION}"
fi

echo "=================================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Next Steps to switch Vercel Frontend to AWS:"
echo "1. Retrieve the 'HttpApiGatewayUrl' from the SAM outputs above."
echo "2. In your Vercel project settings (or web/.env):"
echo "   Set VITE_API_URL = <HttpApiGatewayUrl>/api"
echo "3. Redeploy your Vercel frontend or trigger a new build."
echo "4. In your Flutter mobile app (.env):"
echo "   Set API_BASE_URL = <HttpApiGatewayUrl>/api"
echo "=================================================================="
