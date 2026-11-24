import { LLMProvider, LLMResponse } from './provider.interface.js';
import { LLMMessage, AgentTool } from '../types.js';

export class MockAgronomicProvider implements LLMProvider {
  name = 'Agronomic Rule Engine (Offline Fallback)';

  isAvailable(): boolean {
    return true; // Always available as resilient fallback
  }

  async generateResponse(
    messages: LLMMessage[],
    tools?: AgentTool[],
    _systemPrompt?: string
  ): Promise<LLMResponse> {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content.toLowerCase() || '';

    // Check if any tool should be triggered based on user intent keywords
    if (tools && tools.length > 0) {
      if (lastUserMsg.includes('mandi') || lastUserMsg.includes('price') || lastUserMsg.includes('dhara') || lastUserMsg.includes('rate')) {
        const mandiTool = tools.find((t) => t.name === 'get_mandi_prices');
        if (mandiTool) {
          return {
            content: 'Fetching live market mandi prices...',
            toolCalls: [{ name: 'get_mandi_prices', arguments: { commodity: 'Paddy' } }],
          };
        }
      }

      if (lastUserMsg.includes('weather') || lastUserMsg.includes('rain') || lastUserMsg.includes('varsham') || lastUserMsg.includes('barish')) {
        const weatherTool = tools.find((t) => t.name === 'get_weather_forecast');
        if (weatherTool) {
          return {
            content: 'Checking current weather and rainfall forecast...',
            toolCalls: [{ name: 'get_weather_forecast', arguments: {} }],
          };
        }
      }

      if (lastUserMsg.includes('buy') || lastUserMsg.includes('kavali') || lastUserMsg.includes('chahiye') || lastUserMsg.includes('dap') || lastUserMsg.includes('urea') || lastUserMsg.includes('fertilizer') || lastUserMsg.includes('pesticide')) {
        const productTool = tools.find((t) => t.name === 'search_products');
        if (productTool) {
          const query = lastUserMsg.includes('dap') ? 'DAP' : lastUserMsg.includes('urea') ? 'Urea' : 'Fertilizer';
          return {
            content: 'Searching agricultural store catalog for certified inputs...',
            toolCalls: [{ name: 'search_products', arguments: { query } }],
          };
        }
      }

      if (lastUserMsg.includes('tractor') || lastUserMsg.includes('drone') || lastUserMsg.includes('machinery')) {
        const machTool = tools.find((t) => t.name === 'book_machinery');
        if (machTool) {
          return {
            content: 'Checking nearby agricultural machinery operators...',
            toolCalls: [{ name: 'book_machinery', arguments: { machineryType: 'Tractor' } }],
          };
        }
      }

      if (lastUserMsg.includes('labour') || lastUserMsg.includes('cooli') || lastUserMsg.includes('majdoor') || lastUserMsg.includes('worker')) {
        const labourTool = tools.find((t) => t.name === 'book_labour');
        if (labourTool) {
          return {
            content: 'Connecting with local farm labour coordinators...',
            toolCalls: [{ name: 'book_labour', arguments: { taskType: 'HARVESTING', labourersRequired: 5 } }],
          };
        }
      }
    }

    // Direct synthesized multilingual responses
    if (lastUserMsg.includes('yellow') || lastUserMsg.includes('leaves') || lastUserMsg.includes('akulu') || lastUserMsg.includes('peela')) {
      return {
        content: `మీ పంటలో ఆకులు పసుపు రంగులోకి మారడానికి రెండు ప్రధాన కారణాలు ఉండవచ్చు:
1. **నత్రజని (Nitrogen) లోపం**: దిగువ ఆకుల నుంచి పసుపు రంగు మొదలవుతుంది. నివారణకు ఎకరాకు 20-25 కిలోల యూరియా లేదా 19:19:19 ద్రావణాన్ని పిచికారీ చేయండి.
2. **ఆకు ఎండు తెగులు (Bacterial Leaf Blight)**: ఆకుల అంచులు ఎండిపోతుంటే కాపర్ ఆక్సీక్లోరైడ్ (బ్లైటాక్స్) 500 గ్రాములు ఎకరాకు పిచికారీ చేయండి.

స్పష్టమైన ఫోటో తీసి పంపితే మరింత కచ్చితమైన సలహా ఇవ్వగలను. సంబంధిత మందులు కింద అందుబాటులో ఉన్నాయి:`,
      };
    }

    return {
      content: 'నమస్కారం! మీ పంట లేదా పొలం సంబంధిత వివరాలు చెప్పండి. విత్తనాలు, ఎరువులు, తెగుళ్ల నివారణ, ట్రాక్టర్ లేదా కూలీల బుకింగ్ గురించి నేను సహాయం చేయగలను.\n\nNamaste! Tell me what you need help with on your farm.',
    };
  }
}
