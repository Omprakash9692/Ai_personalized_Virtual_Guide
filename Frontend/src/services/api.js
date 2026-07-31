import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120s timeout for RAG / LLM / File processing
});

// Interceptor to attach JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Health check endpoint
 */
export const checkHealth = async () => {
  try {
    const res = await apiClient.get('/health');
    return res.data;
  } catch (error) {
    console.error('Health Check Failed:', error);
    return { status: 'ERROR', message: error.message };
  }
};

/**
 * Multi-turn AI Chat API
 * @param {Object} payload { message, userId, sessionId, type, language, context, voiceEnabled }
 */
export const sendChatMessage = async (payload) => {
  const res = await apiClient.post('/api/chat', payload);
  return res.data;
};

/**
 * Fetch chat history for a given user
 * @param {string} userId
 */
export const getChatHistory = async (userId) => {
  const res = await apiClient.get(`/api/chat/history/${encodeURIComponent(userId)}`);
  return res.data;
};

/**
 * Clear chat history for a given user
 * @param {string} userId
 */
export const clearChatHistory = async (userId) => {
  const res = await apiClient.delete(`/api/chat/history/${encodeURIComponent(userId)}`);
  return res.data;
};

/**
 * Upload PDF Document for RAG indexing
 * @param {File} file PDF File object
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  // Note: Do NOT set 'Content-Type': 'multipart/form-data' explicitly in Axios
  // Axios will automatically attach the correct multipart boundary header.
  const res = await apiClient.post('/api/document/upload', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
  return res.data;
};

/**
 * Query indexed PDF Document via RAG
 * @param {Object} payload { query, userId, sessionId, language }
 */
export const queryDocument = async (payload) => {
  const res = await apiClient.post('/api/document/query', payload);
  return res.data;
};

/**
 * Save or Update User Profile
 * @param {Object} profileData { userId, name, email, preferredLanguage, department, semester, learningGoal, interests }
 */
export const saveUserProfile = async (profileData) => {
  const res = await apiClient.post('/api/user/profile', profileData);
  return res.data;
};

/**
 * Fetch User Profile by ID
 * @param {string} userId
 */
export const getUserProfile = async (userId) => {
  const res = await apiClient.get(`/api/user/profile/${encodeURIComponent(userId)}`);
  return res.data;
};

/**
 * Text-to-Speech (Sarvam AI Bulbul) Synthesis
 * @param {Object} payload { text, language, speaker, pace }
 */
export const synthesizeVoice = async (payload) => {
  const res = await apiClient.post('/api/voice/speak', payload);
  return res.data;
};

/**
 * Generate 1-Page Notes, Mindmap, and 5 PYQs for a given topic
 * @param {Object} payload { topic }
 */
export const generateStudyMaterial = async (payload) => {
  const res = await apiClient.post('/api/study/generate', payload);
  return res.data;
};

/**
 * Fetch a Viva question based on branch, subject, and persona
 * @param {Object} payload { branch, subject, persona, previousTurns }
 */
export const getVivaQuestion = async (payload) => {
  const res = await apiClient.post('/api/viva/question', payload);
  return res.data;
};

/**
 * Evaluate student's spoken/written Viva answer
 * @param {Object} payload { question, studentAnswer, branch, subject, persona }
 */
export const submitVivaAnswer = async (payload) => {
  const res = await apiClient.post('/api/viva/evaluate', payload);
  return res.data;
};

/**
 * Register a new user
 * @param {Object} payload { name, email, password }
 */
export const registerUser = async (payload) => {
  const res = await apiClient.post('/api/auth/register', payload);
  return res.data;
};

/**
 * Login existing user
 * @param {Object} payload { email, password }
 */
export const loginUser = async (payload) => {
  const res = await apiClient.post('/api/auth/login', payload);
  return res.data;
};

export default apiClient;
