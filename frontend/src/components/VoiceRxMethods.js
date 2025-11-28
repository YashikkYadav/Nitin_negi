// VoiceRxMethods.js
import { useUiStore } from '@/store/UiStore';
import { useVoiceRxStore } from '@/store/VoiceRxStore';

export const voiceRxMethods = {
  methods: {
    async startRecording() {
      // Close the dialog
      this.voiceRxDialog = false;
      
      // For now, we'll just show an alert that this feature is not fully implemented
      // In a real implementation, this would start recording audio
      alert('Voice recording feature would start here. In a full implementation, this would record audio and send it to the VoiceRx API.');
    },
    
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Close the dialog
      this.voiceRxDialog = false;
      
      // Show processing message
      useUiStore().openNotificationMessage("Processing audio file...", "", "info");
      
      try {
        // Use the VoiceRx store
        const voiceRxStore = useVoiceRxStore();
        
        // Call the transcribe API
        const result = await voiceRxStore.transcribeAudioApiCall(file);
        
        if (result.error) {
          useUiStore().openNotificationMessage(result.error, "", "error");
        } else {
          useUiStore().openNotificationMessage("Audio processed successfully!", "", "success");
          // Handle successful transcription and prescription formatting
          this.handleVoiceRxResult(result);
        }
      } catch (error) {
        useUiStore().openNotificationMessage("Failed to process audio file", "", "error");
        console.error('VoiceRx error:', error);
      }
    },
    
    handleVoiceRxResult(result) {
      // This method would populate the prescription form with the transcribed data
      useUiStore().openNotificationMessage('Audio processed successfully! In a full implementation, this would populate the prescription form.', "", "success");
      
      // Here you would map the result.prescription data to your form fields
      // For example:
      // if (result.prescription.complaints) {
      //   this.complaintsList = result.prescription.complaints.map(c => ({ name: c.text }));
      // }
      // And so on for other fields...
    }
  }
};