import { defineStore } from 'pinia'
import { AxiosVoiceRx } from '../apis/VoiceRx'

export const useVoiceRxStore = defineStore('voiceRxStore', {
  state: () => ({
    transcription: '',
    prescription: null,
    loading: false,
    error: null
  }),

  actions: {
    async transcribeAudioApiCall(audioFile) {
      try {
        this.loading = true
        this.error = null
        
        const voiceRxService = new AxiosVoiceRx()
        const response = await voiceRxService.transcribeAudio(audioFile)
        
        // Return the full response
        return response
      } catch (error) {
        this.error = error.message || 'Failed to transcribe audio'
        return { error: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})