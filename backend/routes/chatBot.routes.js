const express = require('express');
const router = express.Router();
const { handleChatBotQuery } = require('../controllers/chatBot.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST route for chatbot queries (protected)
router.post('/', authMiddleware, handleChatBotQuery);

module.exports = router;