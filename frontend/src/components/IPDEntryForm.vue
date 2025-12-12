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

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="phoneNumber"
                label="Phone Number"
                dense
                variant="outlined"
                readonly
                class="readonly-dark"
              />
            </v-col>
          </v-row>

          <!-- Details -->
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="dateOfAdmission"
                label="Date of Admission"
                type="date"
                :rules="[rules.required]"
                dense
                variant="outlined"
              />
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="category"
                :items="['Preop', 'Postop', 'Conservative']"
                label="Category"
                :rules="[rules.required]"
                dense
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-switch v-model="operativeStatus" label="Operative Status" />
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="paymentMethod"
                :items="['Cash', 'TPA', 'RGHS', 'CGHS']"
                label="Payment Method"
                :rules="[rules.required]"
                dense
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="paymentAmount"
                label="Payment Amount (₹)"
                type="number"
                :rules="[rules.required, rules.nonNegative]"
                dense
                variant="outlined"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="donationAmount"
                label="Donation Amount (₹)"
                type="number"
                :rules="[rules.nonNegative]"
                dense
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="diagnosis"
                label="Diagnosis"
                :rules="[rules.required]"
                dense
                variant="outlined"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="surgeon"
                label="Surgeon"
                dense
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="wardRoomNo"
                label="Ward / Room No."
                :rules="[rules.required]"
                dense
                variant="outlined"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="referredBy"
                label="Referred By"
                dense
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6">
              <v-textarea
                v-model="notes"
                label="Notes"
                dense
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row v-if="isEdit">
            <v-col cols="12">
              <v-switch v-model="stentRemoved" label="Mark Stent as Removed" />
            </v-col>
          </v-row>

        </v-form>

        <!-- Register New Patient Dialog -->
        <PatientAddEditModel 
          :dialog="registerDialog" 
          @close-dialog="closeRegisterDialog"
          @fetch-patients="refreshPatients" 
        />

      </v-card-text>

      <v-card-actions class="popup-action">
        <v-btn class="saaro-btn" @click="handleClose">Cancel</v-btn>

        <!-- SAVE BUTTON DISABLED UNTIL VALID -->
        <v-btn
          class="saaro-btn"
          color="primary"
          :disabled="!formValid"
          @click="handleSubmit"
        >
          Save
        </v-btn>
      </v-card-actions>

    </v-card>

    <!-- SNACKBAR FOR ERRORS -->
    <v-snackbar v-model="snackbar" color="red-darken-2" timeout="2500">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-dialog>
</template>

<script>
import { ref, watch, onBeforeUnmount } from 'vue';
import { usePatientStore } from '@/store/PatientStore';
import PatientAddEditModel from './PatientAddEditModel.vue';

export default {
  name: 'IPDEntryForm',
  components: { PatientAddEditModel },
  props: { dialog: Boolean, isEditModel: Boolean, entry: Object },

  setup(props, { emit }) {
    
    /* FIELDS */
    const selectedPatient = ref(null);
    const patients = ref([]);
    const phoneNumber = ref('');
    const dateOfAdmission = ref('');
    const category = ref('');
    const operativeStatus = ref(false);
    const paymentMethod = ref('');
    const paymentAmount = ref('');
    const donationAmount = ref('');
    const diagnosis = ref('');
    const surgeon = ref('Dr. Nitin Negi');
    const wardRoomNo = ref('');
    const referredBy = ref('');
    const notes = ref('');
    const stentRemoved = ref(false);

    const patientSearch = ref('');
    const loadingPatients = ref(false);

    /* FORM VALIDATION */
    const form = ref(null);
    const formValid = ref(false);

    /* SNACKBAR */
    const snackbar = ref(false);
    const snackbarMessage = ref("");

    /* RULES */
    const rules = {
      required: v => (!!v || v === 0) || "Required",
      nonNegative: v => (v === '' || Number(v) >= 0) || "Must be 0 or positive"
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
        dateOfAdmission.value = newEntry.dateOfAdmission ? new Date(newEntry.dateOfAdmission).toISOString().split('T')[0] : '';
        category.value = newEntry.category || '';
        operativeStatus.value = newEntry.operativeStatus || false;
        paymentMethod.value = newEntry.paymentMethod || '';
        paymentAmount.value = newEntry.paymentAmount || '';
        donationAmount.value = newEntry.donationAmount || '';
        diagnosis.value = newEntry.diagnosis || '';
        surgeon.value = newEntry.surgeon || 'Dr. Nitin Negi';
        wardRoomNo.value = newEntry.wardRoomNo || '';
        referredBy.value = newEntry.referredBy || '';
        notes.value = newEntry.notes || '';
        stentRemoved.value = newEntry.stentRemoved || false;
        
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

    /* SUBMIT */
    const handleSubmit = async () => {
      const valid = await form.value.validate();

      if (!valid.valid) {
        snackbarMessage.value = "Please fill all required fields";
        snackbar.value = true;
        return;
      }

      if (!selectedPatient.value?.value?._id) {
        snackbarMessage.value = "Please select a valid patient";
        snackbar.value = true;
        return;
      }

      emit("entry-saved", {
        patientId: selectedPatient.value.value._id,
        dateOfAdmission: dateOfAdmission.value,
        category: category.value,
        operativeStatus: operativeStatus.value,
        paymentMethod: paymentMethod.value,
        paymentAmount: Number(paymentAmount.value),
        donationAmount: donationAmount.value ? Number(donationAmount.value) : 0,
        diagnosis: diagnosis.value,
        surgeon: surgeon.value,
        wardRoomNo: wardRoomNo.value,
        referredBy: referredBy.value,
        notes: notes.value,
        stentRemoved: stentRemoved.value,
      });

      resetFields();
      emit("close-dialog");
    };

    /* RESET */
    const resetFields = () => {
      selectedPatient.value = null;
      phoneNumber.value = '';
      dateOfAdmission.value = '';
      category.value = '';
      operativeStatus.value = false;
      paymentMethod.value = '';
      paymentAmount.value = '';
      donationAmount.value = '';
      diagnosis.value = '';
      wardRoomNo.value = '';
      referredBy.value = '';
      notes.value = '';
      stentRemoved.value = false;
    };

    const handleClose = () => {
      resetFields();
      emit("close-dialog");
    };

    /* REGISTER DIALOG */
    const registerDialog = ref(false);
    const openRegisterDialog = () => registerDialog.value = true;
    const closeRegisterDialog = () => registerDialog.value = false;
    const refreshPatients = () => fetchPatients();

    return {
      dialog: ref(props.dialog),
      isEdit: ref(props.isEditModel),

      /* fields */
      selectedPatient, patients, phoneNumber, dateOfAdmission, category,
      operativeStatus, paymentMethod, paymentAmount, donationAmount, diagnosis,
      surgeon, wardRoomNo, referredBy, notes, stentRemoved,

      /* form */
      form, formValid, rules,

      /* search */
      patientSearch, loadingPatients,

      /* snackbar */
      snackbar, snackbarMessage,

      /* functions */
      onPatientSelected,
      handleSubmit,
      handleClose,
      openRegisterDialog,
      closeRegisterDialog,
      refreshPatients,
    };
  }
};
</script>

<style scoped>
::v-deep(.readonly-dark .v-field__input) {
  color: #212121 !important;
}
</style>
