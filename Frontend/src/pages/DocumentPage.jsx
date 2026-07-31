import React, { useState } from 'react';
import { Upload, FileText, Search, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { uploadDocument, queryDocument } from '../services/api';

export default function DocumentPage() {
  const { userId, language, showToast } = useUser();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docMetadata, setDocMetadata] = useState(null);

  const [query, setQuery] = useState('');
  const [querying, setQuerying] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please select a valid PDF file.', 'error');
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a PDF document to upload.', 'error');
      return;
    }

    setUploading(true);
    try {
      const data = await uploadDocument(file);
      if (data && data.success) {
        setDocMetadata({
          fileName: data.fileName,
          numPages: data.numPages,
          totalChunks: data.totalChunks,
        });
        showToast(`Document "${data.fileName}" indexed successfully into Vector RAG!`, 'success');
      } else {
        throw new Error(data?.error || 'Failed to upload document.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      showToast(err.message || 'Error uploading document.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setQuerying(true);
    try {
      const data = await queryDocument({
        query: query.trim(),
        userId: userId,
        language: language,
      });

      if (data && data.success) {
        setAnswerData({
          answer: data.answer,
          retrievedContext: data.retrievedContext,
          language: data.language,
        });
      } else {
        throw new Error(data?.error || 'Failed to query document.');
      }
    } catch (err) {
      console.error('Query Error:', err);
      showToast(err.message || 'Error querying document RAG engine.', 'error');
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl text-blue-600 dark:text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                PDF Document RAG Assistant
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Upload textbook chapters, syllabi, or project PDFs. Our Vector RAG system chunks, embeds, and indexes your file to answer questions with exact citations.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400 w-max">
            <Layers className="w-4 h-4" />
            <span>Memory Vector DB</span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Column (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Upload PDF Document</span>
            </h3>

            {/* Drop Zone Box */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all bg-slate-50 dark:bg-slate-900/50 group">
              <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-3" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {file ? file.name : 'Click to select PDF'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-4">Maximum file size: 10MB (.pdf)</p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload-input"
              />
              <label
                htmlFor="pdf-upload-input"
                className="cursor-pointer px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all"
              >
                Browse File
              </label>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Indexing Vector Store...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload & Index RAG</span>
              </>
            )}
          </button>

          {/* Indexed Metadata Badge */}
          {docMetadata && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Document Ready</span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1">
                <p>📄 File: <strong className="text-emerald-900 dark:text-emerald-100">{docMetadata.fileName}</strong></p>
                <p>📑 Pages: {docMetadata.numPages}</p>
                <p>🧩 Chunks: {docMetadata.totalChunks} Vectors</p>
              </div>
            </div>
          )}
        </div>

        {/* Query & RAG Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-5 shadow-sm transition-colors duration-300">
          
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Ask Questions About Indexed PDF</span>
            </h3>

            <form onSubmit={handleQuery} className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. What are the main concepts in chapter 2? or Summarize page 4..."
                disabled={querying}
                className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={querying || !query.trim()}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {querying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Search RAG</span>
              </button>
            </form>
          </div>

          {/* Answer Display Card */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-inner overflow-y-auto max-h-[450px]">
            {answerData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>RAG Answer</span>
                  </span>
                  <span className="text-[10px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400 font-mono uppercase">
                    Language: {answerData.language || 'en'}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {answerData.answer}
                </p>

                {/* Source Context Accordion */}
                {answerData.retrievedContext && answerData.retrievedContext.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setShowSources(!showSources)}
                      className="flex items-center justify-between w-full text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span>Retrieved PDF Chunks ({answerData.retrievedContext.length})</span>
                      {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showSources && (
                      <div className="mt-3 space-y-2">
                        {answerData.retrievedContext.map((chunk, idx) => {
                          const chunkText = typeof chunk === 'string' ? chunk : (chunk.text || JSON.stringify(chunk));
                          const score = chunk.score ? Math.round(chunk.score * 100) : null;

                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Chunk #{idx + 1}</span>
                                {score !== null && (
                                  <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-blue-700 dark:text-blue-400">
                                    Score: {score}%
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 leading-normal whitespace-pre-wrap">{chunkText}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-600 space-y-2">
                <BookOpen className="w-10 h-10 opacity-30 mb-2 text-slate-400 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-500">No document query performed yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm">
                  Upload a PDF document on the left and type your query above to search vector memory.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
