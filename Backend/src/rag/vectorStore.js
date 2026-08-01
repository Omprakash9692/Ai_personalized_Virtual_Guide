const { Pinecone } = require('@pinecone-database/pinecone');

// In-memory fallback vector storage if Pinecone is not configured
const memoryVectorStore = new Map(); // collectionName -> Array<{ id, text, embedding, metadata }>

/**
 * Calculates cosine similarity between two vector arrays.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Returns an initialised Pinecone index handle, or null if unconfigured.
 * Uses PINECONE_API_KEY and PINECONE_INDEX from environment variables.
 */
function getPineconeIndex() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || 'pdf-documents';

  if (!apiKey) return null;

  try {
    const pinecone = new Pinecone({ apiKey });
    return pinecone.index(indexName);
  } catch (error) {
    console.warn('[Vector Store Warning]: Failed to initialise Pinecone client:', error.message || error);
    return null;
  }
}

/**
 * Adds document chunks with vector embeddings to Pinecone or the Memory Store.
 *
 * @param {Array<{id: string, text: string, embedding: Array<number>, metadata?: Object}>} chunks
 * @param {string} [collectionName='pdf_documents']
 * @returns {Promise<boolean>}
 */
async function addDocuments(chunks, collectionName = 'pdf_documents') {
  if (!Array.isArray(chunks) || chunks.length === 0) return false;

  const index = getPineconeIndex();

  if (index) {
    try {
      // Pinecone upsert expects: { id, values, metadata }
      const vectors = chunks.map((chunk, idx) => ({
        id: chunk.id || `doc_chunk_${idx}_${Date.now()}`,
        values: chunk.embedding,
        metadata: {
          text: chunk.text,
          ...(chunk.metadata || { source: collectionName }),
        },
      }));

      // Pinecone recommends batches of ≤100 vectors
      const BATCH_SIZE = 100;
      for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
        await index.upsert(vectors.slice(i, i + BATCH_SIZE));
      }

      console.log(`[Vector Store]: Upserted ${chunks.length} chunks to Pinecone index '${process.env.PINECONE_INDEX || 'pdf-documents'}'.`);
      return true;
    } catch (error) {
      console.warn('[Vector Store Warning]: Pinecone upsert failed. Falling back to in-memory store.', error.message || error);
    }
  } else {
    console.warn('[Vector Store Warning]: PINECONE_API_KEY not set. Using in-memory vector store.');
  }

  // Fallback to in-memory vector store
  const existing = memoryVectorStore.get(collectionName) || [];
  memoryVectorStore.set(collectionName, [...existing, ...chunks]);
  console.log(`[Vector Store]: Saved ${chunks.length} chunks to Memory Vector Store '${collectionName}'.`);
  return true;
}

/**
 * Searches for the most relevant document chunks matching a query vector.
 *
 * @param {Array<number>} queryEmbedding - Vector embedding of the user query
 * @param {number} [topK=4] - Number of top relevant chunks to return
 * @param {string} [collectionName='pdf_documents'] - Target collection (used for in-memory fallback)
 * @returns {Promise<Array<{ id: string, text: string, score: number }>>}
 */
async function similaritySearch(queryEmbedding, topK = 4, collectionName = 'pdf_documents') {
  if (!queryEmbedding || !Array.isArray(queryEmbedding)) return [];

  const index = getPineconeIndex();

  if (index) {
    try {
      const result = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

      if (result && Array.isArray(result.matches) && result.matches.length > 0) {
        return result.matches.map(match => ({
          id: match.id,
          // Pinecone stores the raw text in metadata.text
          text: (match.metadata && match.metadata.text) ? match.metadata.text : '',
          score: match.score ?? 1.0, // cosine similarity 0–1
        }));
      }
      return [];
    } catch (error) {
      console.warn('[Vector Store Warning]: Pinecone query failed. Falling back to in-memory search.', error.message || error);
    }
  }

  // In-memory cosine similarity search
  const storedChunks = memoryVectorStore.get(collectionName) || [];
  if (storedChunks.length === 0) return [];

  const scored = storedChunks.map(chunk => ({
    id: chunk.id,
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Clears all vectors from the Pinecone index (or the in-memory collection).
 *
 * @param {string} [collectionName='pdf_documents']
 */
async function clearCollection(collectionName = 'pdf_documents') {
  const index = getPineconeIndex();

  if (index) {
    try {
      await index.deleteAll();
      console.log(`[Vector Store]: Cleared all vectors from Pinecone index '${process.env.PINECONE_INDEX || 'pdf-documents'}'.`);
    } catch (error) {
      console.warn('[Vector Store Warning]: Pinecone deleteAll failed:', error.message || error);
    }
  }

  memoryVectorStore.delete(collectionName);
}

module.exports = {
  addDocuments,
  similaritySearch,
  clearCollection,
};
