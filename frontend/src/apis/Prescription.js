import axiosAuthenticator from "@/plugins/axios";

export class AxiosPrescription {
    apiClient;
    constructor() {
        this.apiClient = new axiosAuthenticator()
    }

    HealthFile(patientId) {
        return this.apiClient.get(`/${patientId}/file/health`)
    }

    IpdFile(patientId) {
        return this.apiClient.get(`/${patientId}/file/ipd`)
    }

    PrescriptionFile(patientId) {
        return this.apiClient.get(`/${patientId}/file/prescription`)
    }

    // Added InvoiceFile method
    InvoiceFile(patientId) {
        return this.apiClient.get(`/${patientId}/file/invoice`)
    }

    // Added DeleteFile method - fixed the URL structure
    DeleteFile(patientId, fileId) {
        return this.apiClient.delete(`/${patientId}/file/${fileId}`)
    }

    PrescriptionSections(doctorId) {
        return this.apiClient.get(`/${doctorId}/prescription-section`)
    }

    AddPrescriptionSections(doctorId, payload) {
        return this.apiClient.post(`/${doctorId}/prescription-section`, payload)
    }

    DeletePrescriptionSections(doctorId, sectionId) {
        return this.apiClient.delete(`/${doctorId}/prescription-section/${sectionId}`)
    }

    DraftPrescription(doctorId, patientId) {
        return this.apiClient.get(`/${doctorId}/prescription/${patientId}/draft`)
          .catch(error => {
            // Handle 404 specifically for draft prescriptions
            if (error.response && error.response.status === 404) {
              // Return a special value indicating no draft exists
              return { prescription: 'Prescription is not drafted yet.' };
            }
            // Re-throw other errors
            throw error;
          });
    }

    SavePrescription(doctorId, patientId, payload) {
        return this.apiClient.post(`/${doctorId}/prescription/${patientId}`, payload)
    }

    EndConsultation(doctorId, patientId, payload) {
        return this.apiClient.post(`/${doctorId}/prescription/${patientId}/end-consultation`, payload)
    }

    UploadFile(patientId, payload) {
        return this.apiClient.post(`/${patientId}/file/upload`, payload)
    }
}