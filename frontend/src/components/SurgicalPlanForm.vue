<template>
  <v-dialog v-model="dialog" max-width="700px">
    <v-card class="add-patient-popup popup-card">
      <v-card-title class="d-flex  align-center popup-title">
        
        <v-btn class="ml-auto" size="24" icon @click="handleClose">
          <v-icon size="24">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="popup-detail">
        <v-form @submit.prevent="handleSubmit" ref="form">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="surgeryPerformed"
                label="Surgery Performed"
                :rules="[rules.required]"
                variant="outlined"
                dense
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="instrumentsUsed"
                :items="[]"
                label="Instruments Used"
                multiple
                chips
                clearable
                variant="outlined"
                dense
                placeholder="Add or select instruments"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="settingsOfInstruments"
                label="Settings of Instruments"
                variant="outlined"
                dense
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="implantsUsed"
                :items="[]"
                label="Implants Used"
                multiple
                chips
                clearable
                variant="outlined"
                dense
                placeholder="Add or select implants"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="findings"
                label="Findings"
                variant="outlined"
                dense
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="specificFinding"
                label="Any Specific Finding"
                variant="outlined"
                dense
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="intraoperativeIssue"
                label="Any Intraoperative Issue"
                variant="outlined"
                dense
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="postopCare"
                label="Specific Postoperative Care to Follow"
                variant="outlined"
                dense
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="postopComplication"
                label="Postoperative Complication / Course"
                variant="outlined"
                dense
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
          
          <!-- Results dynamic fields -->
          <v-row>
            <label class="ml-4 font-bold text-md py-2">Post Operative</label>
            <v-col cols="12">
              <div v-for="(item, idx) in resultsList" :key="'result-'+idx" class="mb-2">
                <v-combobox
                  variant="outlined"
                  v-model="item.name"
                  :items="[]"
                  hide-details
                  @update:modelValue="dynamicHandleInput(item, 'resultsList', ['name'])"
                  :label="idx === 0 ? 'Result' : ''"
                  :placeholder="idx !== 0 ? 'Enter result' : ''"
                  dense
                />
              </div>
            </v-col>
          </v-row>

          <!-- Patient Complaints dynamic fields -->
          <v-row>
            <v-col cols="12">
              <div v-for="(item, idx) in patientComplaintsList" :key="'complaint-'+idx" class="mb-2">
                <v-combobox
                  variant="outlined"
                  v-model="item.name"
                  :items="[]"
                  hide-details
                  @update:modelValue="dynamicHandleInput(item, 'patientComplaintsList', ['name'])"
                  :label="idx === 0 ? 'Patient Complaint' : ''"
                  :placeholder="idx !== 0 ? 'Enter complaint' : ''"
                  dense
                />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="popup-action">
        <v-btn class="saaro-btn" @click="handleClose">Cancel</v-btn>
        <v-btn class="saaro-btn" color="primary" @click="handleSubmit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getSurgicalPlanByIpdId } from '@/apis/SurgicalPlan';

const props = defineProps({
  dialog: Boolean,
  ipdRecordId: [String, Number]
});
const emit = defineEmits(['close-dialog', 'plan-saved']);

const dialog = ref(props.dialog);

watch(() => props.dialog, val => { dialog.value = val; });

const surgeryPerformed = ref('');
const instrumentsUsed = ref([]);
const settingsOfInstruments = ref('');
const implantsUsed = ref([]);
const findings = ref('');
const specificFinding = ref('');
const intraoperativeIssue = ref('');
const postopCare = ref('');
const postopComplication = ref('');

// Add dynamic lists for results and patient complaints
const resultsList = ref([{ name: '' }]);
const patientComplaintsList = ref([{ name: '' }]);

// Load data from local storage or fetch from backend when component is mounted
onMounted(() => {
  loadSurgicalPlanData();
});

// Also load data when dialog becomes visible
watch(() => props.dialog, (newVal) => {
  if (newVal) {
    loadSurgicalPlanData();
  }
});

// This function is intentionally left empty as we're not using local storage
const saveToLocalStorage = () => {
  // No local storage functionality as per requirements
};

// Load data from backend only
const loadSurgicalPlanData = async () => {
  // Only fetch from backend, no local storage logic
  if (props.ipdRecordId) {
    try {
      const response = await getSurgicalPlanByIpdId(props.ipdRecordId);
      if (response.success) {
        const data = response.data;
        surgeryPerformed.value = data.surgeryPerformed || '';
        instrumentsUsed.value = data.instrumentsUsed || [];
        settingsOfInstruments.value = data.instrumentSettings || '';
        implantsUsed.value = data.implantsUsed || [];
        findings.value = data.findings || '';
        specificFinding.value = data.specificFinding || '';
        intraoperativeIssue.value = data.intraoperativeIssues || '';
        postopCare.value = data.postoperativeCare || '';
        postopComplication.value = data.postoperativeCourse || '';
        resultsList.value = data.results && Array.isArray(data.results) && data.results.length > 0 ? data.results.map(name => ({ name })) : [{ name: '' }];
        patientComplaintsList.value = data.patientComplaints && Array.isArray(data.patientComplaints) && data.patientComplaints.length > 0 ? data.patientComplaints.map(name => ({ name })) : [{ name: '' }];
      }
    } catch (error) {
      // If not found or other error, keep the fields empty (default)
      console.log('No surgical plan found for this IPD record, starting with empty form');
      // Reset to empty state
      resetFields();
    }
  } else {
    // No IPD record ID, reset to empty state
    resetFields();
  }
};

const rules = {
  required: v => !!v || 'Required',
};

const resetFields = () => {
  surgeryPerformed.value = '';
  instrumentsUsed.value = [];
  settingsOfInstruments.value = '';
  implantsUsed.value = [];
  findings.value = '';
  specificFinding.value = '';
  intraoperativeIssue.value = '';
  postopCare.value = '';
  postopComplication.value = '';
  resultsList.value = [{ name: '' }];
  patientComplaintsList.value = [{ name: '' }];
  // Save the reset state to local storage
  saveToLocalStorage();
};

const handleClose = () => {
  resetFields();
  emit('close-dialog');
};

const handleSubmit = () => {
  // No local storage save needed
  
  emit('plan-saved', {
    ipdRecordId: props.ipdRecordId,
    surgeryPerformed: surgeryPerformed.value,
    instrumentsUsed: instrumentsUsed.value,
    settingsOfInstruments: settingsOfInstruments.value,
    implantsUsed: implantsUsed.value,
    findings: findings.value,
    specificFinding: specificFinding.value,
    intraoperativeIssue: intraoperativeIssue.value,
    postopCare: postopCare.value,
    postopComplication: postopComplication.value,
    results: resultsList.value.filter(i => i.name && i.name.trim()).map(i => i.name),
    patientComplaints: patientComplaintsList.value.filter(i => i.name && i.name.trim()).map(i => i.name),
  });
  resetFields();
  emit('close-dialog');
};

// --- Dynamic row logic for results and patient complaints ---
function dynamicHandleInput(item, listKey, keyFields = ["name"]) {
  if (isRowFilledDynamic(item, keyFields) && !hasEmptyRowDynamic(eval(listKey).value, keyFields)) {
    eval(listKey).value.push(createEmptyRowDynamic(keyFields));
  }
  removeEmptyRowsDynamic(listKey, keyFields);
}

function isRowFilledDynamic(item, keyFields) {
  return keyFields.some(field => String(item[field] || '').trim().length > 0);
}

function hasEmptyRowDynamic(list, keyFields) {
  return list.some(row => keyFields.every(field => String(row[field] || '').trim().length === 0));
}

function removeEmptyRowsDynamic(listKey, keyFields) {
  const list = eval(listKey).value;
  eval(listKey).value = list.filter((row, index) =>
    isRowFilledDynamic(row, keyFields) || index === list.length - 1
  );
}

function createEmptyRowDynamic(keyFields) {
  return keyFields.reduce((obj, field) => ({ ...obj, [field]: "" }), {});
}
</script>
