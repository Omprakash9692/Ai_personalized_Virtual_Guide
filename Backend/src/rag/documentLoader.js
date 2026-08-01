const pdfModule = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Minimum character threshold — below this we consider the PDF as image/scanned
const MIN_TEXT_LENGTH = 50;

async function parsePdfBuffer(fileBuffer) {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid input: fileBuffer must be a valid Buffer.');
  }

  // Handle pdf-parse v1.x (function export)
  if (typeof pdfModule === 'function') {
    const data = await pdfModule(fileBuffer);
    return {
      text: data.text || '',
      numPages: data.numpages || 1,
      info: data.info || {},
    };
  }

  // Handle pdf-parse v2.x (class export)
  if (pdfModule && typeof pdfModule.PDFParse === 'function') {
    const uint8Array = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);

    const parser = new pdfModule.PDFParse({
      data: uint8Array,
      verbosity: 0,
    });

    if (typeof parser.load === 'function') {
      await parser.load();
    }

    let textContent = '';
    let numPages = 1;

    if (typeof parser.getText === 'function') {
      const result = await parser.getText();
      if (typeof result === 'string') {
        textContent = result;
      } else if (result && typeof result.text === 'string') {
        textContent = result.text;
        if (result.total) numPages = result.total;
      } else if (result && Array.isArray(result.pages)) {
        textContent = result.pages.map(p => p.text || '').join('\n');
        numPages = result.pages.length;
      } else if (result && typeof result === 'object') {
        textContent = Object.values(result).join('\n');
      }
    }

    return {
      text: textContent,
      numPages: numPages,
      info: {},
    };
  }

  throw new Error('Unsupported pdf-parse module format.');
}

/**
 * Uses Gemini Vision to extract text from a scanned / image-based PDF.
 * Gemini natively supports PDF files — no external OCR binary needed.
 *
 * @param {Buffer} fileBuffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextWithGemini(fileBuffer) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.startsWith('AQ.')) {
    throw new Error('GEMINI_API_KEY is required for OCR on scanned PDFs.');
  }

  console.log('[Document Loader]: Text layer empty — falling back to Gemini Vision OCR...');

  const base64Data = fileBuffer.toString('base64');

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: `Extract all the text content from this PDF document exactly as it appears.
- Preserve paragraphs, headings, and logical structure.
- If the document contains tables, extract them as plain text rows.
- Do NOT summarize, translate, or paraphrase — return only the raw extracted text.
- Support all languages including English, Hindi, and Odia.`,
          },
        ],
      },
    ],
  });

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text.trim()) {
    throw new Error('Gemini Vision OCR returned no text from the PDF.');
  }

  console.log(`[Document Loader]: Gemini OCR extracted ${text.length} characters from scanned PDF.`);
  return text.trim();
}

/**
 * Extracts raw text from a PDF Buffer.
 * Tries pdf-parse first (fast, text-layer PDFs).
 * Falls back to Gemini Vision OCR for scanned / image-based PDFs.
 *
 * @param {Buffer} fileBuffer - Buffer containing PDF file data
 * @returns {Promise<{ text: string, numPages: number, info: Object }>}
 */
async function loadPdfText(fileBuffer) {
  try {
    const parsed = await parsePdfBuffer(fileBuffer);

    // Clean text (normalize whitespace, page footers, and control characters)
    let cleanedText = (parsed.text || '')
      .replace(/-- \d+ of \d+ --/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\u0000/g, '')
      .trim();

    // If text layer is empty or too short, the PDF is likely scanned — use Gemini OCR
    if (cleanedText.length < MIN_TEXT_LENGTH) {
      cleanedText = await extractTextWithGemini(fileBuffer);
    } else {
      console.log(`[Document Loader]: Extracted ${cleanedText.length} characters via pdf-parse (text layer).`);
    }

    return {
      text: cleanedText,
      numPages: parsed.numPages || 1,
      info: parsed.info || {},
    };
  } catch (error) {
    console.error('[Document Loader Error]:', error.message || error);
    throw new Error(`Failed to extract text from PDF document: ${error.message || 'Unknown error'}`);
  }
}

module.exports = {
  loadPdfText,
};
