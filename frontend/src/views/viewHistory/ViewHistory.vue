<template>
  <v-container style="max-width: 100%;" class="history-page">
    <h2 class="text-center mb-4">Patient Prescription Page</h2>
    <v-row class="justify-end mb-3">
      <v-col cols="auto">
        <router-link :to="`/${patient._id}/consult`" style="text-decoration: none; color: inherit;">
          <v-btn class="saaro-btn" @click="createNewVisit">Create New Visit</v-btn>
        </router-link>
      </v-col>
    </v-row>

    <v-card class="patient-card mb-4">
      <v-card-title>
        <div>
          <h3 class="font-weight-bold">{{ patient.fullName }}</h3>
          <p>UID: {{ patient.uid }}</p>
        </div>
      </v-card-title>
      <v-card-text>
        <p v-if="patient.phoneNumber">Contact: {{ patient.phoneNumber }}</p>
        <p v-if="patient.email">Email: {{ patient.email }}</p>
        <p v-if="patient.gender">Gender: {{ patient.gender }}</p>
        <p v-if="patient.age">Age: {{ patient.age }}</p>
        <p v-if="patient.bloodGroup">Blood Group: {{ patient.bloodGroup }}</p>
        <p v-if="patient.allergies">Allergies: {{ patient.allergies }}</p>
        <p v-if="patient.dateOfBirth">Date of Birth: {{ formatedDate(patient.dateOfBirth) }}</p>
        <p v-if="patient.tags">Category: {{ patient.tags }}</p>
        <p v-if="patient.address">Address: {{ patient.address }}</p>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col class="v-col-12">
        <h4 class="section-title prescription-card-heading">Past Prescriptions</h4>
      </v-col>
      <v-col v-for="prescription in pastPrescriptions" :key="prescription.id" cols="12" md="6">
        <v-card class="prescription-card mb-4" @click="pdfDialogHandle(prescription)">
          <v-card-title>
            <span class="font-weight-bold">Prescription ID: {{ prescription.count }}</span>
          </v-card-title>
          <v-card-text>
            <p><strong>Date:</strong> {{ formatedDate(prescription.date) }}</p>
            <p><strong>Diagnosis:</strong> {{ prescription.diagnosis.join(', ') || 'No Diagnosis Added' }}</p>
            <p><strong>Medicines:</strong> {{ prescription.medicines.join(', ') || 'No Medicines Added' }}</p>
            <p><strong>investigation Advice:</strong> {{ prescription.investigationsAdviced.join(', ') || 'No Investigation Advice Added' }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="pdfDialog" class="height: auto">
      <v-card class="print-popup w-66 d-flex" style="margin: 0 auto;">
        <v-card-title class="headline">Past Prescription</v-card-title>
        <v-card-text class="d-flex pr-0">
          <v-row class="w-75">
            <v-col class="v-col-12 m-0" style="height: 80vh;">
              <div style="border: 1px solid #ccc; height: 100%; overflow: hidden;">
                <iframe :src="pdfUrl" width="100%" height="100%" style="border: none;"></iframe>
              </div>
            </v-col>
          </v-row>
          <v-row class="justify-center">
            <v-col class="v-col-10">
              <div class="text-center pb-10">
                <v-text-field variant="outlined" v-model="emailInput" label="Email" outlined></v-text-field>
                <v-btn class="saaro-btn" @click="sharePrescription('Email')">Email</v-btn>
              </div>
              <div class="text-center">
                <v-text-field variant="outlined" v-model="phoneInput" label="Phone Number" outlined></v-text-field>
                <v-btn class="saaro-btn" @click="sharePrescription('WhatsApp/SMS')">WhatsApp/SMS</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="close-btn">
          <v-spacer></v-spacer>
          <v-btn class="saaro-btn" text @click="closePdfDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row>
      <v-col class="v-col-9">
        <h4 class="section-title prescription-card-heading">Health Records</h4>
      </v-col>
      <v-col class="text-center v-col-3">
        <v-btn class="saaro-btn" @click="triggerFileUpload('health')">Upload Health Record</v-btn>
        <input ref="healthFileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" class="d-none"
          @change="handleFileUpload('health')" />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="record in healthRecords" :key="record.id" cols="12" md="6">
        <v-card class="health-record-card mb-4">
          <v-card-title>
            <span class="font-weight-bold">Document:</span>
            <v-btn icon @click="deleteFile(record, 'health')" class="float-right">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <img :src="record.fileUrl" alt="Health Record" style="width: 250px; height: 250px; object-fit: cover;" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="v-col-9">
        <h4 class="section-title prescription-card-heading">IPD Records</h4>
      </v-col>
      <v-col class="text-center v-col-3">
        <v-btn class="saaro-btn" @click="triggerFileUpload('ipd')">Upload IPD Record</v-btn>
        <input ref="ipdFileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" class="d-none"
          @change="handleFileUpload('ipd')" />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="record in ipdRecords" :key="record.id" cols="12" md="6">
        <v-card class="record-card mb-4">
          <v-card-title>
            <span class="font-weight-bold">Document:</span>
            <v-btn icon @click="deleteFile(record, 'ipd')" class="float-right">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </v-card-title>
           <v-card-text>
            <img :src="record.fileUrl" alt="IPD Record" style="width: 250px; height: 250px; object-fit: cover;" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Invoice Records Section -->
    <v-row>
      <v-col class="v-col-9">
        <h4 class="section-title prescription-card-heading">Invoice Records</h4>
      </v-col>
      <v-col class="text-center v-col-3">
        <v-btn class="saaro-btn" @click="triggerFileUpload('invoice')">Upload Invoice</v-btn>
        <input ref="invoiceFileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" class="d-none"
          @change="handleFileUpload('invoice')" />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="record in invoiceRecords" :key="record.id" cols="12" md="6">
        <v-card class="record-card mb-4">
          <v-card-title>
            <span class="font-weight-bold">Document:</span>
            <v-btn icon @click="deleteFile(record, 'invoice')" class="float-right">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </v-card-title>
           <v-card-text>
            <img :src="record.fileUrl" alt="Invoice Record" style="width: 250px; height: 250px; object-fit: cover;" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { checkAuth, getDateFormate } from '@/lib/utils/utils';
import { usePatientStore } from '@/store/PatientStore';
import { usePrescriptionStore } from '@/store/PrescriptionStore';
import { useUiStore } from '@/store/UiStore';

export default {
  data() {
    return {
      patient: {},
      pastPrescriptions: [],
      ipdRecords: [],
      healthRecords: [],
      invoiceRecords: [], // Added invoice records array
      emailInput: '',
      phoneInput: '',
      pdfDialog: false,
      pdfUrl: '',
    };
  },
  mounted() {
    const auth = checkAuth(this.$router);
    if (auth) {
      this.fetchPatientDetails();
      this.fetchHealthFiles();
      this.fetchIpdFiles();
      this.fetchInvoiceFiles(); // Added fetch invoice files
      this.fetchPrescriptionFiles();
    }
  },
  methods: {
    async fetchPatientDetails() {
      const patientId = this.$route.params.patientId;
      const res = await usePatientStore().getPatientDetailsApiCall(patientId)

      if (res) {
        this.patient = res.patient;
      }
    },
    async fetchHealthFiles() {
      const patientId = this.$route.params.patientId;
      const res = await usePrescriptionStore().getHealthFileApiCall(patientId)

      if (res) {
        for (let i = 0; i < res.files.length; i++) {
          this.healthRecords.push(res.files[i]);
        }
      }
    },
    async fetchIpdFiles() {
      const patientId = this.$route.params.patientId;
      const res = await usePrescriptionStore().getIpdFileApiCall(patientId)

      if (res) {
        for (let i = 0; i < res.files.length; i++) {
          this.ipdRecords.push(res.files[i]);
        }
      }
    },
    // Added fetchInvoiceFiles method
    async fetchInvoiceFiles() {
      const patientId = this.$route.params.patientId;
      const res = await usePrescriptionStore().getInvoiceFileApiCall(patientId)

      if (res) {
        for (let i = 0; i < res.files.length; i++) {
          this.invoiceRecords.push(res.files[i]);
        }
      }
    },
    async fetchPrescriptionFiles() {
      const patientId = this.$route.params.patientId;
      const res = await usePrescriptionStore().getPrescriptionFileApiCall(patientId)

      if (res) {
        // Filter to show only completed prescriptions
        const completedPrescriptions = res.files.filter(item => item.status === 'complete');
        
        let counter = 1;
        this.pastPrescriptions = completedPrescriptions.map((item) => ({
          count: counter++,
          id: item._id,
          medicines: item.medications.map((med) => med.name),
          diagnosis: item.diagnosis.map((diag) => diag.type),
          date: new Date(item.createdAt).toLocaleDateString(),
          investigationsAdviced: item?.investigationsAdviced.map((invest) => invest.name),
          pdfUrl: `${import.meta.env.VITE_SERVER_URL}/public/prescriptions/prescription_${item._id}.pdf`,
        }));
      }
    },
    triggerFileUpload(type) {
      if (type === "health") {
        this.$refs.healthFileInput.click();
      } else if (type === "ipd") {
        this.$refs.ipdFileInput.click();
      } else if (type === "invoice") { // Added invoice upload trigger
        this.$refs.invoiceFileInput.click();
      }
    },
    pdfDialogHandle(item) {
      this.emailInput = this.patient.email;
      this.phoneInput = this.patient.phoneNumber;
      this.pdfUrl = `${import.meta.env.VITE_SERVER_URL}/public/prescriptions/prescription_${item.id}.pdf`;
      this.pdfDialog = true;
    },
    closePdfDialog() {
      this.pdfUrl = '';
      this.pdfDialog = false;
    },
    sharePrescription(method) {
      if (method === 'WhatsApp/SMS') {
        useUiStore().openNotificationMessage("Prescription shared via WhatsApp/SMS!");
      } else if (method === 'Email') {
        useUiStore().openNotificationMessage("Prescription sent via Email!");
      } else if (method === 'Print') {
        useUiStore().openNotificationMessage("Prescription printed!");
      }
      this.closePdfDialog();
    },
    async handleFileUpload(type) {
      const fileInput =
        type === "health" ? this.$refs.healthFileInput : 
        type === "ipd" ? this.$refs.ipdFileInput : 
        this.$refs.invoiceFileInput; // Added invoice file input reference
      const file = fileInput.files[0];

      if (!file) {
        return;
      }

      const fileType = file.type.startsWith("image") ? "image" : "pdf";
      const filePreviewUrl = URL.createObjectURL(file);

      const newRecord = {
        id: Date.now(),
        fileName: file.name,
        type: fileType,
        fileUrl: filePreviewUrl,
        date: new Date().toLocaleDateString()
      };

      if (type === "health") {
        this.healthRecords.push(newRecord);
      } else if (type === "ipd") {
        this.ipdRecords.push(newRecord);
      } else if (type === "invoice") { // Added invoice record handling
        this.invoiceRecords.push(newRecord);
      }

      // Upload file to the server
      const patientId = this.$route.params.patientId;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", type);

      const res = await usePrescriptionStore().uploadFileApiCall(patientId, formData)
    },
    async deleteFile(record, type) {
      // Confirm deletion
      if (!confirm("Are you sure you want to delete this file?")) {
        return;
      }

      // Check if this is a temporary record (not yet saved to database)
      const recordId = record._id || record.id;
      
      // If recordId is not a valid MongoDB ObjectId, it's a temporary record
      // MongoDB ObjectIds are 24-character hexadecimal strings
      if (typeof recordId === 'number' || (typeof recordId === 'string' && recordId.length !== 24)) {
        // This is a temporary record, just remove it from UI
        if (type === "health") {
          this.healthRecords = this.healthRecords.filter(item => (item._id || item.id) !== recordId);
        } else if (type === "ipd") {
          this.ipdRecords = this.ipdRecords.filter(item => (item._id || item.id) !== recordId);
        } else if (type === "invoice") {
          this.invoiceRecords = this.invoiceRecords.filter(item => (item._id || item.id) !== recordId);
        }
        
        useUiStore().openNotificationMessage("File removed successfully!");
        return;
      }

      try {
        const patientId = this.$route.params.patientId;
        
        // Call backend API to delete the file from server and database
        const res = await usePrescriptionStore().deleteFileApiCall(patientId, recordId)
        
        // Remove from UI
        if (type === "health") {
          this.healthRecords = this.healthRecords.filter(item => (item._id || item.id) !== recordId);
        } else if (type === "ipd") {
          this.ipdRecords = this.ipdRecords.filter(item => (item._id || item.id) !== recordId);
        } else if (type === "invoice") {
          this.invoiceRecords = this.invoiceRecords.filter(item => (item._id || item.id) !== recordId);
        }

        useUiStore().openNotificationMessage("File deleted successfully!");
      } catch (error) {
        console.error("Error deleting file:", error);
        useUiStore().openNotificationMessage("Error deleting file!", "", "error");
      }
    },
    createNewVisit() {
      console.log("Creating a new visit...");
    },
    downloadDocument(url) {
      window.open(url, "_blank");
    },
    formatedDate(date) {
      return getDateFormate(date);
    },
  }
};
</script>