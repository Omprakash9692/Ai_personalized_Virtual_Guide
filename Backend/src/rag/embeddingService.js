const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Generates lightweight normalized vector embedding as fallback if API is unavailable/rate-limited.
 */
function generateFallbackEmbedding(text, dimensions = 768) {
  const embedding = new Array(dimensions).fill(0);
  const clean = text.toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const idx = (charCode * (i + 1)) % dimensions;
    embedding[idx] += 0.01 * (charCode % 10 + 1);
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
  return embedding.map(val => val / magnitude);
}

/**
 * Generates vector embedding for a given text string.
 * 
 * @param {string} text - Input string
 * @returns {Promise<Array<number>>} Array of floating point vector values
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a non-empty string.');
  }

  try {
    if (apiKey && !apiKey.startsWith('AQ.')) {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text.trim(),
      });

      if (response && response.embedding && Array.isArray(response.embedding.values)) {
        return response.embedding.values;
      }
    }
  } catch (error) {
    console.warn(
      '[Embedding Service Warning]: Gemini API embedding call failed, using fallback embedding:',
      error.message || error
    );
  }

  return generateFallbackEmbedding(text);
}

/**
 * Generates embeddings in batch for a list of text chunks.
 * 
 * @param {Array<{id: string, text: string}>} chunks 
 * @returns {Promise<Array<{id: string, text: string, embedding: Array<number>}>>}
 */
async function generateBatchEmbeddings(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const results = [];
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text);
    results.push({
      ...chunk,
      embedding: embedding,
    });
  }

  return results;
}

module.exports = {
  generateEmbedding,
  generateBatchEmbeddings,
};
