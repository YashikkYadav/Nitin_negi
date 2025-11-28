import { defineStore } from 'pinia'
import { AxiosPrescription } from '../apis/Prescription'

export const usePrescriptionStore = defineStore('prescriptionStore', {
  state: () => ({
    doctorId: localStorage.getItem('doctor_id') || null,
  }),

  actions: {
    async getHealthFileApiCall(patientId) {
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.HealthFile(patientId)
      return data
    },
    async getIpdFileApiCall(patientId) {
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.IpdFile(patientId)
      return data
    },
    async getPrescriptionFileApiCall(patientId) {
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.PrescriptionFile(patientId)
      return data
    },
    // Added getInvoiceFileApiCall method
    async getInvoiceFileApiCall(patientId) {
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.InvoiceFile(patientId)
      return data
    },
    // Added deleteFileApiCall method
    async deleteFileApiCall(patientId, fileId) {
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.DeleteFile(patientId, fileId)
      return data
    },
    async getPrescriptionSectionsApiCall() {
      // console.log("Getting prescription sections with doctorId:", this.doctorId);
      if (!this.doctorId) {
        console.error("Doctor ID is missing for prescription sections");
        throw new Error("Doctor ID is required");
      }
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.PrescriptionSections(this.doctorId)
      return data
    },
    async addPrescriptionSectionsApiCall(payload) {
      console.log("Adding prescription sections with doctorId:", this.doctorId);
      if (!this.doctorId) {
        console.error("Doctor ID is missing for adding prescription sections");
        throw new Error("Doctor ID is required");
      }
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.AddPrescriptionSections(this.doctorId, payload)
      return data
    },
    async deletePrescriptionSectionsApiCall(payload) {
      console.log("Deleting prescription sections with doctorId:", this.doctorId);
      if (!this.doctorId) {
        console.error("Doctor ID is missing for deleting prescription sections");
        throw new Error("Doctor ID is required");
      }
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.DeletePrescriptionSections(this.doctorId, payload)
      return data
    },
    async getDraftPrescriptionApiCall(patientId) {
      // console.log("Getting draft prescription with doctorId:", this.doctorId, "patientId:", patientId);
      if (!this.doctorId) {
        console.error("Doctor ID is missing for draft prescription");
        throw new Error("Doctor ID is required");
      }
      if (!patientId) {
        console.error("Patient ID is missing for draft prescription");
        throw new Error("Patient ID is required");
      }
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.DraftPrescription(this.doctorId, patientId)
      return data
    },
    async savePrescriptionApiCall(patientId, payload) {
      console.log("Saving prescription with doctorId:", this.doctorId, "patientId:", patientId);
      if (!this.doctorId) {
        console.error("Doctor ID is missing for saving prescription");
        throw new Error("Doctor ID is required");
      }
      if (!patientId) {
        console.error("Patient ID is missing for saving prescription");
        throw new Error("Patient ID is required");
      }
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.SavePrescription(this.doctorId, patientId, payload)
      return data
    },
    async endConsultationApiCall(patientId, payload) {
      console.log("Ending consultation with doctorId:", this.doctorId, "patientId:", patientId);
      if (!this.doctorId) {
        console.error("Doctor ID is missing for ending consultation");
        throw new Error("Doctor ID is required");
      }
      if (!patientId) {
        console.error("Patient ID is missing for ending consultation");
        throw new Error("Patient ID is required");
      }
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.EndConsultation(this.doctorId, patientId, payload)
      return data
    },
    async uploadFileApiCall(patientId, payload) {
      console.log("Uploading file with patientId:", patientId);
      if (!patientId) {
        console.error("Patient ID is missing for file upload");
        throw new Error("Patient ID is required");
      }
      const PrescriptionService = new AxiosPrescription()
      const data = await PrescriptionService.UploadFile(patientId, payload)
      return data
    },
  },
})