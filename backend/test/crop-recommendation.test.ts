import { createApp } from '../src/app.js';
import { Server } from 'http';
import axios from 'axios';
import { MLService } from '../src/services/ml.service.js';

let server: Server;
let baseUrl: string;

async function runCropRecommendationTests() {
  console.log('🌾 Starting Crop Recommendation ML Service & API Tests...\n');
  const app = createApp();

  await new Promise<void>((resolve) => {
    server = app.listen(4009, () => {
      baseUrl = `http://127.0.0.1:4009/api`;
      console.log(`📡 Crop Recommendation Test Server running on ${baseUrl}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail}`);
      failed++;
    }
  };

  try {
    // 1. Direct MLService unit test (Agronomic baseline / fallback test)
    console.log('--- 1. Testing MLService.recommendCrop direct invocation ---');
    const serviceRes = await MLService.recommendCrop({
      N: 120,
      P: 50,
      K: 20,
      ph: 7.2,
      temperature: 26.0,
      humidity: 65.0,
      rainfall: 85.0,
      soil_type: 'Black Cotton',
      location: 'Warangal, Telangana',
      season: 'Kharif',
    });

    assert(serviceRes.recommended_crops.length > 0, 'MLService returns at least one recommended crop');
    assert(serviceRes.confidence !== null && serviceRes.confidence > 0, 'MLService returns non-null confidence');
    assert(!!serviceRes.model_version, 'MLService returns model version');
    console.log(`   Top Recommended: ${serviceRes.recommended_crops[0].crop} (${serviceRes.confidence})`);

    // 2. HTTP POST /api/advisories/crop-recommend endpoint test
    console.log('\n--- 2. Testing HTTP POST /api/advisories/crop-recommend ---');
    const apiRes = await axios.post(`${baseUrl}/advisories/crop-recommend`, {
      N: 80,
      P: 45,
      K: 40,
      ph: 6.5,
      temperature: 24.0,
      humidity: 85.0,
      rainfall: 220.0,
      soil_type: 'Alluvial',
      location: 'Nalgonda',
      season: 'Kharif',
    });

    assert(apiRes.status === 200, 'POST /advisories/crop-recommend returns 200 OK');
    assert(apiRes.data.success === true, 'Response contains success: true');
    assert(apiRes.data.data.recommended_crops.length > 0, 'Response contains recommended_crops array');
    console.log(`   API Top Crop: ${apiRes.data.data.recommended_crops[0].crop}`);

    // 3. Validation error on missing required fields
    console.log('\n--- 3. Testing Schema Validation Error Handling ---');
    try {
      await axios.post(`${baseUrl}/advisories/crop-recommend`, {
        N: 80,
        // Missing P, K, ph, temperature, humidity, rainfall
      });
      assert(false, 'Should fail with 400 Bad Request on missing fields');
    } catch (err: any) {
      assert(err.response?.status === 400, 'Rejects invalid payload with 400 Bad Request');
    }

  } catch (error: any) {
    console.error('Fatal test error:', error.message);
    failed++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n========================================');
  console.log(`📊 Crop Recommendation Test Summary: Passed ${passed} | Failed ${failed}`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runCropRecommendationTests();
