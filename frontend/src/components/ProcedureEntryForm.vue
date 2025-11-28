<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card class="add-patient-popup popup-card">
      <v-card-title class="d-flex justify-space-between align-center popup-title">
        <span>Add Procedure Record</span>
        <v-btn size="24" icon @click="$emit('close-dialog')">
          <v-icon size="24">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="popup-detail">
        <v-form @submit.prevent="handleSubmit" ref="form">
          <v-row>
            <v-col cols="12" class="d-flex align-center gap-2">
              <v-autocomplete
                v-model="selectedPatient"
                :items="patients"
                label="Select Patient"
                :rules="[rules.required]"
                variant="outlined"
                dense
                clearable
                @update:model-value="onPatientSelected"
              />

              <!-- Register Button -->
              <v-btn class="saaro-btn ml-2" @click="openRegisterDialog">
                <v-icon class="mr-2" left>mdi-account-plus</v-icon>
                Register
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-text-field v-model="phoneNumber" label="Phone Number" variant="outlined" dense readonly />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="age" label="Age" variant="outlined" dense readonly />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="gender" label="Gender" variant="outlined" dense readonly />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="implantOrRemoval"
                :items="['Implant', 'Removal']"
                label="Implant/Removal"
                :rules="[rules.required]"
                variant="outlined"
                dense
                clearable
              />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="implantDetails" label="Details" variant="outlined" dense />
            </v-col>
          </v-row>
          <v-row v-if="implantOrRemoval === 'Implant'">
            <v-col cols="12">
              <v-text-field v-model="dateOfImplantSutures" label="Date of implant/Sutures" type="date" variant="outlined" dense />
            </v-col>
          </v-row>
          <v-row v-if="implantOrRemoval === 'Removal'">
            <v-col cols="12" md="6">
              <v-text-field v-model="dateOfImplantSutures" label="Date of implant/Sutures" type="date" variant="outlined" dense />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="dateOfRemoval" label="Date of Removal" type="date" variant="outlined" dense :min="minRemovalDate" :rules="[rules.required, rules.removalAfterImplant]" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="procedureType"
                :items="procedureTypeOptions"
                label="Procedure Type"
                :rules="[rules.required]"
                variant="outlined"
                dense
                clearable
                allow-overflow
                hide-selected
                small-chips
                solo
                placeholder="Select or type procedure type"
              />
            </v-col>
          </v-row>
          <v-row v-if="procedureType === 'DJ Stent Removal'">
            <v-col cols="12">
              <v-switch v-model="stentRemoved" label="Mark Stent as Removed" />
            </v-col>
          </v-row>
        </v-form>

        <!-- Patient Add/Edit Dialog -->
        <PatientAddEditModel
          :dialog="registerDialog"
          @close-dialog="closeRegisterDialog"
          @fetch-patients="refreshPatients"
        />
      </v-card-text>
      <v-card-actions class="popup-action">
        <v-btn class="saaro-btn" @click="$emit('close-dialog')">Cancel</v-btn>
        <v-btn class="saaro-btn" color="primary" @click="handleSubmit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue';
import { usePatientStore } from '@/store/PatientStore';
import PatientAddEditModel from './PatientAddEditModel.vue';

export default {
  name: 'ProcedureEntryForm',
  components: {
    PatientAddEditModel
  },
  props: {
    dialog: Boolean
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
    const implantOrRemoval = ref('');
    const implantDetails = ref('');
    const dateOfRemoval = ref('');
    const dateOfImplantSutures = ref('');
    const procedureType = ref('');
    const procedureTypeOptions = [
      'DJ Stent Removal',
      'Dressing Removal',
      'Sutures Removal'
    ];
    const stentRemoved = ref(false);
    const dialog = ref(props.dialog);

    // Register dialog state and handlers
    const registerDialog = ref(false);
    const openRegisterDialog = () => { registerDialog.value = true; };
    const closeRegisterDialog = () => { registerDialog.value = false; };
    const refreshPatients = () => { fetchPatients(); };

    watch(() => props.dialog, (val) => {
      dialog.value = val;
    });

    const minRemovalDate = computed(() => {
      // Only allow removal date after or on the implant date
      return dateOfImplantSutures.value ? dateOfImplantSutures.value : null;
    });

    const rules = {
      required: v => !!v || 'Required',
      removalAfterImplant: v => {
        if (implantOrRemoval.value === 'Removal' && dateOfImplantSutures.value && v) {
          return v >= dateOfImplantSutures.value || 'Removal date cannot be before implant date';
        }
        return true;
      }
    };

    const fetchPatients = async () => {
      loadingPatients.value = true;
      const store = usePatientStore();
      const res = await store.getAllPatientsMasterApiCall(1, 10, patientSearch.value);
      if (res && res.patients) {
        patients.value = res.patients.map(p => p.fullName || 'N/A');
        patientDetailsLookup.value = Object.fromEntries(res.patients.map(p => [p.fullName, p]));
      } else {
        patients.value = [];
        patientDetailsLookup.value = {};
      }
      loadingPatients.value = false;
    };
    watch(patientSearch, fetchPatients, { immediate: true });
    onMounted(() => {
      fetchPatients();
    });

    const onPatientSelected = (patientName) => {
      const details = patientDetailsLookup.value[patientName];
      if (details) {
        phoneNumber.value = details.phoneNumber || '';
        age.value = details.age || '';
        gender.value = details.gender || '';
      } else {
        phoneNumber.value = '';
        age.value = '';
        gender.value = '';
      }
    };

    const handleSubmit = () => {
      if (
        implantOrRemoval.value === 'Removal' &&
        dateOfImplantSutures.value &&
        dateOfRemoval.value &&
        dateOfRemoval.value < dateOfImplantSutures.value
      ) {
        alert('Removal date cannot be before implant date');
        return;
      }
      emit('entry-saved', {
        patientUid: patientDetailsLookup.value[selectedPatient.value]?.uid, // add UID
        patientName: selectedPatient.value,
        phoneNumber: phoneNumber.value,
        age: age.value !== '' ? Number(age.value) : null,
        gender: gender.value || null,
        implantOrRemoval: implantOrRemoval.value,
        implantDetails: implantDetails.value,
        dateOfRemoval: implantOrRemoval.value === 'Removal' ? dateOfRemoval.value : '',
        dateOfImplantSutures: implantOrRemoval.value === 'Implant' ? dateOfImplantSutures.value : '',
        procedureType: procedureType.value,
        stentRemoved: stentRemoved.value,
      });
      // Reset fields
      selectedPatient.value = null;
      phoneNumber.value = '';
      age.value = '';
      gender.value = '';
      implantOrRemoval.value = '';
      implantDetails.value = '';
      dateOfRemoval.value = '';
      dateOfImplantSutures.value = '';
      procedureType.value = '';
      stentRemoved.value = false;
      emit('close-dialog');
    };

    return {
      selectedPatient,
      patients,
      patientSearch,
      loadingPatients,
      phoneNumber,
      age,
      gender,
      implantOrRemoval,
      implantDetails,
      dateOfRemoval,
      dateOfImplantSutures,
      procedureType,
      procedureTypeOptions,
      stentRemoved,
      rules,
      dialog,
      fetchPatients,
      onPatientSelected,
      handleSubmit,
      // Register dialog handlers
      registerDialog,
      openRegisterDialog,
      closeRegisterDialog,
      refreshPatients
    };
  },
};
</script>