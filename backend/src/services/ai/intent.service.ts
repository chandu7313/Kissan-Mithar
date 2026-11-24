export interface DetectedIntentResult {
  intent: string;
  languageCode: 'te' | 'hi' | 'en';
  confidence: number;
  extractedEntities: Record<string, any>;
}

export class IntentService {
  /**
   * Detects language from native Unicode ranges and phonetic Roman markers
   */
  static detectLanguage(text: string): 'te' | 'hi' | 'en' {
    if (!text) return 'en';

    // 1. Native Unicode detection
    // Telugu Unicode block: \u0C00-\u0C7F
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    // Devanagari Unicode block: \u0900-\u097F
    if (/[\u0900-\u097F]/.test(text)) return 'hi';

    // 2. Phonetic Roman transliteration detection
    const lower = text.toLowerCase();
    
    // Common Telugu phonetic words
    const teluguKeywords = [
      'kavali', 'undi', 'cheyali', 'em', 'ela', 'naaku', 'maa', 'panta', 'thota',
      'akulu', 'pasupu', 'tegulu', 'dhara', 'entha', 'coolilu', 'repu', 'eeroju',
      'bhoomi', 'eruvulu', 'chettu', 'varsham', 'mandu'
    ];
    const teluguMatchCount = teluguKeywords.filter((k) => lower.includes(k)).length;
    if (teluguMatchCount >= 1) return 'te';

    // Common Hindi phonetic words
    const hindiKeywords = [
      'chahiye', 'hai', 'kaise', 'kya', 'mujhe', 'fasal', 'khet', 'kisaan',
      'patte', 'peela', 'rog', 'bhav', 'kitna', 'majdoor', 'kal', 'aaj',
      'zameen', 'khad', 'barish', 'dawai'
    ];
    const hindiMatchCount = hindiKeywords.filter((k) => lower.includes(k)).length;
    if (hindiMatchCount >= 1) return 'hi';

    return 'en';
  }

  /**
   * Classifies agricultural user intent and extracts parameters
   */
  static classifyIntent(text: string): DetectedIntentResult {
    const lang = this.detectLanguage(text);
    const lower = text.toLowerCase();
    const entities: Record<string, any> = {};

    // Check for crop mentions
    const crops = ['paddy', 'cotton', 'chilli', 'tomato', 'mango', 'groundnut', 'maize', 'rice', 'wheat', 'vari', 'pratti', 'mirapa'];
    for (const crop of crops) {
      if (lower.includes(crop)) {
        entities.crop = crop;
        break;
      }
    }

    // 1. Disease & Pest Diagnosis
    if (
      lower.includes('disease') || lower.includes('pest') || lower.includes('insect') ||
      lower.includes('yellow') || lower.includes('blight') || lower.includes('rot') ||
      lower.includes('tegulu') || lower.includes('purugu') || lower.includes('roga') ||
      lower.includes('keeda') || lower.includes('peela') || lower.includes('marakalu')
    ) {
      return {
        intent: 'DISEASE_DIAGNOSIS',
        languageCode: lang,
        confidence: 0.92,
        extractedEntities: entities,
      };
    }

    // 2. Fertilizer & Nutrients
    if (
      lower.includes('fertilizer') || lower.includes('urea') || lower.includes('dap') ||
      lower.includes('npk') || lower.includes('potash') || lower.includes('eruvulu') ||
      lower.includes('khad') || lower.includes('nutrient') || lower.includes('dosage')
    ) {
      return {
        intent: 'FERTILIZER_GUIDE',
        languageCode: lang,
        confidence: 0.90,
        extractedEntities: entities,
      };
    }

    // 3. Mandi Prices
    if (
      lower.includes('mandi') || lower.includes('market') || lower.includes('price') ||
      lower.includes('rate') || lower.includes('dhara') || lower.includes('bhav') ||
      lower.includes('entha') || lower.includes('kitna')
    ) {
      return {
        intent: 'MANDI_PRICE',
        languageCode: lang,
        confidence: 0.95,
        extractedEntities: entities,
      };
    }

    // 4. Weather & Rain
    if (
      lower.includes('weather') || lower.includes('rain') || lower.includes('temperature') ||
      lower.includes('forecast') || lower.includes('varsham') || lower.includes('barish') ||
      lower.includes('toofan') || lower.includes('cyclone')
    ) {
      return {
        intent: 'WEATHER_INQUIRY',
        languageCode: lang,
        confidence: 0.94,
        extractedEntities: entities,
      };
    }

    // 5. Machinery Booking
    if (
      lower.includes('tractor') || lower.includes('drone') || lower.includes('harvester') ||
      lower.includes('rotavator') || lower.includes('plough') || lower.includes('machinery') ||
      lower.includes('rent') || lower.includes('spray machine')
    ) {
      return {
        intent: 'MACHINERY_BOOKING',
        languageCode: lang,
        confidence: 0.91,
        extractedEntities: entities,
      };
    }

    // 6. Labour Booking
    if (
      lower.includes('labour') || lower.includes('cooli') || lower.includes('majdoor') ||
      lower.includes('worker') || lower.includes('transplanting') || lower.includes('weeding') ||
      lower.includes('harvesting labour')
    ) {
      return {
        intent: 'LABOUR_BOOKING',
        languageCode: lang,
        confidence: 0.91,
        extractedEntities: entities,
      };
    }

    // 7. Commerce / Buying
    if (
      lower.includes('buy') || lower.includes('order') || lower.includes('kavali') ||
      lower.includes('chahiye') || lower.includes('pampinchu') || lower.includes('cart') ||
      lower.includes('purchase') || lower.includes('shop')
    ) {
      return {
        intent: 'COMMERCE_SEARCH',
        languageCode: lang,
        confidence: 0.88,
        extractedEntities: entities,
      };
    }

    // Default: General Farm Advisory
    return {
      intent: 'GENERAL_FARM_INQUIRY',
      languageCode: lang,
      confidence: 0.75,
      extractedEntities: entities,
    };
  }
}
