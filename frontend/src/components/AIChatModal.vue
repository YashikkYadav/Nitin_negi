<template>
  <v-dialog 
    v-model="dialog" 
    max-width="500px"
  >
    <v-card>
      <v-card-title class="headline primary white--text">
        AI Assistant     
      </v-card-title>
      
      <v-card-text class="pa-0" style="height: 400px;">
        <div class="chat-container" ref="chatContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message', message.sender]"
          >
            <div class="message-content">
              <!-- Display message with line breaks -->
              <span v-if="message.sender === 'bot'" v-html="formatBotMessage(message.text)"></span>
              <span v-else>{{ message.text }}</span>
            </div>
            <div class="timestamp">{{ formatTime(message.timestamp) }}</div>
          </div>
          
          <div v-if="loading" class="message bot">
            <div class="message-content">
              <v-progress-circular indeterminate size="20" width="2"></v-progress-circular>
              Thinking...
            </div>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="pa-3">
        <v-text-field
          v-model="userInput"
          label="Ask me anything..."
          outlined
          dense
          hide-details
          @keyup.enter="sendMessage"
          :disabled="loading"
        ></v-text-field>
        <v-btn 
          
          color="primary" 
          @click="sendMessage" 
          :disabled="!userInput.trim() || loading"
          class="ml-2 sendbtn"
          icon
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { sendChatBotQuery } from '@/apis/ChatBot';

export default {
  name: "AIChatModal",
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: this.value,
      userInput: '',
      loading: false,
      messages: [
        {
          sender: 'bot',
          text: 'Hello! I am your  AI Assistant. How can I help you today?',
          timestamp: new Date()
        }
      ]
    };
  },
  watch: {
    value(newVal) {
      this.dialog = newVal;
    },
    dialog(newVal) {
      this.$emit('input', newVal);
    }
  },
  methods: {
    close() {
      this.dialog = false;
      this.userInput = '';
      this.$emit('input', false);
    },
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    // Format bot messages to convert line breaks to HTML <br> tags
    formatBotMessage(text) {
      if (!text) return '';
      return text.replace(/\n/g, '<br>');
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.loading) return;
      
      // Add user message to chat
      const userMessage = {
        sender: 'user',
        text: this.userInput,
        timestamp: new Date()
      };
      this.messages.push(userMessage);
      
      // Clear input and scroll to bottom
      const input = this.userInput;
      this.userInput = '';
      this.loading = true;
      this.scrollToBottom();
      
      try {
        // Call the chatbot API (doctorId is handled by backend auth)
        const response = await sendChatBotQuery(input);
        
        if (response.success) {
          // Add bot response to chat
          const botMessage = {
            sender: 'bot',
            text: response.data.message,
            timestamp: new Date()
          };
          this.messages.push(botMessage);
        } else {
          throw new Error(response.message || 'Failed to get response from AI assistant');
        }
      } catch (error) {
        const errorMessage = {
          sender: 'bot',
          text: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  },
  mounted() {
    this.scrollToBottom();
  }
};
</script>

<style scoped>
.chat-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.message {
  max-width: 80%;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 18px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #1976d2;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot {
  align-self: flex-start;
  background-color: #f1f1f1;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.4;
}
.sendbtn{

  color: #1976d2;
}
.message-content >>> br {
  display: block;
  content: "";
  margin: 4px 0;
}

.timestamp {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

@media (max-width: 600px) {
  /* Adjust for mobile */
}
</style>