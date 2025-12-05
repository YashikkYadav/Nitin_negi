<template>
  <v-container fluid class="prescription-page mb-15 relative">
    <v-card class="patient-card mb-4">
      <v-card-title>
        <div>
          <h3 class="font-weight-bold">{{ patientData.fullName }}</h3>
          <p>UID: {{ patientData.uid }}</p>
        </div>
      </v-card-title>
      <v-card-text>
        <p v-if="patientData.phoneNumber">Contact: {{ patientData.phoneNumber }}</p>
        <p v-if="patientData.email">Email: {{ patientData.email }}</p>
        <p v-if="patientData.gender">Gender: {{ patientData.gender }}</p>
        <p v-if="patientData.age">Age: {{ patientData.age }}</p>
        <p v-if="patientData.bloodGroup">Blood Group: {{ patientData.bloodGroup }}</p>
        <p v-if="patientData.allergies">Allergies: {{ patientData.allergies }}</p>
        <p v-if="patientData.dateOfBirth">Date of Birth: {{ formatedDate(patientData.dateOfBirth) }}</p>
        <p v-if="patientData.tags">Category: {{ patientData.tags }}</p>
        <p v-if="patientData.address">Address: {{ patientData.address }}</p>
      </v-card-text>
    </v-card>
    <div class="d-flex mb-4">
      <v-btn class="saaro-btn" style="width: 100%; margin-left: auto;" text @click="showSettingsForSection = true">Add
        Section</v-btn>
    </div>
    
    <!-- VoiceRx Button -->
    <div class="d-flex mb-4">
      <v-btn class="saaro-btn" color="primary" @click="voiceRxDialog = true">
        <v-icon left>mdi-microphone</v-icon>
        Start VoiceRx
      </v-btn>
    </div>
    
    <!-- VoiceRx Modal -->
    <v-dialog v-model="voiceRxDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline primary white--text">
          <v-icon left color="white">mdi-microphone</v-icon>
          VoiceRx - Create Prescription
        </v-card-title>
        <v-card-text>
          <div v-if="isRecording" class="d-flex flex-column align-center py-6">
            <v-progress-circular
              :size="50"
              color="primary"
              indeterminate
              class="mb-4"
            ></v-progress-circular>
            <h3 class="text-h6">Recording in progress...</h3>
            <v-btn color="error" @click="stopRecording" class="mt-4">
              <v-icon left>mdi-stop</v-icon>
              Stop Recording
            </v-btn>
          </div>
          
          <div v-else-if="isProcessing" class="d-flex flex-column align-center py-6">
            <v-progress-circular
              :size="50"
              color="primary"
              indeterminate
              class="mb-4"
            ></v-progress-circular>
            <h3 class="text-h6">Processing audio file...</h3>
            <p class="text-center mt-2">Please wait while we analyze your audio.</p>
          </div>
          
          <div v-else-if="!voiceRxResult" class="d-flex flex-column align-center py-6">
            <v-btn 
              class="mb-6" 
              color="primary" 
              large
              @click="startRecording"
            >
              <v-icon left>mdi-microphone</v-icon>
              Start Recording
            </v-btn>
            
            <div class="my-4">
              <span class="text-h6 font-weight-medium">OR</span>
            </div>
            
            <v-btn
              color="primary"
              @click="triggerAudioFileUpload"
              outlined
            >
              <v-icon left>mdi-file-music</v-icon>
              Upload Audio File (MP3, WAV)
            </v-btn>
            <input
              ref="audioFileInput"
              type="file"
              accept="audio/*"
              @change="handleAudioFileUpload"
              style="display: none;"
            />
          </div>
          
          <div v-else class="py-4">
            <v-alert type="success" class="mb-4">
              Audio processed successfully! Review the data below and click "Fill the form" to populate the prescription.
            </v-alert>
            
            <div v-if="voiceRxResult">
              <!-- Patient Information -->
              <section class="section" v-if="patientData">
                <h4>Patient Information</h4>
                <p><strong>Name:</strong> {{ patientData.fullName }}</p>
                <p><strong>UID:</strong> {{ patientData.uid }}</p>
                <p v-if="patientData.phoneNumber"><strong>Contact:</strong> {{ patientData.phoneNumber }}</p>
                <p v-if="patientData.email"><strong>Email:</strong> {{ patientData.email }}</p>
                <p v-if="patientData.gender"><strong>Gender:</strong> {{ patientData.gender }}</p>
                <p v-if="patientData.age"><strong>Age:</strong> {{ patientData.age }}</p>
              </section>
              
              <!-- Vitals Section -->
              <section class="section">
                <h4>Vitals</h4>
                <p><strong>Blood Pressure:</strong> {{ voiceRxResult.bloodPressure || 'N/A' }}</p>
                <p><strong>Pulse:</strong> {{ voiceRxResult.pulse || 'N/A' }}</p>
                <p><strong>Height:</strong> {{ voiceRxResult.height || 'N/A' }} cm</p>
                <p><strong>Weight:</strong> {{ voiceRxResult.weight || 'N/A' }} kg</p>
                <p><strong>Temperature:</strong> {{ voiceRxResult.temperature || 'N/A' }}°C</p>
                <p><strong>Pain Score:</strong> {{ voiceRxResult.painScore || 'N/A' }}</p>
              </section>
              
              <!-- Complaints Section -->
              <section class="section" v-if="voiceRxResult.complaints && voiceRxResult.complaints.length">
                <h4>Complaints</h4>
                <ul>
                  <li v-for="(complaint, i) in voiceRxResult.complaints" :key="i" :style="{ display: i === voiceRxResult.complaints.length ? 'none' : '' }">{{ complaint }}</li>
                </ul>
              </section>
              
              <!-- Medical History -->
              <section class="section" v-if="voiceRxResult.history && voiceRxResult.history.length">
                <h4>History</h4>
                <ul>
                  <li v-for="(history, i) in voiceRxResult.history" :key="i" :style="{ display: i === voiceRxResult.history.length? 'none' : '' }">{{ history }}</li>
                </ul>
              </section>
              
              <!-- Drug History -->
              <section class="section" v-if="voiceRxResult.drugHistory && voiceRxResult.drugHistory.length">
                <h4>Drug History</h4>
                <ul>
                  <li v-for="(drug, i) in voiceRxResult.drugHistory" :key="drug._id">
                    {{ drug.name }} - {{ drug.details || 'No details provided' }}
                  </li>
                </ul>
              </section>
              
              <!-- Drug Allergy -->
              <section class="section" v-if="voiceRxResult.drugAllergy && voiceRxResult.drugAllergy.length">
                <h4>Drug Allergy</h4>
                <ul>
                  <li v-for="(allergy, i) in voiceRxResult.drugAllergy" :key="allergy._id">
                    {{ allergy.name }} - {{ allergy.details || 'No details provided' }}
                  </li>
                </ul>
              </section>
              
              <!-- Antiplatelet/Anticogulant -->
              <section class="section" v-if="voiceRxResult.antiplatlet && voiceRxResult.antiplatlet.length">
                <h4>Antiplatelet/Anticogulant</h4>
                <ul>
                  <li v-for="(anti, i) in voiceRxResult.antiplatlet" :key="anti._id">
                    {{ anti.name }} - {{ anti.details || 'No details provided' }}
                  </li>
                </ul>
              </section>
              
              <!-- Previous Surgery -->
              <section class="section" v-if="voiceRxResult.previousSurgery">
                <h4>Previous Surgery</h4>
                <ul>
                  <li>{{ voiceRxResult.previousSurgery }}</li>
                </ul>
              </section>
              
              <!-- Physical Examination -->
              <section class="section" v-if="voiceRxResult.physicalExamination && voiceRxResult.physicalExamination.length">
                <h4>Physical Examination</h4>
                <ul>
                  <li v-for="(exam, i) in voiceRxResult.physicalExamination" :key="i" :style="{ display: i === voiceRxResult.physicalExamination.length ? 'none' : '' }">{{ exam }}</li>
                </ul>
              </section>
              
              <!-- Provisional Diagnosis -->
              <section class="section" v-if="voiceRxResult.provisional">
                <h4>Provisional Diagnosis</h4>
                <ul>
                  <li>{{ voiceRxResult.provisional }}</li>
                </ul>
              </section>
              
              <!-- Diagnosis -->
              <section class="section" v-if="voiceRxResult.diagnosis && voiceRxResult.diagnosis.length">
                <h4>Diagnosis</h4>
                <ul>
                  <li v-for="(diag, i) in voiceRxResult.diagnosis" :key="diag._id">
                    {{ diag.type }} - {{ diag.details || 'No details provided' }}
                  </li>
                </ul>
              </section>
              
              <!-- Investigation Advice -->
              <section class="section" v-if="voiceRxResult.investigationsAdviced && voiceRxResult.investigationsAdviced.length">
                <h4>Investigation Advice</h4>
                <ul>
                  <li v-for="(investigation, i) in voiceRxResult.investigationsAdviced" :key="investigation._id">
                    {{ investigation.name }} - {{ investigation.details || 'No details provided' }}
                  </li>
                </ul>
              </section>
              
              <!-- Medications Section -->
              <section class="section" v-if="voiceRxResult.medications && voiceRxResult.medications.length">
                <h4>Medications</h4>
                <ul>
                  <li v-for="(med, i) in voiceRxResult.medications" :key="med._id">
                    {{ med.name }} - {{ med.dosage }}, {{ med.frequency }} for {{ med.duration }} ({{ med.composition || 'No composition provided' }})
                  </li>
                </ul>
              </section>
              
              <!-- Advice -->
              <section class="section" v-if="voiceRxResult.advice && voiceRxResult.advice.length">
                <h4>Advice</h4>
                <ul>
                  <li v-for="(advice, i) in voiceRxResult.advice" :key="i" :style="{ display: i === voiceRxResult.advice.length ? 'none' : '' }">{{ advice }}</li>
                </ul>
              </section>
              
              <!-- Follow Up -->
              <section class="section" v-if="voiceRxResult.followUp">
                <h4>Follow-up</h4>
                <p><strong>Days:</strong> {{ voiceRxResult.followUp.days || 'N/A' }}</p>
                <p><strong>Date:</strong> {{ voiceRxResult.followUp.date || 'N/A' }}</p>
              </section>
              
              <!-- Any Implant -->
              <section class="section" v-if="voiceRxResult.implant && voiceRxResult.implant.length">
                <h4>Any Implant</h4>
                <ul>
                  <li v-for="(imp, i) in voiceRxResult.implant" :key="imp._id">
                    {{ imp.name }} - {{ imp.removalDate || 'No removalDate provided' }}
                  </li>
                </ul>
              </section>
              
              <!-- Referred To -->
              <section class="section" v-if="voiceRxResult.referredTo && voiceRxResult.referredTo.length">
                <h4>Referred To</h4>
                <ul>
                  <li v-for="(ref, i) in voiceRxResult.referredTo" :key="ref._id">
                    {{ ref.name }} - {{ ref.speciality || 'No speciality provided' }} - {{ ref.phoneNumber }}
                  </li>
                </ul>
              </section>
              
              <!-- Referred By -->
              <section class="section" v-if="voiceRxResult.referredBy">
                <h4>Referred By</h4>
                <p><strong>Name:</strong> {{ voiceRxResult.referredBy.name || 'N/A' }}</p>
                <p><strong>Speciality:</strong> {{ voiceRxResult.referredBy.speciality || 'N/A' }}</p>
              </section>
              
              <!-- Surgery Advice -->
              <section class="section" v-if="voiceRxResult.surgeryAdvice">
                <h4>Surgery Advised</h4>
                <p><strong>Name:</strong> {{ voiceRxResult.surgeryAdvice.name || 'N/A' }}</p>
                <p><strong>Date:</strong> {{ voiceRxResult.surgeryAdvice.date || 'N/A' }}</p>
              </section>
              
              <!-- Tags/Category -->
              <section class="section" v-if="voiceRxResult.tags">
                <h4>Category</h4>
                <ul>
                  <li>{{ voiceRxResult.tags }}</li>
                </ul>
              </section>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="closeVoiceRxDialog">Cancel</v-btn>
          <v-btn v-if="voiceRxResult" color="success" @click="fillFormWithVoiceRxData">
            <v-icon left>mdi-file-document-edit</v-icon>
            Fill the form
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Vitals Section -->
    <v-card class="section-card vitals">
      <v-toolbar flat style="column-gap: 20px; padding: 0px 20px;">
        <div class="prescription-page-icon">
          <v-icon>mdi-clipboard-pulse-outline</v-icon>
        </div>
        <v-toolbar-title class="ml-3">Vitals</v-toolbar-title>

        <!-- Settings Button -->
        <v-spacer></v-spacer>
        <v-btn icon @click="showSettings = true">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Dynamic Form Grid -->
      <v-container class="max-w-auto">
        <v-row v-for="(row, rowIndex) in chunkArray(dynamicFields, 6)" :key="rowIndex">
          <v-col v-for="(item, index) in row" :key="index" cols="12" md="2">
            <div class="lable-dev with-delete">
              <span>{{ item.label }}</span>
              <div v-if="item.id">
                <v-btn icon @click="openDeleteModel(item.id)">
                  <div class="prescription-page-icon">
                    <v-icon>mdi-trash-can</v-icon>
                  </div>
                </v-btn>
              </div>
            </div>
            <!-- Dynamically Render Text or Date Input -->
            <v-textarea v-if="item.type === 'text'" variant="outlined" v-model="vitals[item.model]"
              :placeholder="item.placeholder" rows="1" auto-grow></v-textarea>
            <a-date-picker v-else-if="item.type === 'date'" v-model:value="vitals[item.model]" :format="dateFormatList"
              valueFormat="YYYY-MM-DD" placeholder="DD/MM/YYYY" class="mb-4"></a-date-picker>
          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <!-- Complaints Section -->
    <v-card class="section-card">
      <v-data-table :items="complaintsList" class="elevation-1" disable-sort>
        <template v-slot:top>
          <v-toolbar flat style="padding: 0px 20px; display: flex; justify-content: space-between;"
            class="investigation-template">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-clipboard-text-clock</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Complaints</v-toolbar-title>
            </div>

            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Complaints', 1, complaintsList, complaintSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
              <v-menu offset-y class="template" v-if="complaintsTemplate.length > 0">
                <template v-slot:activator="{ props }">
                  <v-btn flat icon v-bind="props" class="icon-spacing">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-progress-upload</v-icon>
                    </div>
                  </v-btn>
                </template>
                <v-list style="width: 100%;">
                  <v-list-item v-for="(template, index) in complaintsTemplate" :key="index"
                    @click="addTemplate(template, 'complaintsList', { name: '' })">
                    {{ template.name }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-toolbar>
        </template>
        <template v-slot:item.name="{ item }" class="print-table">
          <v-combobox variant="outlined" v-model="item.name" :items="complaintSuggestions" hide-details
            @update:modelValue="dynamicHandleInput(item, 'complaintsList', ['name'])" @keydown.enter="focusNextInput"
            style="margin-bottom: 10px;"></v-combobox>
        </template>
      </v-data-table>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <!-- History Section -->
        <v-card class="section-card">
          <v-data-table :items="historyList" class="elevation-1" disable-sort density="compact">
            <template v-slot:top>
              <v-toolbar flat style="padding: 0px 20px; display: flex; justify-content: space-between;"
                class="investigation-template">
                <!-- Left side -->
                <div style="align-items: center;  display: flex;  justify-content: space-between;">
                  <div class="prescription-page-icon">
                    <v-icon>mdi-human-edit</v-icon>
                  </div>
                  <v-toolbar-title class="ml-3">Medical History</v-toolbar-title>
                </div>

                <!-- Right side -->
                <div class="d-flex">
                  <v-btn flat icon class="icon-spacing"
                    @click="AddDropdown('History', 2, historyList, historySuggestions)">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-content-save-check</v-icon>
                    </div>
                  </v-btn>
                  <v-menu offset-y class="template" v-if="historyTemplate.length > 0">
                    <template v-slot:activator="{ props }">
                      <v-btn flat icon v-bind="props" class="icon-spacing">
                        <div class="prescription-page-icon">
                          <v-icon>mdi-progress-upload</v-icon>
                        </div>
                      </v-btn>
                    </template>
                    <v-list style="width: 100%;">
                      <v-list-item v-for="(template, index) in historyTemplate" :key="index"
                        @click="addTemplate(template, 'historyList', { name: '' })">
                        {{ template.name }}
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-toolbar>
            </template>
            <template v-slot:item.name="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.name" :items="historySuggestions" hide-details
                @update:modelValue="dynamicHandleInput(item, 'historyList', ['name'])" @keydown.enter="focusNextInput"
                style=" margin-bottom: 10px;"></v-combobox>
            </template>
          </v-data-table>
        </v-card>

        <!-- Recent Investigation Section -->
        <v-card class="section-card">
          <v-toolbar class="mb-4 investigation-template" flat
            style="padding: 0px 20px; display: flex; justify-content: space-between;">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-hospital</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Recent Investigation</v-toolbar-title>
            </div>
            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Recent Investigation', 14, recentInvestigation, recentInvestigationSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar>
          <v-combobox class="px-5" variant="outlined" :items="recentInvestigationSuggestions"
            v-model="recentInvestigation" @keydown.enter="focusNextInput" outlined density="comfortable">
          </v-combobox>
        </v-card>

        <!-- Previous Surgery Section -->
        <v-card class="section-card">
          <v-toolbar class="mb-4 investigation-template" flat
            style="padding: 0px 20px; display: flex; justify-content: space-between;">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-hospital</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Previous Surgery</v-toolbar-title>
            </div>
            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Previous Surgery', 14, previousSurgery, previousSurgerySuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar>
          <v-combobox class="px-5" variant="outlined" :items="previousSurgerySuggestions" v-model="previousSurgery"
            @keydown.enter="focusNextInput" outlined density="comfortable">
          </v-combobox>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Drug History Section -->
        <v-card class="section-card fix-box">
          <v-data-table :items="drugHistory" class="elevation-1 custom-size-col" disable-sort density="compact">
            <template v-slot:top>
              <v-toolbar class="investigation-template" flat
                style="padding: 0px 20px; display: flex; justify-content: space-between;">
                <!-- Left side -->
                <div style="align-items: center;  display: flex;  justify-content: space-between;">
                  <div class="prescription-page-icon">
                    <v-icon>mdi-allergy</v-icon>
                  </div>
                  <v-toolbar-title class="ml-3">Drug History</v-toolbar-title>
                </div>
                <!-- Right side -->
                <div class="d-flex">
                  <v-btn flat icon class="icon-spacing"
                    @click="AddDropdown('Drug History', 11, drugHistory, drugHistorySuggestions)">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-content-save-check</v-icon>
                    </div>
                  </v-btn>
                </div>
              </v-toolbar>
            </template>
            <template v-slot:item.name="{ item }" class="print-table">
              <v-combobox variant="outlined" :items="drugHistorySuggestions" v-model="item.name" hide-details
                @update:model-value="dynamicHandleInput(item, 'drugHistory', ['name', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style="margin-bottom: 10px;">
              </v-combobox>
            </template>
            <template v-slot:item.details="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.details" hide-details
                @update:model-value="dynamicHandleInput(item, 'drugHistory', ['name', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style="margin-bottom: 10px;">
              </v-combobox>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <v-btn icon @click="deleteItem(drugHistory, index)"
                :disabled="index == (drugHistory.length - 1)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>

        <!-- Drug Allergy Section -->
        <v-card class="section-card fix-box">
          <v-data-table :items="drugAllergy" class="elevation-1 custom-size-col" disable-sort density="compact">
            <template v-slot:top>
              <v-toolbar class="investigation-template" flat
                style="padding: 0px 20px; display: flex; justify-content: space-between;">
                <!-- Left side -->
                <div style="align-items: center;  display: flex;  justify-content: space-between;">
                  <div class="prescription-page-icon">
                    <v-icon>mdi-allergy</v-icon>
                  </div>
                  <v-toolbar-title class="ml-3">Drug Allergy</v-toolbar-title>
                </div>
                <!-- Right side -->
                <div class="d-flex">
                  <v-btn flat icon class="icon-spacing"
                    @click="AddDropdown('Drug Allergy', 12, drugAllergy, drugAllergySuggestions)">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-content-save-check</v-icon>
                    </div>
                  </v-btn>
                </div>
              </v-toolbar>
            </template>
            <template v-slot:item.name="{ item }" class="print-table">
              <v-combobox variant="outlined" :items="drugAllergySuggestions" v-model="item.name" hide-details
                @update:model-value="dynamicHandleInput(item, 'drugAllergy', ['name', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style="margin-bottom: 10px;">
              </v-combobox>
            </template>
            <template v-slot:item.details="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.details" hide-details
                @update:model-value="dynamicHandleInput(item, 'drugAllergy', ['name', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style="margin-bottom: 10px;">
              </v-combobox>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <v-btn icon color="red" @click="deleteItem(drugAllergy, index)"
                :disabled="index == (drugAllergy.length - 1)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>

        <!-- Antiplatlet/Anticogulant Section -->
        <v-card class="section-card fix-box">
          <v-data-table :items="antiplatlet" class="elevation-1 custom-size-col" disable-sort density="compact">
            <template v-slot:top>
              <v-toolbar class="investigation-template" flat
                style="padding: 0px 20px; display: flex; justify-content: space-between;">
                <!-- Left side -->
                <div style="align-items: center;  display: flex;  justify-content: space-between;">
                  <div class="prescription-page-icon">
                    <v-icon>mdi-allergy</v-icon>
                  </div>
                  <v-toolbar-title class="ml-3">Antiplatelet/Anticogulant</v-toolbar-title>
                </div>
                <!-- Right side -->
                <div class="d-flex">
                  <v-btn flat icon class="icon-spacing"
                    @click="AddDropdown('Antiplatelet', 13, antiplatlet, antiplateletSuggestions)">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-content-save-check</v-icon>
                    </div>
                  </v-btn>
                </div>
              </v-toolbar>
            </template>
            <template v-slot:item.name="{ item }" class="print-table">
              <v-combobox variant="outlined" :items="antiplateletSuggestions" v-model="item.name" hide-details
                @update:model-value="dynamicHandleInput(item, 'antiplatlet', ['name', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style="margin-bottom: 10px;">
              </v-combobox>
            </template>
            <template v-slot:item.details="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.details" hide-details
                @update:model-value="dynamicHandleInput(item, 'antiplatlet', ['name', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style="margin-bottom: 10px;">
              </v-combobox>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <v-btn icon color="red" @click="deleteItem(antiplatlet, index)"
                :disabled="index == (antiplatlet.length - 1)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Physical Examination Section -->
    <v-card class="section-card">
      <v-data-table :items="physicalExamList" class="elevation-1" disable-sort>
        <template v-slot:top>
          <v-toolbar flat style="padding: 0px 20px; display: flex; justify-content: space-between;"
            class="investigation-template">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-clipboard-edit-outline</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Physical Examination</v-toolbar-title>
            </div>

            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Physical Examination', 3, physicalExamList, physicalSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
              <v-menu offset-y class="template" v-if="physicalExaminationTemplate.length > 0">
                <template v-slot:activator="{ props }">
                  <v-btn flat icon v-bind="props" class="icon-spacing">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-progress-upload</v-icon>
                    </div>
                  </v-btn>
                </template>
                <v-list style="width: 100%;">
                  <v-list-item v-for="(template, index) in physicalExaminationTemplate" :key="index"
                    @click="addTemplate(template, 'physicalExamList', { name: '' })">
                    {{ template.name }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

          </v-toolbar>
        </template>
        <template v-slot:item.name="{ item }" class="print-table">
          <v-combobox variant="outlined" v-model="item.name" :items="physicalSuggestions" hide-details
            @update:modelValue="dynamicHandleInput(item, 'physicalExamList', ['name'])" @keydown.enter="focusNextInput"
            style=" margin-bottom: 10px;"></v-combobox>
        </template>
      </v-data-table>
    </v-card>

    <v-row>
      <!-- Provisional Diagnosis Section -->
      <v-col cols="12" md="6">
        <v-card class="section-card provisional-box" style="height: 258px;">
          <v-toolbar class="investigation-template mb-4" flat
            style="padding: 0px 20px; display: flex; justify-content: space-between;">
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-clipboard-list-outline</v-icon>
              </div>
              <v-toolbar-title class="ml-3">
                <span>Provisional Diagnosis </span>
                <span style="font-size: 14px;">(will not be printed)</span>
              </v-toolbar-title>
            </div>
            <div>
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Provisional Diagnosis', 4, provisional, provisionalDiagnosisSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar>
          <v-combobox variant="outlined" v-model="provisional" outlined class="px-5"
            :items="provisionalDiagnosisSuggestions" @keydown.enter="focusNextInput" density="comfortable"></v-combobox>
        </v-card>
      </v-col>

      <!-- Diagnosis Section -->
      <v-col cols="12" md="6">
        <v-card class="section-card fix-box">
          <v-data-table :items="diagnosisList" class="elevation-1 custom-size-col" disable-sort density="compact">
            <template v-slot:top>
              <v-toolbar flat style="padding: 0px 20px; display: flex; justify-content: space-between;"
                class="investigation-template">
                <!-- Left side -->
                <div style="align-items: center;  display: flex;  justify-content: space-between;">

                  <div class="prescription-page-icon">
                    <v-icon>mdi-human-male-board</v-icon>
                  </div>
                  <v-toolbar-title class="ml-3">Diagnosis</v-toolbar-title>
                </div>

                <!-- Right side -->
                <div class="d-flex">
                  <v-btn flat icon class="icon-spacing"
                    @click="AddDropdown('Diagnosis', 5, diagnosisList, diagnosisSuggestions)">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-content-save-check</v-icon>
                    </div>
                  </v-btn>
                  <v-menu offset-y class="template" v-if="diagnosisTemplate.length > 0">
                    <template v-slot:activator="{ props }">
                      <v-btn flat icon v-bind="props" class="icon-spacing">
                        <div class="prescription-page-icon">
                          <v-icon>mdi-progress-upload</v-icon>
                        </div>
                      </v-btn>
                    </template>
                    <v-list style="width: 100%;">
                      <v-list-item v-for="(template, index) in diagnosisTemplate" :key="index"
                        @click="addTemplate(template, 'diagnosisList', { type: '', details: '' })">
                        {{ template.name }}
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-toolbar>
            </template>
            <template v-slot:item.type="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.type" :items="diagnosisSuggestions" hide-details
                @update:modelValue="dynamicHandleInput(item, 'diagnosisList', ['type', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style=" margin-bottom: 10px;"></v-combobox>
            </template>
            <template v-slot:item.details="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.details" hide-details
                @update:model-value="dynamicHandleInput(item, 'diagnosisList', ['type', 'details', 'actions'])"
                @keydown.enter="focusNextInput" style=" margin-bottom: 10px;"></v-combobox>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <v-btn icon color="red" @click="deleteItem(diagnosisList, index)"
                :disabled="index == (diagnosisList.length - 1)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Investigation Advice Table -->
    <v-card class="section-card v-col-12 fix-box">
      <v-data-table :items="investigationAdviceList" :headers="investigationAdviceHeader"
        class="elevation-1 medication-table custom-size-col" disable-sort>
        <template v-slot:top>
          <v-toolbar flat style="padding: 0px 20px; display: flex; justify-content: space-between;"
            class="investigation-template">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-clipboard-list-outline</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Investigation Advice</v-toolbar-title>
            </div>

            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Investigation Advice', 6, investigationAdviceList, investigationAdviceSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
              <v-menu offset-y class="template" v-if="investigationAdviceTemplate.length > 0">
                <template v-slot:activator="{ props }">
                  <v-btn flat icon v-bind="props" class="icon-spacing">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-progress-upload</v-icon>
                    </div>
                  </v-btn>
                </template>
                <v-list style="width: 100%;">
                  <v-list-item v-for="(template, index) in investigationAdviceTemplate" :key="index"
                    @click="addTemplate(template, 'investigationAdviceList', { name: '', details: '' })">
                    {{ template.name }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-toolbar>
        </template>
        <template v-slot:headers="{ props }">
          <tr>
            <th v-for="header in investigationAdviceHeader" :key="header.text" class="head">
              {{ header.text }}
            </th>
          </tr>
        </template>
        <template v-slot:item.name="{ item }" class="print-table">
          <v-combobox variant="outlined" v-model="item.name" :items="investigationAdviceSuggestions" hide-details
            @update:modelValue="dynamicHandleInput(item, 'investigationAdviceList', ['name', 'details', 'actions'])"
            @keydown.enter="focusNextInput" style=" margin-bottom: 10px;"></v-combobox>
        </template>
        <template v-slot:item.details="{ item }" class="print-table special-case">
          <v-combobox variant="outlined" v-model="item.details" hide-details
            @update:model-value="dynamicHandleInput(item, 'investigationAdviceList', ['name', 'details', 'actions'])"
            @keydown.enter="focusNextInput" style=" margin-bottom: 10px;"></v-combobox>
        </template>
        <template v-slot:item.actions="{ item, index }">
          <v-btn icon color="red" @click="deleteItem(investigationAdviceList, index)"
            :disabled="index == (investigationAdviceList.length - 1)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Medications -->
    <v-card class="section-card fix-box-1">
      <v-data-table :items="medications" :headers="medicationHeaders"
        class="elevation-1 medication-table custom-size-col" disable-sort density="compact">
        <template v-slot:top>
          <v-toolbar flat style="padding: 0px 20px; display: flex; justify-content: space-between;"
            class="investigation-template">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-pill-multiple</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Medications</v-toolbar-title>
            </div>

            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing" @click="AddMedicineDropdown(medications, medicineSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
              <v-menu offset-y class="template" v-if="medicationsTemplate.length > 0">
                <template v-slot:activator="{ props }">
                  <v-btn flat icon v-bind="props" class="icon-spacing">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-progress-upload</v-icon>
                    </div>
                  </v-btn>
                </template>
                <v-list style="width: 100%;">
                  <v-list-item v-for="(template, index) in medicationsTemplate" :key="index" @click="addTemplate(template, 'medications', {
                    name: '', dosage: '', frequency: '', duration: '', notes: ''
                  })">
                    {{ template.name }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-toolbar>
        </template>
        <template v-slot:headers="{ props }">
          <tr>
            <th v-for="header in medicationHeaders" :key="header.text" class="head">
              {{ header.text }}
            </th>
          </tr>
        </template>
        <template v-slot:item.name="{ item, index }">
          <v-combobox variant="outlined" v-model="item.name" item-value="name" item-title="name" hide-details
            @update:modelValue="dynamicHandleInput(item, 'medications', ['name', 'dosage', 'frequency', 'duration', 'notes', 'composition', 'actions'], true); updateMedicationName(item?.name?.name, medicineSuggestions, index)"
            @keydown.enter="focusNextInput" :items="medicineSuggestions" class="print-table mb-2 test-data">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:title>
                  {{ item.raw.name }}
                </template>
                <template v-slot:subtitle>
                  {{ item.raw.composition || 'No Composition' }}
                </template>
              </v-list-item>
            </template>
          </v-combobox>
          <div style="font-size: 12px; display: flex; align-items: center; margin-bottom: 10px;">
            <!-- Edit Composition -->
            <template v-if="!item.isEditingComposition">
              <v-icon size="15" @click="toggleEditComposition(item)" style="margin-right: 5px; cursor: pointer;"
                v-if="item.composition">
                mdi-pencil
              </v-icon>
              <span>{{ item.composition }}</span>
            </template>

            <!-- Input field for editing Composition -->
            <template v-else>
              <input v-model="item.composition" @blur="toggleEditComposition(item)" type="text"
                style="font-size: 12px; flex: 1; padding: 2px;" />
            </template>
          </div>
        </template>


        <template v-slot:item.dosage="{ item }">
          <v-combobox variant="outlined" v-model="item.dosage" hide-details
            @update:modelValue="dynamicHandleInput(item, 'medications', ['name', 'dosage', 'frequency', 'duration', 'notes', 'composition', 'actions'])"
            @keydown.enter="focusNextInput" :items="dosageSuggestions" class="print-table mb-2" style=""></v-combobox>
        </template>
        <template v-slot:item.frequency="{ item }">
          <v-combobox variant="outlined" v-model="item.frequency" :items="frequencyOptions" hide-details
            @update:modelValue="dynamicHandleInput(item, 'medications', ['name', 'dosage', 'frequency', 'duration', 'notes', 'composition', 'actions'])"
            @keydown.enter="focusNextInput" class="print-table mb-2" style=""></v-combobox>
        </template>
        <template v-slot:item.duration="{ item }">
          <v-combobox variant="outlined" v-model="item.duration" :items="durationSuggestions" hide-details
            @update:modelValue="dynamicHandleInput(item, 'medications', ['name', 'dosage', 'frequency', 'duration', 'notes', 'composition', 'actions'])"
            @keydown.enter="focusNextInput" class="print-table mb-2" style=""></v-combobox>
        </template>
        <template v-slot:item.notes="{ item }">
          <v-combobox variant="outlined" v-model="item.notes" hide-details
            @update:model-value="dynamicHandleInput(item, 'medications', ['name', 'dosage', 'frequency', 'duration', 'notes', 'composition', 'actions'])"
            @keydown.enter="focusNextInput" class="print-table mb-2" style=""></v-combobox>
        </template>
        <template v-slot:item.actions="{ item, index }">
          <v-btn icon color="red" @click="deleteItem(medications, index)" :disabled="index == (medications.length - 1)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Advice -->
    <v-card class="section-card">
      <v-data-table :items="adviceList" class="elevation-1" disable-sort density="compact">
        <template v-slot:top>
          <v-toolbar flat style="padding: 0px 20px; display: flex; justify-content: space-between;"
            class="investigation-template">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-clipboard-list-outline</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Advice</v-toolbar-title>
            </div>

            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing" @click="AddDropdown('Advice', 7, adviceList, adviceSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
              <v-menu offset-y class="template" v-if="adviceTemplate.length > 0">
                <template v-slot:activator="{ props }">
                  <v-btn flat icon v-bind="props" class="icon-spacing">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-progress-upload</v-icon>
                    </div>
                  </v-btn>
                </template>
                <v-list style="width: 100%;">
                  <v-list-item v-for="(template, index) in adviceTemplate" :key="index"
                    @click="addTemplate(template, 'adviceList', { name: '' })">
                    {{ template.name }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-toolbar>
        </template>
        <template v-slot:item.name="{ item }" class="print-table">
          <v-combobox variant="outlined" v-model="item.name" :items="adviceSuggestions" hide-details
            @update:modelValue="dynamicHandleInput(item, 'adviceList', ['name'])" @keydown.enter="focusNextInput"
            style=" margin-bottom: 10px;"></v-combobox>
        </template>
      </v-data-table>
    </v-card>

    <!-- Follow Up -->
    <v-card class="section-card">
      <v-toolbar class="mb-4" flat style="column-gap: 20px; padding: 0px 20px;">
        <div class="prescription-page-icon">
          <v-icon>mdi-history</v-icon>
        </div>
        <v-toolbar-title class="ml-3">Follow Up</v-toolbar-title>
      </v-toolbar>
      <v-row class="px-5">
        <v-col>
          <div class="lable-dev">
            <span>Days</span>
          </div>
          <v-combobox variant="outlined" v-model="followUpDays" type="number" min="0" @input="calculateFollowUpDate()"
            @keydown.enter="focusNextInput"></v-combobox>
        </v-col>

        <v-col>
          <div class="lable-dev">
            <span>Follow Up Date</span>
          </div>
          <v-combobox variant="outlined" v-model="followUpDate" disabled @keydown.enter="focusNextInput"></v-combobox>
        </v-col>
      </v-row>
    </v-card>

    <!-- Any Implant -->
    <v-card class="section-card v-col-12 fix-box">
      <v-data-table :items="implant" class="elevation-1 removable custom-size-col" disable-sort>
        <template v-slot:top>
          <v-toolbar class="investigation-template" flat
            style="padding: 0px 20px; display: flex; justify-content: space-between;">
            <!-- Left side -->
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-history</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Any Implant</v-toolbar-title>
            </div>
            <!-- Right side -->
            <div class="d-flex">
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Any Implant', 15, implant, anyImplantSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar>
        </template>
        <template v-slot:item.name="{ item, index }">
          <div v-if="index === 0" class="lable-dev">
            <span>Name</span>
          </div>
          <v-combobox variant="outlined" :items="anyImplantSuggestions" v-model="item.name" hide-details
            @update:model-value="dynamicHandleInput(item, 'implant', ['name', 'removalDate', 'actions'])"
            @keydown.enter="focusNextInput" style="margin-bottom: 10px;">
          </v-combobox>
        </template>
        <template v-slot:item.removalDate="{ item, index }">
          <div v-if="index === 0" class="lable-dev">
            <span>Removal Date</span>
          </div>
          <a-date-picker v-model:value="item.removalDate" :format="dateFormatList" valueFormat="YYYY-MM-DD"
            @change="dynamicHandleInput(item, 'implant', ['name', 'removalDate', 'actions'])"
            @keydown.enter="focusNextInput" placeholder="DD/MM/YYYY"></a-date-picker>
        </template>
        <template v-slot:item.actions="{ item, index }">
          <div v-if="index === 0" class="lable-dev">
            <span>Actions</span>
          </div>
          <v-btn icon color="red" @click="deleteItem(implant, index)" :disabled="index == (implant.length - 1)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>


    <v-row>
      <v-col cols="12" md="6">
        <!-- Referred To Section -->
        <v-card class="section-card fix-box">
          <v-data-table :items="referredTo" class="elevation-1 custom-size-col" disable-sort density="compact">
            <template v-slot:top>
              <v-toolbar class="investigation-template" flat
                style="padding: 0px 20px; display: flex; justify-content: space-between;">
                <div style="align-items: center;  display: flex;  justify-content: space-between;">
                  <div class="prescription-page-icon">
                    <v-icon>mdi-doctor</v-icon>
                  </div>
                  <v-toolbar-title class="ml-3">Referred To</v-toolbar-title>
                </div>
                <div>
                  <v-btn flat icon class="icon-spacing"
                    @click="AddDropdown('Doctor', 8, referredTo, doctorNameSuggestions)">
                    <div class="prescription-page-icon">
                      <v-icon>mdi-content-save-check</v-icon>
                    </div>
                  </v-btn>
                </div>
              </v-toolbar>
            </template>
            <template v-slot:item.name="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.name" :items="doctorNameSuggestions" hide-details
                @update:modelValue="dynamicHandleInput(item, 'referredTo', ['name', 'speciality', 'phoneNumber', 'actions'])"
                @keydown.enter="focusNextInput" style=" margin-bottom: 10px;"></v-combobox>
            </template>
            <template v-slot:item.speciality="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.speciality" hide-details
                @update:modelValue="dynamicHandleInput(item, 'referredTo', ['name', 'speciality', 'phoneNumber', 'actions'])"
                @keydown.enter="focusNextInput" style=" margin-bottom: 10px;"></v-combobox>
            </template>
            <template v-slot:item.phoneNumber="{ item }" class="print-table">
              <v-combobox variant="outlined" v-model="item.phoneNumber" hide-details
                @update:modelValue="dynamicHandleInput(item, 'referredTo', ['name', 'speciality', 'phoneNumber', 'actions'])"
                @keydown.enter="focusNextInput" style=" margin-bottom: 10px;"></v-combobox>
            </template>
            <template v-slot:item.actions="{ item, index }">
              <v-btn icon color="red" @click="deleteItem(referredTo, index)"
                :disabled="index == (referredTo.length - 1)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <!-- Referred By Section -->
        <v-card class="section-card">
          <v-toolbar class="investigation-template mb-4" flat
            style="padding: 0px 20px; display: flex; justify-content: space-between;">
            <div style="align-items: center;  display: flex;  justify-content: space-between;">

              <div class="prescription-page-icon">
                <v-icon>mdi-human-male</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Referred By</v-toolbar-title>
            </div>
            <div>
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Doctor', 8, referredBy.name, doctorNameSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar>
          <v-row class="px-5">
            <v-col>
              <div class="lable-dev">
                <span>Doctor Name</span>
              </div>
              <v-combobox variant="outlined" v-model="referredBy.name" :items="doctorNameSuggestions"
                @keydown.enter="focusNextInput"></v-combobox>
            </v-col>
            <v-col>
              <div class="lable-dev">
                <span>speciality</span>
              </div>
              <v-combobox variant="outlined" v-model="referredBy.speciality"
                @keydown.enter="focusNextInput"></v-combobox>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Surgery Advised Section -->
      <v-col cols="12" md="6">
        <v-card class="section-card">
          <v-toolbar class="investigation-template mb-4" flat
            style="padding: 0px 20px; display: flex; justify-content: space-between;">
            <div style="align-items: center;  display: flex;  justify-content: space-between;">

              <div class="prescription-page-icon">
                <v-icon>mdi-hospital-box-outline</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Surgery Advised</v-toolbar-title>
            </div>
            <div>
              <v-btn flat icon class="icon-spacing"
                @click="AddDropdown('Surgery Adviced', 9, surgeryAdvice.name, surgeryAdviceSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar>
          <v-row class="px-5">
            <v-col>
              <div class="lable-dev">
                <span>Name</span>
              </div>
              <v-combobox variant="outlined" v-model="surgeryAdvice.name" outlined :items="surgeryAdviceSuggestions"
                @keydown.enter="focusNextInput"></v-combobox>
            </v-col>
            <v-col>
              <div class="lable-dev">
                <span>Date</span>
              </div>
              <a-date-picker v-model:value="surgeryAdvice.date" :format="dateFormatList" valueFormat="YYYY-MM-DD"
                @keydown.enter="focusNextInput" placeholder="DD/MM/YYYY"></a-date-picker>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <!-- Tags Section -->
      <v-col cols="12" md="6">
        <v-card class="section-card">
          <v-toolbar class="investigation-template mb-4" flat
            style="padding: 0px 20px; display: flex; justify-content: space-between;">
            <div style="align-items: center;  display: flex;  justify-content: space-between;">
              <div class="prescription-page-icon">
                <v-icon>mdi-tag-multiple</v-icon>
              </div>
              <v-toolbar-title class="ml-3">Category</v-toolbar-title>
            </div>
            <div>
              <v-btn flat icon class="icon-spacing" @click="AddDropdown('Tags', 10, tags, tagsSuggestions)">
                <div class="prescription-page-icon">
                  <v-icon>mdi-content-save-check</v-icon>
                </div>
              </v-btn>
            </div>
          </v-toolbar>
          <v-combobox class="px-5" variant="outlined" v-model="tags" outlined :items="tagsSuggestions"
            @keydown.enter="focusNextInput"></v-combobox>
        </v-card>
      </v-col>
    </v-row>
    <div class="v-col-12 pa-0">
      <v-card class="section-card" v-for="(data, rowIndex) in dynamicSection" :key="rowIndex">
        <v-toolbar class="investigation-template mb-4" flat
          style="padding: 0px 20px; display: flex; justify-content: space-between;">
          <div style="align-items: center;  display: flex;  justify-content: space-between;">
            <div class="prescription-page-icon">
              <v-icon>mdi-tag-multiple</v-icon>
            </div>
            <v-toolbar-title class="ml-3">{{ data.label }}</v-toolbar-title>
          </div>
          <div>
            <v-btn flat icon class="icon-spacing" @click="openDeleteModel(data.id)">
              <div class="prescription-page-icon">
                <v-icon>mdi-trash-can</v-icon>
              </div>
            </v-btn>
          </div>
        </v-toolbar>
        <div class="px-5">
          <v-textarea v-if="data.type === 'text'" variant="outlined" v-model="additionalSectionsData[data.model]"
            :placeholder="data.placeholder" rows="1" auto-grow></v-textarea>
          <a-date-picker v-else-if="data.type === 'date'" v-model:value="additionalSectionsData[data.model]"
            :format="dateFormatList" valueFormat="YYYY-MM-DD" @keydown.enter="focusNextInput" placeholder="DD/MM/YYYY"
            class="mb-4"></a-date-picker>
        </div>
      </v-card>
    </div>

    <!-- Save Prescription Button -->

    <div class="fixed bottom-0 py-5 bg-[#f3f4f6] w-full z-99 left-0 pl-4 pr-4 shadow-2xl">
      <v-row class="justify-end align-center" no-gutters>
      <v-col cols="12" sm="auto" class="mb-2 mb-sm-0 d-flex justify-end">
        <v-btn class="saaro-btn w-100" @click="savePrescription">Save</v-btn>
      </v-col>
      <v-col cols="12" sm="auto" class="mb-2 mb-sm-0 d-flex justify-end">
        <v-btn class="saaro-btn w-100" @click="endConsultation('draft')">Print Prescription</v-btn>
      </v-col>
      <v-col cols="12" sm="auto" class="d-flex justify-end">
        <v-btn class="saaro-btn w-100" @click="endConsultation('complete')">End Consultation</v-btn>
      </v-col>
      </v-row>
    </div>

    <template>
      <div class="text-center pa-4">
        <v-dialog v-model="dialog" class="height: auto">
          <v-card class="print-popup w-75 max-1400">
            <v-card-title class="headline">Save Prescription</v-card-title>
            <v-card-text class="d-flex pr-0 pb-0 pt-0 pl-16">
              <v-row class="w-75 max-1100">
                <v-col class="v-col-12 m-0" style="height: 60vh;">
                  <div style="border: 1px solid #ccc; height: 100%; overflow: hidden;">
                    <iframe :src="prescriptionUrl" width="100%" height="100%" style="border: none;"></iframe>
                  </div>
                </v-col>
              </v-row>
              <v-row class="justify-center">
                <v-col class="v-col-10">
                  <div class="text-center pb-10">
                    <v-text-field variant="outlined" v-model="emailInput" label="Email" outlined></v-text-field>
                    <v-btn class="saaro-btn margin-none" @click="sharePrescription('Email')">Email</v-btn>
                  </div>
                  <div class="text-center">
                    <v-text-field variant="outlined" v-model="phoneInput" label="Phone Number" outlined></v-text-field>
                    <v-btn class="saaro-btn margin-none" @click="sharePrescription('WhatsApp/SMS')">WhatsApp/SMS</v-btn>
                  </div>

                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="closePopup" class="mr-12 px-15 saaro-btn">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </div>
    </template>

    <!-- Past Prescriptions Section -->
    <h4 class="section-title mb-5 prescription-card-heading">Past Prescriptions</h4>
    <v-row>
      <v-col v-for="prescription in pastPrescriptions" :key="prescription.id" cols="12" md="6">
        <v-card class="prescription-card mb-4" @click="pastPrescriptionDialogHandle(prescription.id)" large>
          <v-card-title>
            <span class="font-weight-bold">Prescription ID: {{ prescription.count }}</span>
          </v-card-title>
          <v-card-text>
            <p><strong>Date:</strong> {{ formatedDate(prescription.date) }}</p>
            <p><strong>Diagnosis:</strong> {{ prescription.diagnosis.join(', ') || 'No Diagnosis Added' }}</p>
            <p><strong>Medicines:</strong> {{ prescription.medicines.join(', ') || 'No Medicines Added' }}</p>
            <p>
              <strong>investigation Advice:</strong>
              {{ prescription.investigationsAdviced.join(', ') || 'No Investigation Advice Added' }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="9">
      <h4 class="section-title prescription-card-heading">Health Records</h4>
      </v-col>
      <v-col cols="12" md="3" class="text-center">
      <v-btn class="saaro-btn" color="#4caf50" @click="triggerFileUpload('health')">Upload Health Record</v-btn>
      <input ref="healthFileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" class="d-none"
        @change="handleRecordFileUpload('health')" />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="record in healthRecords" :key="record.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="health-record-card mb-4">
          <v-card-title>
            <span class="font-weight-bold">Document:</span>
            <v-btn icon @click="deleteFile(record, 'health')" class="float-right">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
             <v-btn icon @click="viewFile(record.fileUrl)" class="float-right ml-2 mt-16">
              <v-icon color="blue">mdi-eye</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <img :src="record.fileUrl" alt="Health Record" style="width: 250px;  object-fit: cover;" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upload IPD Record -->
    <v-row :style="{ marginBottom: $vuetify.display.smAndDown ? '120px' : '' }">
      <v-col cols="12" md="9">
      <h4 class="section-title prescription-card-heading">IPD Records</h4>
      </v-col>
      <v-col cols="12" md="3" class="text-center">
      <v-btn class="saaro-btn" color="#4caf50" @click="triggerFileUpload('ipd')">Upload IPD Record</v-btn>
      <input ref="ipdFileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" class="d-none"
        @change="handleRecordFileUpload('ipd')" />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="record in ipdRecords" :key="record.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="record-card mb-4">
          <v-card-title >
            <span class="font-weight-bold">Document:</span>
            <v-btn icon @click="deleteFile(record, 'ipd')" class="float-right">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
            <v-btn icon @click="viewFile(record.fileUrl)" class="float-right ml-2 mt-16">
              <v-icon color="blue">mdi-eye</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <img :src="record.fileUrl" alt="IPD Record" style="width: 250px; object-fit: cover;" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upload Invoice Record -->
    <v-row :style="{ marginBottom: $vuetify.display.smAndDown ? '120px' : '' }">
      <v-col cols="12" md="9">
      <h4 class="section-title prescription-card-heading">Invoice Records</h4>
      </v-col>
      <v-col cols="12" md="3" class="text-center">
      <v-btn class="saaro-btn" color="#4caf50" @click="triggerFileUpload('invoice')">Upload Invoice</v-btn>
      <input ref="invoiceFileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" class="d-none"
        @change="handleRecordFileUpload('invoice')" />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="record in invoiceRecords" :key="record.id" cols="12" sm="6" md="4" lg="3">
        <v-card class="record-card mb-4">
          <v-card-title>
            <span class="font-weight-bold">Document:</span>
            <v-btn icon @click="deleteFile(record, 'invoice')" class="float-right">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
             <v-btn icon @click="viewFile(record.fileUrl)" class="float-right ml-2 mt-16">
              <v-icon color="blue">mdi-eye</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <img :src="record.fileUrl" alt="Invoice Record" style="width: 250px; object-fit: cover;" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Prescription Dialog -->
    <v-dialog v-model="pdfDialog" class="height: auto">
      <v-card class="print-popup w-66" :class="$vuetify.display.smAndDown ? 'w-100' : 'w-66'">
      <v-card-title class="headline">Past Prescription</v-card-title>
      <v-card-text class="d-flex pr-0" :class="$vuetify.display.smAndDown ? 'flex-column pa-0' : ''">
        <v-row :class="$vuetify.display.smAndDown ? 'w-100 ma-0' : 'w-75'">
        <v-col class="v-col-12 m-0" :style="$vuetify.display.smAndDown ? 'height: 50vh; padding: 0;' : 'height: 80vh;'">
          <div style="border: 1px solid #ccc; height: 100%; overflow: hidden;">
          <iframe :src="pdfUrl" width="100%" height="100%" style="border: none;"></iframe>
          </div>
        </v-col>
        </v-row>
        <v-row class="justify-center flex-wrap" :class="$vuetify.display.smAndDown ? 'ma-0 pa-2' : ''">
        <v-col class="v-col-10" :cols="$vuetify.display.smAndDown ? 12 : 10">
          <div class="text-center pb-4" style="white-space: normal;">
          <v-text-field
            variant="outlined"
            v-model="emailInput"
            label="Email"
            outlined
            :dense="$vuetify.display.smAndDown"
            style="white-space: normal;"
          ></v-text-field>
          <v-btn
            class="saaro-btn"
            @click="sharePrescription('Email')"
            :block="$vuetify.display.smAndDown"
            style="white-space: normal; margin-bottom: 8px;"
          >Email</v-btn>
          </div>
          <div class="text-center" style="white-space: normal;">
          <v-text-field
            variant="outlined"
            v-model="phoneInput"
            label="Phone Number"
            outlined
            :dense="$vuetify.display.smAndDown"
            style="white-space: normal;"
          ></v-text-field>
          <v-btn
            class="saaro-btn"
            @click="sharePrescription('WhatsApp/SMS')"
            :block="$vuetify.display.smAndDown"
            style="white-space: normal; margin-bottom: 8px;"
          >WhatsApp/SMS</v-btn>
          </div>
        </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions
        class="close-btn"
        :style="$vuetify.display.smAndDown ? 'flex-direction:column; gap:8px; padding-bottom:16px;' : 'justify-content: flex-end;'"
      >
        <v-spacer v-if="!$vuetify.display.smAndDown"></v-spacer>
        <v-btn
        class="saaro-btn"
        text
        @click="closePdfDialog"
        :block="$vuetify.display.smAndDown"
        style="min-width: 120px;"
        >Cancel</v-btn>
      </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- vital Settings Popup Dialog -->
    <v-dialog v-model="showSettings" max-width="500">
      <v-card class="popup-card">
        <v-card-title class="popup-title">Vitals Settings</v-card-title>

        <v-card-text class="popup-detail">
          <v-text-field variant="outlined" v-model="newField.label" label="Field Name"></v-text-field>
          <v-select variant="outlined" v-model="newField.type" label="Select Input Type"
            :items="['text', 'date']"></v-select>
        </v-card-text>

        <v-card-actions class="popup-action">
          <v-btn class="saaro-btn" text @click="closeModal">Cancel</v-btn>
          <v-btn class="saaro-btn" text @click="addField">Add Field</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- add section Settings Popup Dialog -->
    <v-dialog v-model="showSettingsForSection" max-width="500">
      <v-card class="popup-card">
        <v-card-title class="popup-title">Consult Settings</v-card-title>

        <v-card-text class="popup-detail">
          <v-text-field variant="outlined" v-model="newSection.label" label="Section Name"></v-text-field>
          <v-select variant="outlined" v-model="newSection.type" label="Select Input Type"
            :items="['text', 'date']"></v-select>
          <v-switch label="Is Printable?" color="#385D7E" v-model="newSection.isPrint"></v-switch>
        </v-card-text>

        <v-card-actions class="popup-action">
          <v-btn class="saaro-btn" text @click="showSettingsForSection = false">Cancel</v-btn>
          <v-btn class="saaro-btn" text @click="addSection">Add Section</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <CommonModel :commonModel="isDeleteModalOpen" @close-dialog="isDeleteModalOpen = false" @actions="DeleteSection"
      title="Delete Section" description="Are you sure you want to delete section?" />
    <past-prescription-model :commonModel="isPastPrescriptionModalOpen"
      @close-dialog="isPastPrescriptionModalOpen = false" @actions="DeleteSection" title="Delete Section"
      description="Are you sure you want to delete section?" :data="pastData" />
    <!-- Document Preview Dialog -->
    <v-dialog v-model="previewDialog" width="60vw" height="80vh">
      <v-card style="height: 80vh; display: flex; flex-direction: column;">
        <v-card-title class="headline">Document Preview</v-card-title>
        <v-card-text style="flex: 1; overflow: hidden; padding: 0;">
          <iframe :src="previewFileUrl" width="100%" height="100%" style="border: none;background-size: contain; "></iframe>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="previewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { checkAuth, getDateFormate } from '@/lib/utils/utils';
import { usePatientStore } from '@/store/PatientStore';
import { useDropdownStore } from '@/store/DropdownStore';
import { useTemplateStore } from '@/store/TemplateStore';
import { useMedicineStore } from '@/store/MedicineStore';
import { usePrescriptionStore } from '@/store/PrescriptionStore';
import { useUiStore } from '@/store/UiStore';
import CommonModel from '@/components/CommonModel.vue';
import { dosageSuggestionsData, durationSuggestionsData, frequencyOptions } from '@/faker/data';
import PastPrescriptionModel from './components/PastPrescriptionModel.vue';

export default {
  name: "prescription",
  components: {
    CommonModel,
    PastPrescriptionModel
  },
  data() {
    return {
      showSettings: false,
      showSettingsForSection: false,
      vitals: {
        bp: "",
        pulse: "",
        height: "",
        weight: "",
        temperature: "",
        painScore: "",
      },
      additionalSectionsData: {},
      sectionId: "",
      isDeleteModalOpen: false,
      isPastPrescriptionModalOpen: false,
      dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY'],
      dynamicFields: [
        { label: "BP", model: "bp", type: "text", placeholder: "mm/Hg" },
        { label: "Pulse", model: "pulse", type: "text", placeholder: "bpm" },
        { label: "Height", model: "height", type: "text", placeholder: "cm" },
        { label: "Weight", model: "weight", type: "text", placeholder: "kg" },
        { label: "Temperature", model: "temperature", type: "text", placeholder: "°F" },
        { label: "Pain Score", model: "painScore", type: "text", placeholder: "0" },
      ],
      dynamicSection: [],
      newField: { label: "", type: "text" },
      newSection: { label: "", isPrint: false, type: "text" },
      drugAllergyList: [
        { details: "", reaction: "" }
      ],
      patientData: [],
      dosageSuggestions: dosageSuggestionsData,
      complaintSuggestions: [],
      historySuggestions: [],
      drugHistorySuggestions: [],
      drugAllergySuggestions: [],
      antiplateletSuggestions: [],
      previousSurgerySuggestions: [],
      recentInvestigationSuggestions: [],
      anyImplantSuggestions: [],
      physicalSuggestions: [],
      diagnosisSuggestions: [],
      provisionalDiagnosisSuggestions: [],
      investigationAdviceSuggestions: [],
      medicineSuggestions: [],
      adviceSuggestions: [],
      doctorNameSuggestions: [],
      surgeryAdviceSuggestions: [],
      tagsSuggestions: [],
      durationSuggestions: durationSuggestionsData,
      investigationAdviceTemplate: [],
      complaintsTemplate: [],
      historyTemplate: [],
      physicalExaminationTemplate: [],
      diagnosisTemplate: [],
      medicationsTemplate: [],
      adviceTemplate: [],
      dialog: false,
      prescriptionUrl: '',
      visitNumber: '',
      complaintsList: [{ name: '' }],
      search: "",
      historyList: [{ name: '' }],
      drugAllergy: [{ name: '', details: '', actions: '' }],
      drugHistory: [{ name: '', details: '', actions: '' }],
      antiplatlet: [{ name: '', details: '', actions: '' }],
      previousSurgery: '',
      recentInvestigation: '',
      physicalExamList: [{ name: '' }],
      implantList: [
        { type: "", details: "", }
      ],
      diagnosisList: [{ type: '', details: '', actions: '' }],
      investigationAdviceList: [{ name: "", details: "", actions: '' }],
      suggestions: ["Blood Test", "MRI Scan", "CT Scan", "X-Ray"],
      provisional: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '', actions: '' }],
      adviceList: [{ name: '' }],
      followUpDays: '',
      followUpDate: '',
      implant: [{ name: '', removalDate: '', actions: '' }],
      referredTo: [{ name: '', speciality: '', phoneNumber: '', actions: '' }],
      referredBy: { name: '', speciality: '' },
      surgeryAdvice: { name: '', date: '' },
      pdfDialog: false,
      pdfUrl: '',
      pastPrescriptions: [],
      pastPrescriptionsAllData: [],
      pastData: {},
      tags: '',
      diagnosisHeaders: [
        { text: 'Diagnosis Type', align: 'start', value: 'type' },
        { text: 'Details', align: 'start', value: 'details' },
      ],
      emailInput: '',
      phoneInput: '',
      medicationHeaders: [
        { text: 'Name', align: 'start', value: 'name' },
        { text: 'Dosage', align: 'start', value: 'dosage' },
        { text: 'Frequency', align: 'start', value: 'frequency' },
        { text: 'Duration', align: 'start', value: 'duration' },
        { text: 'Notes', align: 'start', value: 'notes' },
        { text: 'Actions', align: 'start', value: 'actions' },
      ],
      investigationAdviceHeader: [
        { text: 'Name', align: 'start', value: 'name' },
        { text: 'Detail/Finding', align: 'start', value: 'details' },
        { text: 'Actions', align: 'start', value: 'actions' },
      ],
      frequencyOptions: frequencyOptions,
      isDraft: false,
      healthRecords: [],
      ipdRecords: [],
      invoiceRecords: [], // Added invoice records array
      templates: [],
      // VoiceRx properties
      voiceRxDialog: false,
      audioFile: null,
      isRecording: false,
      isProcessing: false, // Added to track file processing state
      voiceRxResult: null,
      mediaRecorder: null,
      // Document preview properties
      previewDialog: false,
      previewFileUrl: '',
    };
  },
  mounted() {
    const auth = checkAuth(this.$router);
    if (auth) {
      // console.log("Consult page mounted with auth:", auth);
      // console.log("Route params:", this.$route.params);
      
      // Check if we have a valid patientId
      const patientId = this.$route.params.patientId;
      if (!patientId) {
        console.error("No patient ID in route params");
        const uiStore = useUiStore();
        uiStore.openNotificationMessage(
          'Error',
          'Invalid patient information. Please try again from the patient list.',
          'error'
        );
        return;
      }
      
      this.fetchDraftPrescription();
      this.fetchPatientDetails();
      this.fetchTemplates();
      this.fetchDropdowns();
      this.fetchMedicines();
      this.fetchPriscriptionSections();
      this.fetchHealthFiles();
      this.fetchIpdFiles();
      this.fetchInvoiceFiles(); // Added fetch invoice files
      this.fetchPrescriptions();
    }
  },
  methods: {
    async fetchPatientDetails() {
      try {
        const patientId = this.$route.params.patientId;
        // console.log("Fetching patient details for ID:", patientId); // Add logging
        
        if (!patientId) {
          console.error("No patient ID provided in route");
          const uiStore = useUiStore();
          uiStore.openNotificationMessage(
            'Error',
            'No patient ID provided. Please try again.',
            'error'
          );
          return;
        }
        
        const res = await usePatientStore().getPatientDetailsApiCall(patientId);
        // console.log("Patient details response:", res); // Add logging

        if (res && res.patient) {
          this.emailInput = res.patient.email;
          this.phoneInput = res.patient.phoneNumber;
          this.tags = res.patient.tags;
          this.patientData = res.patient;
        } else if (res && res.error) {
          console.error("Error from patient service:", res.error);
          const uiStore = useUiStore();
          uiStore.openNotificationMessage(
            'Error',
            res.error,
            'error'
          );
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
        const uiStore = useUiStore();
        uiStore.openNotificationMessage(
          'Error',
          'Failed to load patient details. Please try again.',
          'error'
        );
      }
    },
    async fetchPriscriptionSections() {
      const res = await usePrescriptionStore().getPrescriptionSectionsApiCall()

      if (res) {
        const availableLabels = res.prescriptionSections.map(item => item.label);

        this.dynamicFields = this.dynamicFields.filter(field =>
          ["BP", "Pulse", "Height", "Weight", "Temperature", "Pain Score"].includes(field.label) ||
          availableLabels.includes(field.label)
        );
        this.dynamicSection = this.dynamicSection.filter(section => availableLabels.includes(section.label));


        res.prescriptionSections.forEach((item) => {
          const exists = this.dynamicFields.some(field => field.label === item.label);
          const existsSection = this.dynamicSection.some(field => field.label === item.label);

          if (!exists && item.sectionType === "vitals") {
            this.dynamicFields.push({
              id: item._id,
              label: item.label,
              model: item.label,
              type: item.fieldType,
              placeholder: item.fieldType === "text" ? "Enter text" : "",
            })
          } else if (!existsSection && item.sectionType === "consult") {
            this.dynamicSection.push({
              id: item._id,
              label: item.label,
              model: item.label,
              type: item.fieldType,
              placeholder: item.fieldType === "text" ? "Enter text" : "",
            })
          }
        })
      }
    },
    async fetchDropdowns() {
      const res = await useDropdownStore().getAllDropdownsApiCall()

      if (res) {
        const templates = {};

        res.dropdowns.forEach((item) => {
          const sectionName = item.sectionName
            .toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
              index === 0 ? word.toLowerCase() : word.toUpperCase()
            )

          if (!templates[sectionName]) {
            templates[sectionName] = [];
          }

          templates[sectionName].push({
            name: item.name || "Template First",
          });
        });

        this.complaintSuggestions = this.convertToDirectArray(templates.complaints) || [];
        this.historySuggestions = this.convertToDirectArray(templates.history) || [];
        this.drugHistorySuggestions = this.convertToDirectArray(templates["drug History"]) || [];
        this.drugAllergySuggestions = this.convertToDirectArray(templates["drug Allergy"]) || [];
        this.antiplateletSuggestions = this.convertToDirectArray(templates.antiplatelet) || [];
        this.previousSurgerySuggestions = this.convertToDirectArray(templates["previous Surgery"]) || [];
        this.recentInvestigationSuggestions = this.convertToDirectArray(templates["recent Investigation"]) || [];
        this.anyImplantSuggestions = this.convertToDirectArray(templates["any Implant"]) || [];
        this.physicalSuggestions = this.convertToDirectArray(templates["physical Examination"]) || [];
        this.diagnosisSuggestions = this.convertToDirectArray(templates.diagnosis) || [];
        this.provisionalDiagnosisSuggestions = this.convertToDirectArray(templates["provisional Diagnosis"]) || [];
        this.investigationAdviceSuggestions = this.convertToDirectArray(templates["investigation Advice"]) || [];
        this.adviceSuggestions = this.convertToDirectArray(templates.advice) || [];
        this.doctorNameSuggestions = this.convertToDirectArray(templates.doctor) || [];
        this.surgeryAdviceSuggestions = this.convertToDirectArray(templates["surgery Adviced"]) || [];
        this.tagsSuggestions = this.convertToDirectArray(templates.tags) || [];
      }
    },
    async fetchTemplates() {
      const res = await useTemplateStore().getAllTemplatesApiCall()

      if (res) {
        const templates = {};

        res.templates.forEach((item) => {
          const sectionName = item.sectionName
            .toLowerCase()
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
              index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, "") + "Template";

          if (!templates[sectionName]) {
            templates[sectionName] = [];
          }

          const formattedData = item.data
            .filter((dataItem) => {
              return Object.values(dataItem).some((value) => value && value.trim());
            })
            .map((dataItem) => {
              if (sectionName === "complaintsTemplate") {
                return { name: dataItem.name || "" };
              } else if (sectionName === "diagnosisTemplate") {
                return { type: dataItem.name || "", details: dataItem.details || "" };
              } else {
                return dataItem;
              }
            });

          templates[sectionName].push({
            name: item.name || "Template First",
            data: formattedData,
          });
        });

        this.complaintsTemplate = templates.complaintsTemplate || [];
        this.historyTemplate = templates.historyTemplate || [];
        this.physicalExaminationTemplate = templates.physicalExaminationTemplate || [];
        this.diagnosisTemplate = templates.diagnosisTemplate || [];
        this.medicationsTemplate = templates.medicationsTemplate || [];
        this.adviceTemplate = templates.adviceTemplate || [];
        this.investigationAdviceTemplate = templates.investigationAdviceTemplate || [];
      }
    },
    async fetchMedicines() {
      const res = await useMedicineStore().getAllMedicinesApiCall()

      if (res) {
        this.medicineSuggestions = res.medicines.map((medicine) => ({
          name: medicine.medicineName,
          composition: medicine.composition,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
          notes: medicine.notes
        }));
      }
    },
    async fetchDraftPrescription() {
      try {
        const patientId = this.$route.params.patientId;
        // console.log("Fetching draft prescription for patient ID:", patientId);
        
        if (!patientId) {
          console.error("No patient ID provided for draft prescription");
          return;
        }
        
        const res = await usePrescriptionStore().getDraftPrescriptionApiCall(patientId)
        // console.log("Draft prescription response:", res);

        if (res) {
          const prescriptionData = res.prescription;

          // Check if this is the specific "not drafted yet" message
          if (prescriptionData === 'Prescription is not drafted yet.') {
            // console.log("No draft prescription found for patient, starting fresh");
            // This is expected for new patients, no need to show error
            this.isDraft = false;
            // Initialize with default empty values
            this.clearAll();
            return;
          }

          // If we have actual prescription data
          if (prescriptionData && typeof prescriptionData === 'object') {
            this.isDraft = true;

            this.vitals.bp = prescriptionData.bloodPressure || "";
            this.vitals.height = prescriptionData.height || "";
            this.vitals.weight = prescriptionData.weight || "";
            this.vitals.pulse = prescriptionData.pulse || "";
            this.vitals.temperature = prescriptionData.temperature || "";
            this.vitals.painScore = prescriptionData.painScore || "";

            this.complaintsList = prescriptionData.complaints?.length ? 
              prescriptionData.complaints.map(complaint => ({ name: complaint })) : 
              [{ name: "" }];
              
            this.historyList = prescriptionData.history?.length ? 
              prescriptionData.history.map(history => ({ name: history })) : 
              [{ name: "" }];
              
            this.previousSurgery = prescriptionData.previousSurgery || "";
            this.recentInvestigation = prescriptionData.recentInvestigation || "";
            
            this.physicalExamList = prescriptionData.physicalExamination?.length ? 
              prescriptionData.physicalExamination.map(complaint => ({ name: complaint })) : 
              [{ name: "" }];
              
            this.provisional = prescriptionData.provisional || "";
            
            // Continue with the rest of the data mapping...
          }
        }
      } catch (error) {
        console.error("Error fetching draft prescription:", error);
        // Don't show error to user for this case as it's expected for new patients
        this.isDraft = false;
        this.clearAll();
      }
    },
    async fetchPrescriptions() {
      const patientId = this.$route.params.patientId;
      const res = await usePrescriptionStore().getPrescriptionFileApiCall(patientId)

      if (res) {
        // Filter to show only completed prescriptions
        const completedPrescriptions = res.files.filter(item => item.status === 'complete');
        
        let counter = completedPrescriptions.length;
        this.pastPrescriptionsAllData = completedPrescriptions
        this.pastPrescriptions = completedPrescriptions.map((item) => ({
          count: counter--,
          id: item._id,
          history: item.history,
          drugAllergy: item.drugAllergy,
          drugHistory: item.drugHistory,
          antiplatlet: item.antiplatlet,
          previousSurgery: item.previousSurgery,
          recentInvestigation: item.recentInvestigation,
          implants: item.implant,
          tags: item.tags,
          provisional: item.provisional,
          medicines: item.medications.map((med) => med.name),
          diagnosis: item.diagnosis.map((diag) => diag.type),
          date: new Date(item.createdAt).toLocaleDateString(),
          investigationsAdviced: item?.investigationsAdviced.map((invest) => invest.name),
          pdfUrl: `${import.meta.env.VITE_SERVER_URL}/public/prescriptions/prescription_${item._id}.pdf`,
        }));

        if (!this.isDraft === true && this.pastPrescriptions.length > 0) {
          const item = this.pastPrescriptions[0];
          const drugList = [];
          for (let i = 0; i < item.drugAllergy.length; i++) {
            drugList.push({
              name: item.drugAllergy[i].name,
              details: item.drugAllergy[i].details,
              actions: ''
            });
          }
          drugList.push({
            name: '',
            details: '',
            actions: ''
          })
          this.drugAllergy = drugList;

          const drugHList = [];
          for (let i = 0; i < item.drugHistory.length; i++) {
            drugHList.push({
              name: item.drugHistory[i].name,
              details: item.drugHistory[i].details,
              actions: ''
            });
          }
          drugHList.push({
            name: '',
            details: '',
            actions: ''
          })
          this.drugHistory = drugHList;

          const antiplatlet = [];
          for (let i = 0; i < item.antiplatlet.length; i++) {
            antiplatlet.push({
              name: item.antiplatlet[i].name,
              details: item.antiplatlet[i].details,
              actions: ''
            });
          }
          antiplatlet.push({
            name: '',
            details: '',
            actions: ''
          })
          this.antiplatlet = antiplatlet;

          const today = new Date();
          const implantList = [];
          for (let i = 0; i < item.implants.length; i++) {
            const removalDate = new Date(item.implants[i].removalDate);
            if (removalDate >= today) {
              implantList.push({
                name: item.implants[i].name,
                removalDate: item.implants[i].removalDate,
                actions: ''
              });
            }
          }
          implantList.push({
            name: '',
            removalDate: '',
            actions: ''
          })
          this.implant = implantList;

          this.tags = item.tags;
          this.provisional = item.provisional;

          const historyList = [];
          for (let i = 0; i < item.history.length; i++) {
            historyList.push({
              name: item.history[i],
            });
          }
          this.historyList = historyList;
        }
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
    async addField() {
      if (!this.newField.label) return;

      const requestData = {
        label: this.newField.label,
        fieldType: this.newField.type,
        placeholder: "Enter text",
        sectionType: "vitals",
        printable: true
      }

      const res = await usePrescriptionStore().addPrescriptionSectionsApiCall(requestData)

      if (res) {
        this.newField = { label: "", type: "text" };
        this.showSettings = false;
        this.fetchPriscriptionSections();
        useUiStore().openNotificationMessage("Vitals Added Successfully!");
      }
    },
    async addSection() {
      if (!this.newSection.label) return;

      const requestData = {
        label: this.newSection.label,
        fieldType: this.newSection.type,
        placeholder: "Enter text",
        sectionType: "consult",
        printable: this.newSection.isPrint
      }

      const res = await usePrescriptionStore().addPrescriptionSectionsApiCall(requestData)

      if (res) {
        this.fetchPriscriptionSections();
        this.newSection = { label: "", isPrint: false, type: "text" };
        this.showSettingsForSection = false;
        useUiStore().openNotificationMessage("Consult Section Added Successfully!");
      }
    },
    async DeleteSection() {
      const res = await usePrescriptionStore().deletePrescriptionSectionsApiCall(this.sectionId)

      this.fetchPriscriptionSections();
      this.isDeleteModalOpen = false;
      useUiStore().openNotificationMessage("Section Deleted Successfully!");

    },
    async AddDropdown(sectionName, sectionId, data, dropdownData) {
      let notAvailableData

      if (typeof data === "string") {
        notAvailableData = dropdownData.includes(data.trim()) ? [] : [data.trim()];
      } else {

        if (sectionName === "Diagnosis") {
          notAvailableData = data
            .map(item => item.type.trim())
            .filter(name => name && !dropdownData.includes(name));
        } else {
          notAvailableData = data
            .map(item => item.name.trim())
            .filter(name => name && !dropdownData.includes(name));
        }
      }

      if (notAvailableData.length > 0) {
        notAvailableData.map(async (name) => {
          const requestData = {
            sectionId: sectionId,
            sectionName: sectionName,
            name: name
          }

          const res = await useDropdownStore().AddDropdownApiCall(requestData)

          if (res) {
            this.fetchDropdowns();
            useUiStore().openNotificationMessage("Dropdown Saved Successfully!");
          }
        })
      }
    },
    async AddMedicineDropdown(data, dropdownData) {
      const availableNames = new Set(dropdownData.map(item => item.name));

      const notAvailableData = data.filter(med => {
        const medName = typeof med.name === 'object' && med.name !== null ? med.name.name : med.name;
        return medName.trim() && !availableNames.has(medName);
      });

      if (notAvailableData.length > 0) {
        notAvailableData.map(async (data) => {
          const requestData = {
            composition: "-",
            medicineName: data.name,
            dosage: data.dosage,
            frequency: data.frequency,
            duration: data.duration,
            notes: data.notes
          }
          const res = await useMedicineStore().AddMedicineApiCall(requestData)

          if (res) {
            this.fetchMedicines();
            useUiStore().openNotificationMessage("Medicine Saved Successfully!");
          }
        })
      }
    },
    formatList(list, fields) {
      return list
        .filter(item => fields.some(field => item[field]))
        .map(item => Object.fromEntries(fields.map(field => [field, item[field] || null])));
    },
    formatRequestData(vm, status = null) {
      const excludedFields = ["bp", "pulse", "weight", "height", "temperature", "painScore"];

      return {
        bloodPressure: vm.vitals.bp,
        pulse: vm.vitals.pulse,
        weight: vm.vitals.weight,
        height: vm.vitals.height,
        temperature: vm.vitals.temperature,
        painScore: vm.vitals.painScore,
        complaints: vm.complaintsList.map(item => item.name),
        history: vm.historyList.map(item => item.name),
        physicalExamination: vm.physicalExamList.map(item => item.name),
        diagnosis: this.formatList(vm.diagnosisList, ["type", "details"]),
        medications: this.formatList(vm.medications, ["name", "dosage", "frequency", "duration", "notes", "composition"]).map(item => ({
          ...item,
          name: typeof item.name === "object" ? item.name.name : item.name
        })),
        advice: vm.adviceList.map(item => item.name),
        followUp: {
          days: vm.followUpDays,
          date: vm.followUpDate,
        },
        referredTo: this.formatList(vm.referredTo, ["name", "speciality", "phoneNumber"]),
        referredBy: {
          name: vm.referredBy.name,
          speciality: vm.referredBy.speciality,
        },
        implant: this.formatList(vm.implant, ["name", "removalDate"]),
        drugAllergy: this.formatList(vm.drugAllergy, ["name", "details"]),
        drugHistory: this.formatList(vm.drugHistory, ["name", "details"]),
        antiplatlet: this.formatList(vm.antiplatlet, ["name", "details"]),
        previousSurgery: vm.previousSurgery,
        recentInvestigation: vm.recentInvestigation,
        surgeryAdvice: vm.surgeryAdvice,
        tags: vm.tags,
        provisional: vm.provisional,
        investigationsAdviced: this.formatList(vm.investigationAdviceList, ["name", "details"]),
        additionalVitals: Object.entries(vm.vitals)
          .filter(([key]) => !excludedFields.includes(key))
          .map(([field, value]) => ({ field, value })),
        additionalSections: Object.entries(vm.additionalSectionsData).map(([field, value]) => ({ field, value })),
        ...(status ? { status } : {}),
      };
    },
    async handleApiCall(apiFunction, vm, status = null) {
      const patientId = vm.$route.params.patientId;
      const requestData = this.formatRequestData(vm, status);
      const res = await apiFunction(patientId, requestData);

      if (res) {
        if (status) {
          vm.prescriptionUrl = res.pdfPath;
          // Also set pdfUrl for sharing functionality
          if (res.pdfPath) {
            vm.pdfUrl = res.pdfPath;
          }
          vm.dialog = true;
          useUiStore().openNotificationMessage(status === "draft" ? "Print Prescription Successfully!" : "End Consultation Successfully!");
          
          // Clear the form only when ending consultation (status is 'complete')
          if (status === "complete") {
            vm.clearAll();
            // Reset isDraft flag
            vm.isDraft = false;
          }
        } else {
          useUiStore().openNotificationMessage("Prescription Saved Successfully!");
          vm.fetchDraftPrescription();
        }
      }
    },
    async savePrescription() {
      await this.handleApiCall(usePrescriptionStore().savePrescriptionApiCall, this);
    },
    async endConsultation(status) {
      await this.handleApiCall(usePrescriptionStore().endConsultationApiCall, this, status);
    },
    async handleRecordFileUpload(type) {
      const fileInput =
        type === "health" ? this.$refs.healthFileInput : 
        type === "ipd" ? this.$refs.ipdFileInput : 
        this.$refs.invoiceFileInput;
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
      }

      const patientId = this.$route.params.patientId;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", type);

      const res = await usePrescriptionStore().uploadFileApiCall(patientId, formData)

      if (res) {
        useUiStore().openNotificationMessage(`${type} record uploaded successfully!`);
      }
    },
    closeModal() {
      this.showSettings = false;
    },
    chunkArray(array, chunkSize) {
      const result = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
      }
      return result;
    },
    convertToDirectArray(objArray) {
      return objArray?.map(item => item.name);
    },
    focusNextInput(index, field) {
      const currentInput = document.activeElement;
      const allInputs = Array.from(document.querySelectorAll("input"));
      const validInputs = allInputs.filter(input => {
        const ariaLabel = input.getAttribute("aria-label") || "";
        const inputMode = input.getAttribute("inputmode") || "";
        return inputMode !== "none" && !ariaLabel.toLowerCase().includes("open");
      });

      const currentIndex = validInputs.indexOf(currentInput);

      if (currentIndex !== -1 && currentIndex < validInputs.length - 1) {
        validInputs[currentIndex + 1].focus();
      }
    },
    toggleEditComposition(item) {

      if (item.isEditingComposition) {
        item.isEditingComposition = false;
      } else {
        item.isEditingComposition = true;
      }
    },
    openDeleteModel(id) {
      this.sectionId = id;
      this.isDeleteModalOpen = true;
    },
    updateMedicationName(data, medicineSuggestions, index) {
      if(data){
        const relatedData = medicineSuggestions?.find((item)=> item?.name == data)
        this.medications[index] = relatedData;
      }
    },
    // Add New Feilds
    dynamicHandleInput(item, listKey, keyFields = ["name"], isComposition = false) {
      if (isComposition) {
        const selectedMedicine = this.medicineSuggestions.find(
          (suggestion) => suggestion.name === item.name?.name
        );

        item.composition = selectedMedicine ? selectedMedicine.composition : "";
      }
      if (this.isRowFilledDynamic(item, keyFields) && !this.hasEmptyRowDynamic(this[listKey], keyFields)) {
        this[listKey].push(this.createEmptyRowDynamic(keyFields));
      }
      this.removeEmptyRowsDynamic(listKey, keyFields);
    },

    isRowFilledDynamic(item, keyFields) {
      return keyFields.some(field => String(item[field] || '').trim().length > 0);
    },

    hasEmptyRowDynamic(list, keyFields) {
      return list.some(row => keyFields.every(field => String(row[field] || '').trim().length === 0));
    },

    removeEmptyRowsDynamic(listKey, keyFields) {
      this[listKey] = this[listKey].filter((row, index) =>
        this.isRowFilledDynamic(row, keyFields) || index === this[listKey].length - 1
      );
    },

    createEmptyRowDynamic(keyFields) {
      return keyFields.reduce((obj, field) => ({ ...obj, [field]: "" }), {});
    },

    deleteItem(item, index) {
      item.splice(index, 1);
    },

    // Add Template
    addTemplate(templateData, listKey, emptyItem) {
      this[listKey] = this[listKey].filter(item =>
        Object.values(item).some(value => value !== "")
      );

      this[listKey].push(...templateData.data);
      this[listKey].push(emptyItem);
    },
    pastPrescriptionDialogHandle(id) {
      this.pastData = this.pastPrescriptionsAllData.filter(item => item._id === id)?.[0]

      this.isPastPrescriptionModalOpen = true;
    },
    pdfDialogHandle(item) {
      this.pdfUrl = `${import.meta.env.VITE_SERVER_URL}/public/prescriptions/prescription_${item.id}.pdf`;
      this.pdfDialog = true;
    },
    closePdfDialog() {
      this.pdfUrl = '';
      this.pdfDialog = false;
      window.location.reload();
    },
    printPrescription() {
      if (this.pdfUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = this.pdfUrl;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.onload = () => {
          iframe.contentWindow.print();
          document.body.removeChild(iframe);
        };
      } else {
        alert('No prescription available to print!');
      }
    },
    clearAll() {
      this.visitNumber = '';
      this.vitals = { bp: '', pulse: '', height: '', weight: '', temperature: '', painScore: '' };
      this.complaintsList = [{ name: '' }];
      this.historyList = [{ name: '' }];
      this.physicalExamList = [{ name: '' }];
      this.diagnosisList = [{ type: '', details: '' }];
      this.adviceList = [{ name: '' }];
      this.followUpDays = '';
      this.followUpDate = '';
      this.referredTo = [{ name: '', speciality: '', phoneNumber: '' }];
      this.referredBy = { name: '', speciality: '' };
      this.surgeryAdvice = { name: '', date: '' };
      this.tags = '';
      this.drugAllergy = [{ name: '', details: '' }];
      this.drugHistory = [{ name: '', details: '' }];
      this.antiplatlet = [{ name: '', details: '' }];
      this.previousSurgery = '';
      this.recentInvestigation = '',
        this.investigationAdviceList = [{ name: "", details: "" }];
      this.provisional = '';
      this.medications = [{ name: '', dosage: '', frequency: '', duration: '', notes: '', composition: '' }];
      this.implant = [{ name: '', removalDate: '' }];
      this.pdfUrl = '';
    },
    calculateFollowUpDate() {
      if (this.followUpDays === null) {
        this.followUpDate = null;
        return;
      }

      const today = new Date();
      const followUpDate = new Date(today);
      followUpDate.setDate(followUpDate.getDate() + parseInt(this.followUpDays));
      this.followUpDate = getDateFormate(followUpDate)
    },
    openPopup() {
      this.dialog = true;
    },
    closePopup() {
      this.dialog = false;
      window.location.reload();
    },
    sharePrescription(method) {
      if (method === 'WhatsApp/SMS') {
        // Share via WhatsApp with prescription link
        if (this.phoneInput) {
          // Ensure phoneInput is a string before calling replace
          const phoneInputStr = typeof this.phoneInput === 'string' ? this.phoneInput : String(this.phoneInput);
          const phoneNumber = phoneInputStr.replace(/[^0-9]/g, '');
          
          // Construct message with prescription link
          let message = 'Please find your prescription: ';
          
          // Add prescription link if available
          if (this.pdfUrl && this.pdfUrl.trim() !== '') {
            message += this.pdfUrl;
          } else {
            message += 'Prescription will be attached.';
          }
          
          // Properly encode the message for URL
          const encodedMessage = encodeURIComponent(message);
          // Ensure phoneNumber is a string
          const phoneString = String(phoneNumber);
          const whatsappUrl = `https://wa.me/91${phoneString}?text=${encodedMessage}`;
          
          console.log('WhatsApp URL:', whatsappUrl);
          window.open(whatsappUrl, '_blank');
        } else {
          alert('Please enter a phone number to share via WhatsApp/SMS!');
        }
      } else if (method === 'Email') {
        // Share via Email
        if (this.emailInput) {
          const subject = 'Your Prescription';
          let body = 'Please find your prescription: ';
          
          // Add prescription link if available
          if (this.pdfUrl && this.pdfUrl.trim() !== '') {
            body += this.pdfUrl;
          } else {
            body += 'Prescription will be attached.';
          }
          
          const mailUrl = `mailto:${this.emailInput}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailUrl;
        } else {
          alert('Please enter an email address to share via Email!');
        }
      } else if (method === 'Print') {
        this.printPrescription();
      }
      this.closePopup();
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
    formatedDate(date) {
      return getDateFormate(date);
    },
    viewFile(fileUrl) {
      // Set the file URL and open the preview dialog
      this.previewFileUrl = fileUrl;
      this.previewDialog = true;
    },
    
    // VoiceRx methods
    async startRecording() {
      try {
        // Show loading state
        this.isRecording = true;
        
        // Check if browser supports media recording
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Media recording is not supported in your browser');
        }
        
        // Get user media (microphone)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create media recorder
        this.mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        
        // Set up event listeners
        this.mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        this.mediaRecorder.onstop = async () => {
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          // Create blob from recorded audio
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Create file object
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          
          // Process the recorded audio
          await this.processRecordedAudio(audioFile);
        };
        
        // Start recording
        this.mediaRecorder.start();
        
        // Stop recording after 10 seconds (or you can add a stop button)
        // setTimeout(() => {
        //   if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        //     this.mediaRecorder.stop();
        //   }
        // }, 10000);
        
        // Update UI
        const uiStore = useUiStore();
        uiStore.openNotificationMessage('Recording started... Speak now. Click "Stop Recording" to finish early, or wait for the automatic stop after 10 seconds.', "", "info");
        
      } catch (error) {
        this.isRecording = false;
        const uiStore = useUiStore();
        uiStore.openNotificationMessage(`Recording failed: ${error.message}`, "", "error");
        console.error('Recording error:', error);
      }
    },
    
    async processRecordedAudio(audioFile) {
      try {
        // Close the dialog
        this.voiceRxDialog = false;
        
        // Show processing message
        const uiStore = useUiStore();
        uiStore.openNotificationMessage("Processing recorded audio...", "", "info");
        
        // Import the VoiceRx store
        const { useVoiceRxStore } = await import('@/store/VoiceRxStore');
        const voiceRxStore = useVoiceRxStore();
        
        // Call the transcribe API
        const result = await voiceRxStore.transcribeAudioApiCall(audioFile);
          console.log('VoiceRx Result:', result);
        if (result.error) {
          uiStore.openNotificationMessage(result.error, "", "error");
        } else if (result.status === 'success' && result.prescription) {
          uiStore.openNotificationMessage("Audio processed successfully!", "", "success");
          // Handle successful transcription and prescription formatting
          this.handleVoiceRxResult(result.prescription);
        } else {
          uiStore.openNotificationMessage("Failed to process audio file - invalid response", "", "error");
        }
      } catch (error) {
        const uiStore = useUiStore();
        uiStore.openNotificationMessage("Failed to process recorded audio", "", "error");
        console.error('VoiceRx error:', error);
      } finally {
        this.isRecording = false;
      }
    },
    
    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      // Don't close the modal here, let the onstop event handle processing
      // The onstop event will set isRecording to false and isProcessing to true
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
    // Added method to trigger audio file upload
    triggerAudioFileUpload() {
      this.$refs.audioFileInput.click();
    },
    // Modified method to handle audio file upload for VoiceRx
    async handleAudioFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Set processing state to show loader
      this.isProcessing = true;
      
      // Show processing message
      const uiStore = useUiStore();
      uiStore.openNotificationMessage("Processing audio file...", "", "info");
      
      try {
        // Import the VoiceRx store
        const { useVoiceRxStore } = await import('@/store/VoiceRxStore');
        const voiceRxStore = useVoiceRxStore();
        
        // Call the transcribe API
        const result = await voiceRxStore.transcribeAudioApiCall(file);
        console.log('VoiceRx Result:', result);

        if (result.error) {
          uiStore.openNotificationMessage(result.error, "", "error");
          // Keep the dialog open to allow user to try again
        } else if (result.status === 'success' && result.prescription) {
          uiStore.openNotificationMessage("Audio processed successfully!", "", "success");
          // Handle successful transcription and prescription formatting
          this.handleVoiceRxResult(result.prescription);
        } else {
          uiStore.openNotificationMessage("Failed to process audio file - invalid response", "", "error");
          // Keep the dialog open to allow user to try again
        }
      } catch (error) {
        const uiStore = useUiStore();
        uiStore.openNotificationMessage("Failed to process audio file", "", "error");
        console.error('VoiceRx error:', error);
        // Keep the dialog open to allow user to try again
      } finally {
        // Reset processing state
        this.isProcessing = false;
      }
    },
    
    async processRecordedAudio(audioFile) {
      try {
        // Show processing state instead of closing the dialog
        this.isRecording = false;
        this.isProcessing = true;
        
        // Show processing message
        const uiStore = useUiStore();
        uiStore.openNotificationMessage("Processing recorded audio...", "", "info");
        
        // Import the VoiceRx store
        const { useVoiceRxStore } = await import('@/store/VoiceRxStore');
        const voiceRxStore = useVoiceRxStore();
        
        // Call the transcribe API
        const result = await voiceRxStore.transcribeAudioApiCall(audioFile);
        
        if (result.error) {
          uiStore.openNotificationMessage(result.error, "", "error");
        } else if (result.status === 'success' && result.prescription) {
          uiStore.openNotificationMessage("Audio processed successfully!", "", "success");
          // Handle successful transcription and prescription formatting
          this.handleVoiceRxResult(result.prescription);
        } else {
          uiStore.openNotificationMessage("Failed to process audio file - invalid response", "", "error");
        }
      } catch (error) {
        const uiStore = useUiStore();
        uiStore.openNotificationMessage("Failed to process recorded audio", "", "error");
        console.error('VoiceRx error:', error);
      } finally {
        // Reset processing state
        this.isProcessing = false;
      }
    },
    
    handleVoiceRxResult(result) {
      // Store the result for display in the modal
      this.voiceRxResult = result;
      
      // Show success message
      const uiStore = useUiStore();
      uiStore.openNotificationMessage('Audio processed successfully! Click "Fill the form" to populate the prescription.', "", "success");
    },
    
    fillFormWithVoiceRxData() {
      if (!this.voiceRxResult) return;
      
      const result = this.voiceRxResult;
      
      // Fill vitals data
      this.vitals.bp = result.bloodPressure || '';
      this.vitals.pulse = result.pulse || '';
      this.vitals.height = result.height || '';
      this.vitals.weight = result.weight || '';
      this.vitals.temperature = result.temperature || '';
      this.vitals.painScore = result.painScore || '';
      
      // Fill complaints
      if (result.complaints && result.complaints.length) {
        this.complaintsList = result.complaints.map(complaint => ({ name: complaint }));
        // Add an empty field at the end for new entries
        this.complaintsList.push({ name: '' });
      }
      
      // Fill history
      if (result.history && result.history.length) {
        this.historyList = result.history.map(historyItem => ({ name: historyItem }));
        // Add an empty field at the end for new entries
        this.historyList.push({ name: '' });
      }
      
      // Fill recent investigation
      this.recentInvestigation = result.recentInvestigation || '';
      
      // Fill drug history
      if (result.drugHistory && result.drugHistory.length) {
        this.drugHistory = result.drugHistory.map(drug => ({
          name: drug.name || '',
          details: drug.details || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.drugHistory.push({ name: '', details: '', actions: '' });
      }
      
      // Fill drug allergy
      if (result.drugAllergy && result.drugAllergy.length) {
        this.drugAllergy = result.drugAllergy.map(allergy => ({
          name: allergy.name || '',
          details: allergy.details || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.drugAllergy.push({ name: '', details: '', actions: '' });
      }
      
      // Fill antiplatelet
      if (result.antiplatlet && result.antiplatlet.length) {
        this.antiplatlet = result.antiplatlet.map(anti => ({
          name: anti.name || '',
          details: anti.details || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.antiplatlet.push({ name: '', details: '', actions: '' });
      }
      
      // Fill previous surgery
      this.previousSurgery = result.previousSurgery || '';
      
      // Fill provisional diagnosis
      this.provisional = result.provisional || '';
      
      // Fill physical examination
      if (result.physicalExamination && result.physicalExamination.length) {
        this.physicalExamList = result.physicalExamination.map(exam => ({ name: exam }));
        // Add an empty field at the end for new entries
        this.physicalExamList.push({ name: '' });
      }
      
      // Fill investigations advised
      if (result.investigationsAdviced && result.investigationsAdviced.length) {
        this.investigationAdviceList = result.investigationsAdviced.map(inv => ({
          name: inv.name || '',
          details: inv.details || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.investigationAdviceList.push({ name: '', details: '', actions: '' });
      }
      
      // Fill diagnosis
      if (result.diagnosis && result.diagnosis.length) {
        this.diagnosisList = result.diagnosis.map(diag => ({
          type: diag.type || '',
          details: diag.details || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.diagnosisList.push({ type: '', details: '', actions: '' });
      }
      
      // Fill medications
      if (result.medications && result.medications.length) {
        this.medications = result.medications.map(med => ({
          name: med.name || '',
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          notes: med.notes || '',
          composition: med.composition || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.medications.push({ name: '', dosage: '', frequency: '', duration: '', notes: '', composition: '', actions: '' });
      }
      
      // Fill advice
      if (result.advice && result.advice.length) {
        this.adviceList = result.advice.map(adviceItem => ({ name: adviceItem }));
        // Add an empty field at the end for new entries
        this.adviceList.push({ name: '' });
      }
      
      // Fill follow-up
      if (result.followUp) {
        this.followUpDays = result.followUp.days || '';
        this.followUpDate = result.followUp.date || '';
      }
      
      // Fill referred to
      if (result.referredTo && result.referredTo.length) {
        this.referredTo = result.referredTo.map(ref => ({
          name: ref.name || '',
          speciality: ref.speciality || '',
          phoneNumber: ref.phoneNumber || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.referredTo.push({ name: '', speciality: '', phoneNumber: '', actions: '' });
      }
      
      // Fill referred by
      if (result.referredBy) {
        this.referredBy.name = result.referredBy.name || '';
        this.referredBy.speciality = result.referredBy.speciality || '';
      }
      
      // Fill implant
      if (result.implant && result.implant.length) {
        this.implant = result.implant.map(imp => ({
          name: imp.name || '',
          removalDate: imp.removalDate || '',
          actions: ''
        }));
        // Add an empty field at the end for new entries
        this.implant.push({ name: '', removalDate: '', actions: '' });
      }
      
      // Fill surgery advice
      if (result.surgeryAdvice) {
        this.surgeryAdvice.name = result.surgeryAdvice.name || '';
        this.surgeryAdvice.date = result.surgeryAdvice.date || '';
      }
      
      // Fill tags
      this.tags = result.tags || '';
      
      // Close the dialog
      this.voiceRxDialog = false;
      
      // Reset the result for next use
      this.voiceRxResult = null;
      
      // Show success message
      const uiStore = useUiStore();
      uiStore.openNotificationMessage('Form populated successfully with VoiceRx data!', "", "success");
    },
    
    closeVoiceRxDialog() {
      // Close the dialog
      this.voiceRxDialog = false;
      
      // Reset the result for next use
      this.voiceRxResult = null;
      
      // Reset processing state
      this.isProcessing = false;
    }
  },
};
</script>

<style scoped>
ul {
  list-style-position: inside;
}

.section {
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.section h4 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}
</style>
