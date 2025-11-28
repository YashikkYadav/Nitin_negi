import axiosAuthenticator from "@/plugins/axios";

export class AxiosVoiceRx {
    apiClient;
    constructor() {
        this.apiClient = new axiosAuthenticator()
    }

    transcribeAudio(payload) {
        const formData = new FormData();
        formData.append('audio', payload);
        return this.apiClient.post(`/voiceRx/transcribe`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}