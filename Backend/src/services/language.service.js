/**
 * Multilingual Support Service
 * Supports English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ) with automatic language detection.
 * Designed for modular reuse with RAG and Voice synthesis (Sarvam AI / TTS).
 */

const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', native: 'English' },
  hi: { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  or: { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
};

/**
 * Normalizes input language string to a standard 2-letter code (en, hi, or).
 * 
 * @param {string} [inputLang] - Language input (e.g. 'en', 'english', 'hi', 'hindi', 'or', 'odia', 'od')
 * @returns {string|null} Normalized code ('en', 'hi', 'or') or null if auto-detect required
 */
function normalizeLanguage(inputLang) {
  if (!inputLang || typeof inputLang !== 'string') {
    return null;
  }

  const clean = inputLang.toLowerCase().trim();

  if (clean === 'en' || clean === 'english') return 'en';
  if (clean === 'hi' || clean === 'hindi') return 'hi';
  if (clean === 'or' || clean === 'od' || clean === 'odia') return 'or';

  return null;
}

/**
 * Detects language from message text based on Script Analysis & Key Phrases.
 * 
 * @param {string} text - User message text
 * @returns {string} Language code ('hi', 'or', or 'en')
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    return 'en';
  }

  // Devanagari script range (Hindi)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  // Odia script range (Odia)
  if (/[\u0B00-\u0B7F]/.test(text)) {
    return 'or';
  }

  // Check Roman script Hindi / Hinglish key patterns
  const lower = text.toLowerCase();
  const hindiKeywords = ['kya', 'hai', 'kaise', 'batao', 'mujhe', 'namaste', 'samjhao', 'kare', 'hoga', 'dhanyawad', 'shukriya', 'haan', 'nahi', 'padhna'];
  if (hindiKeywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
    return 'hi';
  }

  // Check Roman script Odia key patterns
  const odiaKeywords = ['kemiti', 'achhanti', 'namaskar', 'kahile', 'bhai', 'aau', 'tame', 'kan', 'mu', 'jane'];
  if (odiaKeywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
    return 'or';
  }

  return 'en';
}

/**
 * Generates system prompt instruction for the target language.
 * Automatically adapts to the user's message language.
 * 
 * @param {string|null} targetLang - Optional explicit target language code ('en', 'hi', 'or')
 * @param {string} userMessage - User query text for auto-detection fallback
 * @returns {{ instruction: string, effectiveLanguage: string }}
 */
function getLanguageInstruction(targetLang, userMessage = '') {
  const detectedLang = detectLanguage(userMessage);
  // If targetLang is explicitly provided AND NOT 'auto', use targetLang; otherwise fallback to detected language from user input
  const normalized = normalizeLanguage(targetLang);
  const effectiveLanguage = (normalized && targetLang !== 'auto') ? normalized : detectedLang;

  let instruction = `CRITICAL MULTILINGUAL DIRECTIVE: Automatically detect the exact language, script, and dialect of the user's input message. You MUST answer strictly in the EXACT SAME language and script that the user used.
- If the user writes/speaks in Hindi (हिंदी or Hinglish), respond in fluent Hindi.
- If the user writes/speaks in Odia (ଓଡ଼ିଆ or Odia in English script), respond in fluent Odia.
- If the user writes/speaks in English, respond in clear English.
- If the user uses any other language, match their language naturally.`;

  switch (effectiveLanguage) {
    case 'hi':
      instruction += '\nPrimary Target Output: Hindi (हिंदी / Hinglish).';
      break;

    case 'or':
      instruction += '\nPrimary Target Output: Odia (ଓଡ଼ିଆ).';
      break;

    case 'en':
    default:
      instruction += '\nPrimary Target Output: English.';
      break;
  }

  return {
    instruction: instruction,
    effectiveLanguage: effectiveLanguage,
  };
}

module.exports = {
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  detectLanguage,
  getLanguageInstruction,
};
