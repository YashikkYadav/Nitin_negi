import axiosAuthenticator from "@/plugins/axios";

const apiClient = new axiosAuthenticator();

/**
 * Send a query to the chatbot
 * @param {string} query - The user's query
 * @returns {Promise<Object>} The chatbot response
 */
export const sendChatBotQuery = async (query) => {
    try {
        const response = await apiClient.post(`/chatbot`, {
            query
        });
        return response;
    } catch (error) {
        console.error('Error sending chatbot query:', error);
        throw error;
    }
};