<template>
  <v-dialog :model-value="dialog" max-width="800px" @update:model-value="handleDialogUpdate">
    <v-card class="add-patient-popup popup-card">
      
      <v-card-title class="d-flex justify-space-between align-center popup-title">
        <span>{{ isEdit ? 'Edit Tentative Surgery' : 'Add Tentative Surgery' }}</span>
        <v-btn size="24" icon @click="handleClose">
          <v-icon size="24">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="popup-detail">
        <v-form ref="form" v-model="formValid" @submit.prevent="handleSubmit">

          <!-- PATIENT -->
          <v-row>
            <v-col cols="12" class="d-flex align-center gap-2">

              <v-autocomplete
                v-model="selectedPatient"
                :items="patients"
                item-title="title"
                item-value="value"
                return-object
                label="Search Patient with name or phone number"
                :rules="[rules.required]"
                variant="outlined"
                dense
                clearable
                v-model:search="patientSearch"
                :loading="loadingPatients"
                @update:model-value="onPatientSelected"
                class="flex-grow-1"
              />

              <v-btn class="saaro-btn ml-2" @click="openRegisterDialog">
                <v-icon left>mdi-account-plus</v-icon>
                Register
              </v-btn>
            </v-col>
          </v-row>

          <!-- PHONE NUMBER (READONLY) -->
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="phoneNumber"
                label="Phone Number"
                readonly
                variant="outlined"
                dense
              />
            </v-col>
          </v-row>

          <!-- DATE OF SURGERY -->
      

          <!-- STATUS -->
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="status"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                dense
              />
            </v-col>
          </v-row>

          <!-- NOTES -->
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="notes"
                label="Notes"
                variant="outlined"
                dense
                rows="3"
              />
            </v-col>
          </v-row>

          <!-- ACTION BUTTONS -->
          <v-row>
            <v-col cols="12" class="d-flex justify-end gap-2">
              <v-btn class="saaro-btn" @click="handleClose">Cancel</v-btn>
              <v-btn class="saaro-btn" color="primary" @click="handleSubmit" :loading="saving">Save</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Patient Registration Dialog -->
      <PatientAddEditModel 
        :dialog="showRegisterDialog" 
        @close-dialog="showRegisterDialog = false" 
        @patient-saved="onPatientRegistered"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch, onBeforeUnmount } from 'vue';
import { usePatientStore } from '@/store/PatientStore';
import { useUiStore } from '@/store/UiStore';
import PatientAddEditModel from './PatientAddEditModel.vue';
import { createTentativeSurgery, updateTentativeSurgery } from '@/apis/TentativeSurgery';

export default {
  name: 'TentativeSurgeryEntryForm',
  components: { PatientAddEditModel },
  props: { dialog: Boolean, isEditModel: Boolean, entry: Object },

  setup(props, { emit }) {
    
    /* FIELDS */
    const selectedPatient = ref(null);
    const patients = ref([]);
    const phoneNumber = ref('');
    const status = ref('pending');
    const notes = ref('');
    const statusOptions = ref([
      { title: 'Pending', value: 'pending' },
      { title: 'Completed', value: 'completed' },
      { title: 'Not Seen', value: 'not seen' }
    ]);

    const patientSearch = ref('');
    const loadingPatients = ref(false);
    const saving = ref(false);

    /* FORM VALIDATION */
    const form = ref(null);
    const formValid = ref(false);

    /* SNACKBAR */
    
    // Added UiStore
    const uiStore = useUiStore();

    /* REGISTER DIALOG */
    const showRegisterDialog = ref(false);

    /* RULES */
    const rules = {
      required: v => (!!v || v === 0) || "Required",
    };

    /* Handle dialog update */
    const handleDialogUpdate = (value) => {
      if (!value) {
        handleClose();
      }
    };

    /* FETCH PATIENTS */
    let fetchPatientsTimeout;

    const fetchPatients = async () => {
      loadingPatients.value = true;

      if (!patientSearch.value.trim()) {
        loadingPatients.value = false;
        return;
      }

      try {
        const store = usePatientStore();
        const res = await store.getAllPatientsMasterApiCall(1, 1000000, patientSearch.value);

        if (res?.patient) {
          patients.value = res.patient.map(p => ({
            title: `${p.fullName} (${p.phoneNumber || ''})`,
            value: p
          }));
        }
      } catch (err) {
        console.error(err);
      }

      loadingPatients.value = false;
    };

    watch(patientSearch, (val) => {
      clearTimeout(fetchPatientsTimeout);
      fetchPatientsTimeout = setTimeout(fetchPatients, 300);
    });

    // Watch for changes in the entry prop to pre-fill the form when editing
    watch(() => props.entry, (newEntry) => {
      if (newEntry && props.isEditModel) {
        // Pre-fill the form with existing data
        status.value = newEntry.status || 'pending';
        notes.value = newEntry.notes || '';
        
        // Set patient information if available
        if (newEntry.patientId) {
          selectedPatient.value = {
            title: `${newEntry.patientId.fullName} (${newEntry.patientId.phoneNumber || ''})`,
            value: newEntry.patientId
          };
          phoneNumber.value = newEntry.patientId.phoneNumber || '';
        }
      }
    }, { immediate: true });

    onBeforeUnmount(() => clearTimeout(fetchPatientsTimeout));

    /* ON PATIENT SELECTED */
    const onPatientSelected = (item) => {
      if (!item?.value) return;
      phoneNumber.value = item.value.phoneNumber || '';
    };

    /* OPEN REGISTER DIALOG */
    const openRegisterDialog = () => {
      showRegisterDialog.value = true;
    };

    /* ON PATIENT REGISTERED */
    const onPatientRegistered = (patient) => {
      // Add the newly registered patient to the list and select it
      if (patient && patient._id) {
        const patientOption = {
          title: `${patient.fullName} (${patient.phoneNumber || ''})`,
          value: patient
        };
        
        patients.value.unshift(patientOption);
        selectedPatient.value = patientOption;
        phoneNumber.value = patient.phoneNumber || '';
        
        // Close the register dialog
        showRegisterDialog.value = false;
      }
    };

    /* SUBMIT */
    const handleSubmit = async () => {
      const valid = await form.value.validate();

      if (!valid.valid) {
        uiStore.openNotificationMessage("Please fill all required fields", "", "error");
        return;
      }

      if (!selectedPatient.value?.value?._id) {
        uiStore.openNotificationMessage("Please select a valid patient", "", "error");
        return;
      }

      saving.value = true;

      try {
        const payload = {
          patientId: selectedPatient.value.value._id,
          status: status.value,
          notes: notes.value
        };

        let result;
        if (props.isEditModel && props.entry && props.entry._id) {
          // Update existing tentative surgery
          result = await updateTentativeSurgery(props.entry._id, payload);
          uiStore.openNotificationMessage("Tentative surgery updated successfully!", "", "success");
        } else {
          // Create new tentative surgery
          result = await createTentativeSurgery(payload);
          uiStore.openNotificationMessage("Tentative surgery created successfully!", "", "success");
        }
        
        // Emit event to parent component
        emit("entry-saved", result.data || payload);
        
        // Reset form and close dialog
        resetFields();
        emit("close-dialog");
      } catch (error) {
        console.log("Error saving tentative surgery:", error);
        uiStore.openNotificationMessage(error?.response?.data?.message || "Failed to save tentative surgery", "", "error");
      } finally {
        saving.value = false;
      }
    };

    /* RESET */
    const resetFields = () => {
      selectedPatient.value = null;
      phoneNumber.value = '';
      status.value = 'pending';
      notes.value = '';
      form.value?.resetValidation();
    };

    /* CLOSE */
    const handleClose = () => {
      resetFields();
      emit("close-dialog");
    };

    return {
      // Reactive data
      selectedPatient,
      patients,
      phoneNumber,
      status,
      notes,
      statusOptions,
      patientSearch,
      loadingPatients,
      saving,
      form,
      formValid,
      showRegisterDialog,
      rules,

      // Methods
      onPatientSelected,
      openRegisterDialog,
      onPatientRegistered,
      handleSubmit,
      handleClose,
      handleDialogUpdate
    };
  }
};
</script>

<style scoped>
.saaro-btn {
  text-transform: none;
}
</style>