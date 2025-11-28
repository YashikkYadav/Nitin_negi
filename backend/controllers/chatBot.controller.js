const { chatBotQueryService, getChatBotHistory } = require('../services/chatBot.service');

// Handle chatbot queries via POST route
const handleChatBotQuery = async (req, res) => {
  try {
    const { query } = req.body;
    const { doctorId } = req.user; // Get doctorId from authenticated user
    
    if (!query) {
      return res.json({ success: false, message: 'Query is required', statusCode: 400 });
    }
    
    // Process the query using the service
    const result = await chatBotQueryService(doctorId, query);
    
    return res.json({ success: true, message: 'Query processed successfully', statusCode: 200, data: result });
  } catch (error) {
    return res.json({ success: false, message: error.message, statusCode: 500 });
  }
};

module.exports = {
  handleChatBotQuery
};