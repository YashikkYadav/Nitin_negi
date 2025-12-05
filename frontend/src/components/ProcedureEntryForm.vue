<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card class="add-patient-popup popup-card">
      
      <!-- TITLE BAR -->
      <v-card-title class="d-flex justify-space-between align-center popup-title">
        <span>Add Procedure Record</span>
        <v-btn size="24" icon @click="$emit('close-dialog')">
          <v-icon size="24">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="popup-detail">

        <!-- FORM START -->
        <v-form ref="form" v-model="isFormValid" @submit.prevent="handleSubmit">

          <v-row>
            <v-col cols="12" class="d-flex align-center gap-2">

              <!-- SEARCH PATIENT -->
              <v-autocomplete
                v-model="selectedPatient"
                :items="patients"
                item-title="display"
                item-value="fullName"
                label="Search Patient with name or phone number"
                :rules="[rules.required]"
                variant="outlined"
                dense
                clearable
                return-object
                v-model:search="patientSearch"
                @update:model-value="onPatientSelected"
                :loading="loadingPatients"
                :no-data-text="patientSearch ? 'No patients found' : 'Start typing to search patients'"
              />

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
              <v-text-field
                v-model="implantDetails"
                label="Details"
                variant="outlined"
                dense
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>

          <v-row v-if="implantOrRemoval === 'Implant'">
            <v-col cols="12">
              <v-text-field
                v-model="dateOfImplantSutures"
                type="date"
                label="Date of implant/Sutures"
                variant="outlined"
                dense
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>

          <v-row v-if="implantOrRemoval === 'Removal'">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="dateOfImplantSutures"
                type="date"
                label="Date of implant/Sutures"
                variant="outlined"
                dense
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="dateOfRemoval"
                type="date"
                label="Date of Removal"
                :min="minRemovalDate"
                :rules="[rules.required, rules.removalAfterImplant]"
                variant="outlined"
                dense
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="procedureType"
                :items="procedureTypeOptions"
                label="Procedure Type"
                variant="outlined"
                dense
                clearable
                small-chips
                placeholder="Select or type procedure type"
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>

          <v-row v-if="procedureType === 'DJ Stent Removal'">
            <v-col cols="12">
              <v-switch v-model="stentRemoved" label="Mark Stent as Removed" />
            </v-col>
          </v-row>

        </v-form>

        <!-- REGISTER POPUP -->
        <PatientAddEditModel
          :dialog="registerDialog"
          @close-dialog="closeRegisterDialog"
          @fetch-patients="refreshPatients"
        />
      </v-card-text>

      <!-- ACTION BUTTONS -->
      <v-card-actions class="popup-action">
        <v-btn class="saaro-btn" @click="$emit('close-dialog')">Cancel</v-btn>

        <v-btn
          class="saaro-btn"
          color="primary"
          @click="handleSubmit"
          :disabled="!isFormValid"    
        >
          Save
        </v-btn>
      </v-card-actions>

      <!-- SNACKBAR -->
      <v-snackbar v-model="snackbar" color="red" timeout="2000">
        {{ snackbarMessage }}
      </v-snackbar>

    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch, computed, onBeforeUnmount } from "vue";
import { usePatientStore } from "@/store/PatientStore";
import PatientAddEditModel from "./PatientAddEditModel.vue";

export default {
  name: "ProcedureEntryForm",
  components: { PatientAddEditModel },
  props: { dialog: Boolean },

  setup(props, { emit }) {
    const form = ref(null);
    const isFormValid = ref(false);

    const snackbar = ref(false);
    const snackbarMessage = ref("");

    const showError = (msg) => {
      snackbarMessage.value = msg;
      snackbar.value = true;
    };

    const selectedPatient = ref(null);
    const patients = ref([]);
    const patientSearch = ref("");
    const loadingPatients = ref(false);

    const phoneNumber = ref("");
    const age = ref("");
    const gender = ref("");

    const implantOrRemoval = ref("");
    const implantDetails = ref("");
    const dateOfRemoval = ref("");
    const dateOfImplantSutures = ref("");
    const procedureType = ref("");
    const procedureTypeOptions = ["DJ Stent Removal", "Dressing Removal", "Sutures Removal"];
    const stentRemoved = ref(false);

    const registerDialog = ref(false);

    const minRemovalDate = computed(() =>
      dateOfImplantSutures.value ? dateOfImplantSutures.value : null
    );

    const rules = {
      required: (v) => !!v || "Required",
      removalAfterImplant: (v) =>
        implantOrRemoval.value === "Removal" &&
        dateOfImplantSutures.value &&
        v < dateOfImplantSutures.value
          ? "Removal date cannot be before implant date"
          : true,
    };

    const fetchPatients = async () => {
      loadingPatients.value = true;

      if (!patientSearch.value.trim()) {
        loadingPatients.value = false;
        return;
      }

      try {
        const store = usePatientStore();
        const res = await store.getAllPatientsMasterApiCall(1, 1000000, patientSearch.value);
        patients.value = res?.patient?.length
          ? res.patient.map((p) => ({
              display: `${p.fullName} (${p.phone || p.phoneNumber || ""})`,
              fullName: p.fullName,
              ...p,
            }))
          : [];
      } catch {
        patients.value = [];
      }

      loadingPatients.value = false;
    };

    let timer;
    watch(patientSearch, (val) => {
      clearTimeout(timer);
      if (val.trim()) timer = setTimeout(fetchPatients, 300);
    });

    onBeforeUnmount(() => clearTimeout(timer));

    const onPatientSelected = (patient) => {
      if (!patient) {
        phoneNumber.value = "";
        age.value = "";
        gender.value = "";
        return;
      }

      phoneNumber.value = patient.phone || patient.phoneNumber || "";
      age.value = patient.age || "";
      gender.value = patient.gender || "";
    };

    // ---------------- SUBMIT ----------------
    const handleSubmit = async () => {
      const valid = await form.value.validate();

      if (!valid) {
        showError("Please fill all required fields");
        return;
      }

      const data = {
        patientUid: selectedPatient.value?.uid || selectedPatient.value?._id,
        patientName: selectedPatient.value?.fullName,
        phoneNumber: phoneNumber.value,
        age: age.value ? Number(age.value) : null,
        gender: gender.value,
        implantOrRemoval: implantOrRemoval.value,
        implantDetails: implantDetails.value,
        dateOfRemoval: implantOrRemoval.value === "Removal" ? dateOfRemoval.value : "",
        dateOfImplantSutures: dateOfImplantSutures.value,
        procedureType: procedureType.value,
        stentRemoved: stentRemoved.value,
      };

      emit("entry-saved", data);
      emit("close-dialog");
    };

    return {
      dialog: ref(props.dialog),
      form,
      isFormValid,
      snackbar,
      snackbarMessage,

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
      handleSubmit,
      onPatientSelected,

      registerDialog,
      openRegisterDialog: () => (registerDialog.value = true),
      closeRegisterDialog: () => (registerDialog.value = false),
      refreshPatients: () => fetchPatients(),
    };
  },
};
</script>
