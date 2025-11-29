<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card class="add-patient-popup popup-card">
      <v-card-title class="d-flex justify-space-between align-center popup-title">
        <span>{{ isEdit ? 'Edit IPD Record' : 'Add IPD Record' }}</span>
        <v-btn size="24" icon @click="handleClose">
          <v-icon size="24">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="popup-detail">
        <v-form @submit.prevent="handleSubmit" ref="form">
          <v-row>
            <v-col cols="12" class="d-flex align-center gap-2">
              <!-- Select Patient -->
              <v-autocomplete 
                v-model="selectedPatient" 
                :items="patients" 
                item-title="title"
                item-value="value"
                label="Search Patient with name or phone number"
                :rules="[rules.required]" 
                variant="outlined" 
                dense 
                clearable 
                @update:model-value="onPatientSelected"
                v-model:search="patientSearch"
                :loading="loadingPatients"
                :no-data-text="patientSearch ? 'No patients found' : 'Start typing to search patients'"
                class="flex-grow-1">
              </v-autocomplete>

              <!-- Register Button -->
              <v-btn class="saaro-btn ml-2" @click="openRegisterDialog">
                <v-icon class="mr-2" left>mdi-account-plus</v-icon>
                Register
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field v-model="phoneNumber" label="Phone Number" variant="outlined" dense readonly
                class="readonly-dark" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="dateOfAdmission" label="Date of Admission" type="date" :rules="[rules.required]"
                variant="outlined" dense />
            </v-col>
            <v-col cols="6">
              <v-select v-model="category" :items="['Preop', 'Postop', 'Conservative']" label="Category"
                :rules="[rules.required]" variant="outlined" dense />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-switch v-model="operativeStatus" label="Operative Status" />
            </v-col>
            <v-col cols="6">
              <v-select v-model="paymentMethod" :items="['Cash', 'TPA', 'RGHS', 'CGHS']" label="Payment Method"
                :rules="[rules.required]" variant="outlined" dense />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="paymentAmount" label="Payment Amount (₹)" type="number"
                :rules="[rules.required, rules.nonNegative]" variant="outlined" dense />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="donationAmount" label="Donation Amount (₹)" type="number"
                :rules="[rules.nonNegative]" variant="outlined" dense />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="diagnosis" label="Diagnosis" :rules="[rules.required]" variant="outlined" dense />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="surgeon" label="Surgeon" variant="outlined" dense readonly
                :value="'Dr. Nitin Negi'" /> </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="wardRoomNo" label="Ward / Room No." :rules="[rules.required]" variant="outlined"
                dense />
            </v-col>
            <v-col cols="6">
              <v-textarea v-model="notes" label="Notes" variant="outlined" dense />
            </v-col>
          </v-row>
          <v-row v-if="isEdit">
            <v-col cols="12">
              <v-switch v-model="stentRemoved" label="Mark Stent as Removed" />
            </v-col>
          </v-row>
        </v-form>

        <!-- Patient Add/Edit Dialog -->
        <PatientAddEditModel :dialog="registerDialog" @close-dialog="closeRegisterDialog"
          @fetch-patients="refreshPatients" />
      </v-card-text>
      <v-card-actions class="popup-action">
        <v-btn class="saaro-btn" @click="handleClose">Cancel</v-btn>
        <v-btn class="saaro-btn" color="primary" @click="handleSubmit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { usePatientStore } from '@/store/PatientStore';
import PatientAddEditModel from './PatientAddEditModel.vue';

export default {
  name: 'IPDEntryForm',
  components: {
    PatientAddEditModel
  },
  props: {
    dialog: Boolean,
    isEditModel: Boolean,
    entry: Object,
  },
  setup(props, { emit }) {
    const selectedPatient = ref(null);
    const patients = ref([]);
    const patientDetailsLookup = ref({});
    const patientSearch = ref('');
    const loadingPatients = ref(false);
    const phoneNumber = ref('');
    const age = ref('');
    const gender = ref('');
    const dateOfAdmission = ref('');
    const category = ref('');
    const operativeStatus = ref(false);
    const paymentMethod = ref('');
    const paymentAmount = ref('');
    const donationAmount = ref('');
    const diagnosis = ref('');
    const surgeon = ref('Dr. Nitin Negi');
    const wardRoomNo = ref('');
    const notes = ref('');
    const stentRemoved = ref(false);
    const dialog = ref(props.dialog);
    const isEdit = ref(props.isEditModel || false);
    // Add debounce timeout variable
    let fetchPatientsTimeout;

    // Reset fields function
    const resetFields = () => {
      selectedPatient.value = null;
      phoneNumber.value = '';
      age.value = '';
      gender.value = '';
      dateOfAdmission.value = '';
      category.value = '';
      operativeStatus.value = false;
      paymentMethod.value = '';
      paymentAmount.value = '';
      donationAmount.value = '';
      diagnosis.value = '';
      surgeon.value = '';
      wardRoomNo.value = '';
      notes.value = '';
      stentRemoved.value = false;
    };

    watch(() => props.dialog, (val) => {
      dialog.value = val;
    });

    watch(() => props.isEditModel, (val) => {
      isEdit.value = val;
    });

    // Watch for entry prop changes and populate fields when editing
    watch(
      () => [props.entry, props.isEditModel, props.dialog],
      ([entry, isEditModel, dialogOpen]) => {
        if (isEditModel && dialogOpen && entry) {
          // Pre-fill fields for edit
          if (entry.patientId && typeof entry.patientId === 'object') {
            selectedPatient.value = entry.patientId.fullName || null;
            phoneNumber.value = entry.patientId.phoneNumber || '';
            age.value = entry.patientId.age || '';
            gender.value = entry.patientId.gender || '';
          } else if (entry.patientName) {
            selectedPatient.value = entry.patientName;
          }
          dateOfAdmission.value = entry.dateOfAdmission ? entry.dateOfAdmission.slice(0, 10) : '';
          category.value = entry.category || '';
          operativeStatus.value = !!entry.operativeStatus;
          paymentMethod.value = entry.paymentMethod || '';
          paymentAmount.value = entry.paymentAmount !== undefined ? String(entry.paymentAmount) : '';
          donationAmount.value = entry.donationAmount !== undefined ? String(entry.donationAmount) : '';
          diagnosis.value = entry.diagnosis || '';
          surgeon.value = 'Dr. Nitin Negi';
          wardRoomNo.value = entry.wardRoomNo || '';
          notes.value = entry.notes || '';
          stentRemoved.value = !!entry.stentRemoved;
        } else if (!isEditModel && dialogOpen) {
          resetFields();
        }
      },
      { immediate: true }
    );
    
    // Clear search term when a patient is selected to prevent unwanted API calls
    watch(selectedPatient, (newVal) => {
      if (newVal) {
        // Use nextTick to ensure the DOM is updated before clearing the search
        setTimeout(() => {
          patientSearch.value = '';
        }, 0);
      }
    });

    const rules = {
      required: v => !!v || 'Required',
      nonNegative: v => (v === '' || Number(v) >= 0) || 'Must be 0 or positive',
    };

    const fetchPatients = async () => {
      loadingPatients.value = true;
      try {
        console.log('Fetching patients with search term:', patientSearch.value);
        // Only fetch patients when there's a search term
        if (!patientSearch.value || patientSearch.value.trim() === '') {
          patients.value = [];
          patientDetailsLookup.value = {};
          loadingPatients.value = false;
          return;
        }
        
        const store = usePatientStore();
        // Let the server handle all filtering with the search term
        const res = await store.getAllPatientsMasterApiCall(1, 1000000, patientSearch.value);
        // console.log('API response:', res);
        // Check if res has a 'patient' array (not 'patients')
        if (res && res.patient && Array.isArray(res.patient)) {
          // console.log('First patient object:', res.patient[0]);
          // Format patients to show both name and phone number in the dropdown
          patients.value = res.patient.map(p => {
            const patientData = p.patientId || p; // Use patientId if it exists, otherwise use p directly
            return {
              title: `${patientData.fullName} (${patientData.phone || patientData.phoneNumber || ''})`,
              value: patientData.fullName
            };
          });
          // Also handle the lookup accordingly
          patientDetailsLookup.value = Object.fromEntries(res.patient.map(p => {
            const patientData = p.patientId || p;
            return [patientData.fullName, patientData];
          }));
          // console.log('Patients formatted:', patients.value);
        } else {
          patients.value = [];
          patientDetailsLookup.value = {};
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        patients.value = [];
        patientDetailsLookup.value = {};
      }
      loadingPatients.value = false;
    };
    // Add debounce to prevent too many API calls
    watch(patientSearch, () => {
      clearTimeout(fetchPatientsTimeout);
      fetchPatientsTimeout = setTimeout(() => {
        fetchPatients();
      }, 300); // 300ms debounce for server-side filtering
    });
    // Remove the initial fetch since we don't want to fetch all patients
    
    onBeforeUnmount(() => {
      if (fetchPatientsTimeout) {
        clearTimeout(fetchPatientsTimeout);
      }
    });

    const onPatientSelected = (patientName) => {
      console.log('Patient selected:');
      // console.log('Patient selected:', patientName);
      // console.log('Patient details lookup:', patientDetailsLookup.value);
      const details = patientDetailsLookup.value[patientName];
      if (details) {
        // console.log('Found patient details:', details);
        phoneNumber.value = details.phone || details.phoneNumber || '';
        age.value = details.age || '';
        gender.value = details.gender || '';
      } else {
        console.log('No patient details found for:', patientName);
        phoneNumber.value = '';
        age.value = '';
        gender.value = '';
      }
      // Don't clear the search term here, let the autocomplete handle it properly
      // patientSearch.value = '';
    };

    const handleSubmit = async () => {
      console.log('Submitting form with selected patient:', selectedPatient.value);
      console.log('Patient details lookup:', patientDetailsLookup.value);
      const patientDetails = patientDetailsLookup.value[selectedPatient.value];
      console.log('Found patient details:', patientDetails);
      
      emit('entry-saved', {
        patientId: patientDetails?._id ||
          (props.entry && props.entry.patientId && typeof props.entry.patientId === 'string' ? props.entry.patientId : undefined),
        dateOfAdmission: dateOfAdmission.value || null,
        category: category.value || null,
        operativeStatus: !!operativeStatus.value,
        paymentMethod: paymentMethod.value || null,
        paymentAmount: paymentAmount.value !== '' ? Number(paymentAmount.value) : null,
        donationAmount: donationAmount.value !== '' ? Number(donationAmount.value) : null,
        diagnosis: diagnosis.value || null,
        surgeon: 'Dr. Nitin Negi',
        wardRoomNo: wardRoomNo.value || null,
        notes: notes.value || null,
        stentRemoved: stentRemoved.value,
      });
      resetFields();
      emit('close-dialog');
    };

    const handleClose = () => {
      resetFields();
      emit('close-dialog');
    };

    const registerDialog = ref(false);
    const openRegisterDialog = () => { registerDialog.value = true; };
    const closeRegisterDialog = () => { registerDialog.value = false; };
    const refreshPatients = () => { fetchPatients(); };

    return {
      selectedPatient,
      patients,
      patientSearch,
      loadingPatients,
      phoneNumber,
      age,
      gender,
      dateOfAdmission,
      category,
      operativeStatus,
      paymentMethod,
      paymentAmount,
      donationAmount,
      diagnosis,
      surgeon,
      wardRoomNo,
      notes,
      rules,
      handleSubmit,
      dialog,
      fetchPatients,
      onPatientSelected,
      stentRemoved,
      isEdit,
      registerDialog,
      openRegisterDialog,
      closeRegisterDialog,
      refreshPatients,
      handleClose,
    };
  },
};
</script>

<style scoped>
::v-deep(.readonly-dark .v-field__input) {
  color: #212121 !important;
  /* dark color */
  opacity: 1 !important;
  /* ensure full opacity */
}
</style>