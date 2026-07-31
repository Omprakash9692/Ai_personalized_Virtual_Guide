const pdfModule = require('pdf-parse');


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
    // Pass Uint8Array view of buffer to constructor options
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
 * Extracts raw text from a PDF Buffer or File.
 * 
 * @param {Buffer} fileBuffer - Buffer containing PDF file data
 * @returns {Promise<{ text: string, numPages: number, info: Object }>} Extracted text and document metadata
 */
async function loadPdfText(fileBuffer) {
  try {
    const parsed = await parsePdfBuffer(fileBuffer);

    // Clean text (normalize whitespace, page footers, and control characters)
    const cleanedText = (parsed.text || '')
      .replace(/-- \d+ of \d+ --/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\u0000/g, '')
      .trim();

    if (!cleanedText) {
      throw new Error('No readable text content found in the provided PDF file.');
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
