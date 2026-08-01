const { ingestDocument, queryRAG } = require('../rag/ragService');
const { getConversationHistory, saveMessagePair } = require('../services/memory.service');

/**
 * Upload and index a PDF document for RAG vector search.
 * 
 * @route POST /api/document/upload
 */
async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a PDF document using field name "file".',
      });
    }

    if (!req.file.originalname.toLowerCase().endsWith('.pdf') && req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        error: 'Invalid file format. Only PDF files are supported.',
      });
    }

    const result = await ingestDocument(req.file.buffer, req.file.originalname);

    return res.status(200).json({
      success: true,
      message: 'Document uploaded and indexed successfully in vector store.',
      fileName: result.fileName,
      numPages: result.numPages,
      totalChunks: result.totalChunks,
    });
  } catch (error) {
    console.error('Error in uploadDocument controller:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while uploading and processing the document.',
    });
  }
}

/**
 * Query indexed PDF documents using RAG.
 * 
 * @route POST /api/document/query
 */
async function queryDocument(req, res) {
  try {
    const {
      query,
      userId = 'default_user',
      sessionId = 'default_session',
      language = null,
    } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: "query" is required and must be a non-empty string.',
      });
    }

    // 1. Load user conversation history for RAG specifically
    const ragUserId = `${userId}_rag`;
    const history = await getConversationHistory(ragUserId);

    // 2. Perform RAG query (Vector search + Gemini/Groq generation)
    const ragResult = await queryRAG(query.trim(), {
      language: language,
      history: history,
    });

    // 3. Save query and answer in MongoDB conversation memory exclusively for RAG
    await saveMessagePair(ragUserId, query.trim(), ragResult.answer, sessionId);

    // 4. Return answer and retrieved context
    return res.status(200).json({
      success: true,
      answer: ragResult.answer,
      language: ragResult.language,
      retrievedContext: ragResult.retrievedContext,
      userId: userId,
    });
  } catch (error) {
    console.error('Error in queryDocument controller:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing the document query.',
    });
  }
}

module.exports = {
  uploadDocument,
  queryDocument,
};
