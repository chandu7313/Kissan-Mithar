import { IntentService } from '../src/services/ai/intent.service.js';
import { OrchestratorService } from '../src/services/ai/orchestrator.service.js';

async function runAITests() {
  console.log('🧪 Starting Kissan Mithar AI Assistant & Multi-Agent Tests...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: any) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  };

  try {
    // 1. Language Detection Tests
    console.log('--- 1. Language Detection & Phonetic Dialect Tests ---');
    assert(
      IntentService.detectLanguage('నమస్కారం! నా పత్తి పంటలో తెగులు వచ్చింది') === 'te',
      'Detects native Telugu Unicode script'
    );

    assert(
      IntentService.detectLanguage('Na paddy crop ki leaves yellow ga avutunnayi. Em cheyali?') === 'te',
      'Detects Romanized Telugish dialect'
    );

    assert(
      IntentService.detectLanguage('नमस्ते! मुझे अपनी फसल के लिए खाद चाहिए') === 'hi',
      'Detects native Hindi Devanagari script'
    );

    assert(
      IntentService.detectLanguage('Mujhe khet ke liye 10 bag urea chahiye') === 'hi',
      'Detects Romanized Hinglish dialect'
    );

    assert(
      IntentService.detectLanguage('What is the current mandi price for cotton in Gadwal?') === 'en',
      'Detects English language'
    );

    // 2. Intent Classification Tests
    console.log('\n--- 2. Intent Classification Tests ---');
    const intent1 = IntentService.classifyIntent('Na paddy crop ki leaves yellow ga avutunnayi');
    assert(intent1.intent === 'DISEASE_DIAGNOSIS', 'Classifies leaf yellowing as DISEASE_DIAGNOSIS');

    const intent2 = IntentService.classifyIntent('Ee roju paddy mandi price entha?');
    assert(intent2.intent === 'MANDI_PRICE', 'Classifies mandi price request as MANDI_PRICE');

    const intent3 = IntentService.classifyIntent('Repu tractor available unda?');
    assert(intent3.intent === 'MACHINERY_BOOKING', 'Classifies tractor rent as MACHINERY_BOOKING');

    const intent4 = IntentService.classifyIntent('Maa village lo harvesting labour kavali');
    assert(intent4.intent === 'LABOUR_BOOKING', 'Classifies harvesting workers as LABOUR_BOOKING');

    const intent5 = IntentService.classifyIntent('Naaku 10 bags DAP kavali');
    assert(intent5.intent === 'COMMERCE_SEARCH' || intent5.intent === 'FERTILIZER_GUIDE', 'Classifies buying DAP as COMMERCE/FERTILIZER');

    const intent6 = IntentService.classifyIntent('Will it rain tomorrow in Gadwal?');
    assert(intent6.intent === 'WEATHER_INQUIRY', 'Classifies rain query as WEATHER_INQUIRY');

    // 3. Multi-Agent Orchestrator Execution Tests
    console.log('\n--- 3. Orchestrator End-to-End Execution Tests ---');
    
    // Test Telugu Disease Consultation
    const res1 = await OrchestratorService.processMessage({
      message: 'Na paddy crop ki leaves yellow ga avutunnayi. Em cheyali?',
      languageCode: 'te',
    });
    assert(Boolean(res1.reply && res1.reply.length > 20), 'Orchestrator generates detailed agronomic advisory');
    assert(res1.languageCode === 'te', 'Maintains Telugu language context');
    assert(Boolean(res1.uiCards && res1.uiCards.length > 0), 'Attaches relevant in-chat product recommendation cards');
    console.log(`   Sample Response Snippet: "${res1.reply.slice(0, 80)}..."`);
    console.log(`   Attached UI Cards: ${res1.uiCards.map((c) => c.title).join(', ')}`);

    // Test Mandi Price Tool Execution
    const res2 = await OrchestratorService.processMessage({
      message: 'What is the mandi price of paddy today?',
      languageCode: 'en',
    });
    assert(res2.detectedIntent === 'MANDI_PRICE', 'Orchestrator correctly tags MANDI_PRICE intent');
    assert(Boolean(res2.uiCards.some((c) => c.type === 'MANDI_CARD')), 'Attaches interactive MANDI_CARD to response');

    // Test Machinery Booking Tool Execution
    const res3 = await OrchestratorService.processMessage({
      message: 'Repu tractor available unda?',
      languageCode: 'te',
    });
    assert(res3.detectedIntent === 'MACHINERY_BOOKING', 'Orchestrator correctly tags MACHINERY_BOOKING');
    assert(Boolean(res3.uiCards.some((c) => c.type === 'BOOKING_CARD')), 'Attaches interactive BOOKING_CARD for machinery');

  } catch (error: any) {
    console.error('💥 Test suite crashed:', error);
    failed++;
  }

  console.log('\n=========================================');
  console.log(`📊 Total Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('=========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAITests();
