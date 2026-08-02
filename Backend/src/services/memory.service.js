const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// In-memory fallback cache if MongoDB is disconnected during local dev/tests
const memoryCache = new Map();

/**
 * Checks whether MongoDB connection is active
 * @returns {boolean}
 */
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Fetches previous messages for a user and formats them into conversation history.
 * Ready for reuse by Gemini AI and future RAG pipelines.
 * 
 * @param {string} userId - User or Session ID
 * @param {number} [limit=20] - Maximum past messages to load
 * @returns {Promise<Array<{role: string, text: string}>>} Formatted conversation history
 */
async function getConversationHistory(userId, limit = 20) {
  if (!userId) return [];

  try {
    if (isDbConnected()) {
      const chatDoc = await Chat.findOne({ userId: String(userId) }).exec();

      if (!chatDoc || !Array.isArray(chatDoc.messages)) {
        return [];
      }

      const recentMessages = chatDoc.messages.slice(-limit);

      return recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text,
        timestamp: msg.timestamp,
      }));
    } else {
      const cached = memoryCache.get(String(userId)) || [];
      return cached.slice(-limit).map(msg => ({
        role: msg.role || (msg.sender === 'user' ? 'user' : 'model'),
        text: msg.text,
      }));
    }
  } catch (error) {
    console.error('[Memory Service Error - getConversationHistory]:', error.message || error);
    return [];
  }
}

/**
 * Saves user message and AI response pair into MongoDB chat history.
 * 
 * @param {string} userId - User identifier
 * @param {string} userMessage - User input prompt
 * @param {string} aiResponse - AI generated reply
 * @param {string} [sessionId='default_session'] - Session ID
 * @returns {Promise<boolean>}
 */
async function saveMessagePair(userId, userMessage, aiResponse, sessionId = 'default_session') {
  if (!userId || !userMessage || !aiResponse) {
    console.warn('[Memory Service Warning]: Missing parameters in saveMessagePair.');
    return false;
  }

  try {
    const userTurn = { sender: 'user', text: userMessage, timestamp: new Date() };
    const modelTurn = { sender: 'model', text: aiResponse, timestamp: new Date() };

    if (isDbConnected()) {
      await Chat.findOneAndUpdate(
        { userId: String(userId) },
        {
          $setOnInsert: { sessionId: sessionId },
          $push: { messages: { $each: [userTurn, modelTurn] } },
        },
        { upsert: true, returnDocument: 'after' }
      ).exec();
    } else {
      const key = String(userId);
      const existing = memoryCache.get(key) || [];
      existing.push({ role: 'user', text: userMessage });
      existing.push({ role: 'model', text: aiResponse });
      memoryCache.set(key, existing);
    }

    return true;
  } catch (error) {
    console.error('[Memory Service Error - saveMessagePair]:', error.message || error);
    return false;
  }
}

/**
 * Clears conversation history for a given user.
 * 
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
async function clearHistory(userId) {
  if (!userId) return false;

  try {
    if (isDbConnected()) {
      await Chat.deleteOne({ userId: String(userId) }).exec();
    }
    memoryCache.delete(String(userId));
    return true;
  } catch (error) {
    console.error('[Memory Service Error - clearHistory]:', error.message || error);
    return false;
  }
}

module.exports = {
  getConversationHistory,
  saveMessagePair,
  clearHistory,
};
