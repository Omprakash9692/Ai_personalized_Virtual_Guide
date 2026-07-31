require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat.routes');
const documentRoutes = require('./routes/document.routes');
const voiceRoutes = require('./routes/voice.routes');
const userRoutes = require('./routes/user.routes');
const studyRoutes = require('./routes/study.routes');
const vivaRoutes = require('./routes/viva.routes');
const authRoutes = require('./routes/auth.routes');
const { protect } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database (non-blocking — services have in-memory fallback)
connectDB().catch((err) => {
  console.error('[Startup Error - Database]:', err.message);
});

// Enable CORS middleware for all origins & headers
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware for parsing JSON & URL-encoded requests (50MB limit)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes); // Auth routes should NOT be protected
app.use('/api', protect, chatRoutes); // Protect chat
app.use('/api/document', protect, documentRoutes);
app.use('/api/voice', protect, voiceRoutes);
app.use('/api/user', protect, userRoutes);
app.use('/api/study', protect, studyRoutes);
app.use('/api/viva', protect, vivaRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack || err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
