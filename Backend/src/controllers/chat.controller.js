const { generateReply } = require('../services/groq');
const { getPromptTemplate } = require('../services/prompt.service');
const { getConversationHistory, saveMessagePair } = require('../services/memory.service');
const { getLanguageInstruction } = require('../services/language.service');
const { textToSpeech } = require('../services/voice.service');
const { getUserProfile, buildPersonalizedInstruction } = require('../services/personalization.service');

/**
 * Controller handling multi-turn chat with automatic AI personalization, conversation memory, and voice synthesis.
 * 
 * @route POST /api/chat
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function handleChat(req, res) {
  try {
    const {
      message,
      userId = 'default_user',
      sessionId = 'default_session',
      type = 'general',
      language = null,
      context = '',
      voiceEnabled = false,
    } = req.body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: "message" is required and must be a non-empty string.',
      });
    }

    // 1. Fetch user profile from database for AI Personalization
    const userProfile = await getUserProfile(userId);

    // 2. Resolve preferred language (Explicit req.body.language > User Profile > Auto-detect)
    const targetLanguage = language || userProfile?.preferredLanguage || null;
    const { instruction: langInstruction, effectiveLanguage } = getLanguageInstruction(
      targetLanguage,
      message.trim()
    );

    // 3. Build personalized instruction block (returns empty string if profile missing)
    const personalizationInstruction = buildPersonalizedInstruction(userProfile);

    // 4. Fetch user's previous conversation history from MongoDB
    const history = await getConversationHistory(userId);

    // 5. Retrieve base system prompt template
    const basePrompt = getPromptTemplate(type, { context });

    // 6. Combine all system instructions: Base Prompt + Personalization + Language Directive
    const systemPromptParts = [basePrompt];
    if (personalizationInstruction) {
      systemPromptParts.push(personalizationInstruction);
    }
    systemPromptParts.push(langInstruction);

    const fullSystemInstruction = systemPromptParts.join('\n\n');

    // 7. Call AI service with history and combined system instructions
    const reply = await generateReply(message.trim(), history, {
      systemInstruction: fullSystemInstruction,
    });

    // 8. Save user prompt and AI reply pair to MongoDB
    await saveMessagePair(userId, message.trim(), reply, sessionId);

    // 9. Optional Voice Synthesis if requested
    let audioContent = null;
    if (voiceEnabled) {
      try {
        const ttsResult = await textToSpeech(reply, { language: effectiveLanguage });
        audioContent = ttsResult.audioContent;
      } catch (voiceError) {
        console.warn('[Chat Controller Voice Warning]: Failed to synthesize voice:', voiceError.message);
      }
    }

    // 10. Return response with personalization flag and user metadata
    return res.status(200).json({
      success: true,
      response: reply,
      personalized: !!userProfile,
      userProfile: userProfile ? { name: userProfile.name, department: userProfile.department, semester: userProfile.semester } : null,
      language: effectiveLanguage,
      audioContent: audioContent,
      userId: userId,
    });
  } catch (error) {
    console.error('Chat Controller Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred while generating the reply.',
    });
  }
}

/**
 * Fetch chat history for a user
 * @route GET /api/chat/history/:userId
 */
async function handleGetHistory(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    const history = await getConversationHistory(userId, 50); // Load last 50 messages
    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Chat History Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
}

/**
 * Clear chat history for a user
 * @route DELETE /api/chat/history/:userId
 */
async function handleClearHistory(req, res) {
  try {
    const { userId } = req.params;
    const { clearHistory } = require('../services/memory.service');
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    await clearHistory(userId);
    return res.status(200).json({ success: true, message: 'History cleared' });
  } catch (error) {
    console.error('Clear History Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to clear history' });
  }
}

module.exports = {
  handleChat,
  handleGetHistory,
  handleClearHistory,
};
