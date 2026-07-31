const express = require('express');
const { handleChat, handleGetHistory, handleClearHistory } = require('../controllers/chat.controller');

const router = express.Router();

/**
 * POST /api/chat
 * Body: { "message": "Your prompt here" }
 */
router.post('/chat', handleChat);

router.get('/chat/history/:userId', handleGetHistory);
router.delete('/chat/history/:userId', handleClearHistory);

module.exports = router;
