<template>
  <v-container fluid>
    <v-row align="center" justify="space-between">
      <v-col cols="6">
        <!-- Removed old IPD Records heading -->
      </v-col>
      <v-col cols="6" class="d-flex justify-end">
        <v-btn class="saaro-btn" @click="showAddDialog = true">Add Record</v-btn>
      </v-col>
    </v-row>
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>Select Section</v-card-title>
        <v-card-actions>
          <v-btn color="primary" @click="openIPD">IPD Section</v-btn>
          <v-btn color="secondary" @click="openProcedure">Procedure Section</v-btn>
          <v-btn color="secondary" @click="openTentativeSurgery">Tentative Surgery</v-btn>
          <!-- <v-btn color="info" @click="openSurgicalPlan">Surgical Plan</v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- WhatsApp Message Dialog -->
    <v-dialog v-model="showWhatsAppDialog" max-width="500px">
      <v-card>
        <v-card-title>Send WhatsApp Message</v-card-title>
        <v-card-text>
          <p>Do you want to send a WhatsApp message to <strong>{{ patientName || 'the patient' }}</strong>?</p>
          <v-text-field
            v-model="whatsappPhoneNumber"
            label="Phone Number"
            placeholder="Enter phone number"
            variant="outlined"
            dense
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="showWhatsAppDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="sendWhatsAppMessage" :disabled="!whatsappPhoneNumber || whatsappPhoneNumber.trim() === ''">Send Message</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <IPDEntryForm
      v-if="showForm === 'ipd'"
      :dialog="true"
      :isEditModel="isEditModel"
      :entry="editEntry"
      @entry-saved="handleEntrySaved"
      @close-dialog="closeForm"
    />
    <ProcedureEntryForm v-if="showForm === 'procedure'" :dialog="true" @entry-saved="handleProcedureSaved" @close-dialog="closeForm" />
    <SurgicalPlanForm v-if="showForm === 'surgicalPlan'" :dialog="true" :ipdRecordId="selectedIpdRecordId" @plan-saved="handleSurgicalPlanSaved" @close-dialog="closeForm" />
    <TentativeSurgeryEntryForm v-if="showForm === 'tentativeSurgery'" :dialog="true" :isEditModel="isEditModel" :entry="editEntry" @entry-saved="handleTentativeSurgerySaved" @close-dialog="closeForm" />
    <div v-if="!showForm && !showTentativeSurgeryList">
      <IPDDataList :ipdData="ipdData" @edit-entry="handleEditEntry" />
      <!-- Removed old Procedure Records heading -->
      <ProcedureDataList :procedureData="procedureData" @mark-stent-removed="handleMarkStentRemoved" />
    </div>
    <TentativeSurgeryDataList  @edit-entry="handleEditTentativeSurgery" />
  </v-container>
</template>

<script>
import IPDEntryForm from '@/components/IPDEntryForm.vue';
import IPDDataList from '@/components/IPDDataList.vue';
import ProcedureEntryForm from '@/components/ProcedureEntryForm.vue';
import ProcedureDataList from '@/components/ProcedureDataList.vue';
import SurgicalPlanForm from '@/components/SurgicalPlanForm.vue';
import TentativeSurgeryEntryForm from '@/components/TentativeSurgeryEntryForm.vue'; // Added import
import TentativeSurgeryDataList from '@/components/TentativeSurgeryDataList.vue'; // Added import
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getAllIPD, createIPD, updateIPD } from '@/apis/IPD';
import { getAllProcedures, createProcedure, markStentRemoved, updateProcedure } from '@/apis/Procedure';
import { getAllTentativeSurgeries } from '@/apis/TentativeSurgery'; // Added import
import { createSurgicalPlan } from '@/apis/SurgicalPlan';
import { useUiStore } from '@/store/UiStore'; // <-- import UiStore
export default {
  name: 'IPD',
  components: { 
    IPDEntryForm, 
    IPDDataList, 
    ProcedureEntryForm, 
    ProcedureDataList, 
    SurgicalPlanForm,
    TentativeSurgeryEntryForm, // Added component
    TentativeSurgeryDataList // Added component
  },
  setup() {
    const ipdData = ref([]);
    const procedureData = ref([]);
    const showForm = ref(null);
    const showAddDialog = ref(false);
    const showTentativeSurgeryList = ref(false); // Added for showing tentative surgery list
    const editEntry = ref(null);
    const isEditModel = ref(false);
    const selectedIpdRecordId = ref(null);
    // WhatsApp message state
    const showWhatsAppDialog = ref(false);
    const patientPhoneNumber = ref('');
    const patientName = ref('');
    const whatsappPhoneNumber = ref(''); // For editable phone number in dialog
    const procedureDetails = ref({}); // For storing procedure details for WhatsApp message
    const uiStore = useUiStore(); // <-- use UiStore

    const fetchIPDData = async () => {
      ipdData.value = await getAllIPD();
      // console.log('Fetched IPD Data:', ipdData.value);
    };

    const fetchTentativeSurgeryData = async () => {
      try {
        const res = await getAllTentativeSurgeries();
        // We don't need to store this data locally since the TentativeSurgeryDataList handles its own data
        // But we can log it for debugging purposes
        console.log('Fetched tentative surgeries:', res.data || res || []);
      } catch (error) {
        console.error('Error fetching tentative surgeries:', error);
      }
    };
    const handleEntrySaved = async (entry) => {
      try {
        if (isEditModel.value && editEntry.value && editEntry.value._id) {
          await updateIPD(editEntry.value._id, entry);
          uiStore.openNotificationMessage('IPD record updated successfully!', '', 'success'); // <-- success
        } else {
          await createIPD(entry);
          uiStore.openNotificationMessage('IPD record created successfully!', '', 'success'); // <-- success
        }
        await fetchIPDData();
        window.dispatchEvent(new CustomEvent('ipd-record-added'));
      } catch (err) {
        uiStore.openNotificationMessage(
          err?.response?.data?.error || err.message || 'Failed to save IPD record',
          '',
          'error'
        ); // <-- error
      }
      showForm.value = null;
      editEntry.value = null;
      isEditModel.value = false;
    };
    
    // Added function for handling tentative surgery saves
    const handleTentativeSurgerySaved = async (entry) => {
      try {
        // Close the form
        showForm.value = null;
        editEntry.value = null;
        isEditModel.value = false;
        
        // Show success notification
        uiStore.openNotificationMessage('Tentative surgery saved successfully!', '', 'success');
        
        // Always refresh the IPD data to show any related changes
        await fetchIPDData();
        
        // Refresh the tentative surgery list if it's visible
        if (showTentativeSurgeryList.value) {
          // Emit an event to refresh the list
          window.dispatchEvent(new CustomEvent('tentative-surgery-updated'));
        }
        
        // Also dispatch a general patient update event that other components might listen to
        window.dispatchEvent(new CustomEvent('patient-updated'));
      } catch (err) {
        uiStore.openNotificationMessage(
          err?.response?.data?.error || err.message || 'Failed to save tentative surgery',
          '',
          'error'
        );
      }
    };
    const fetchProcedureData = async () => {
      procedureData.value = await getAllProcedures();
    };

    const handleProcedureSaved = async (entry) => {
      try {
        if (!entry.patientUid) {
          throw new Error('Patient identifier is required for procedure records');
        }
        await createProcedure(entry);
        await fetchProcedureData();
        window.dispatchEvent(new CustomEvent('procedure-record-added'));
        uiStore.openNotificationMessage('Procedure record created successfully!', '', 'success'); // <-- success
        
        // Store procedure details for WhatsApp message
        procedureDetails.value = {
          patientName: entry.patientName || '',
          phoneNumber: entry.phoneNumber || '',
          implantOrRemoval: entry.implantOrRemoval || '',
          implantDetails: entry.implantDetails || '',
          dateOfRemoval: entry.dateOfRemoval || '',
          dateOfImplantSutures: entry.dateOfImplantSutures || '',
          procedureType: entry.procedureType || '',
        };
        
        // Show WhatsApp dialog if patient has a phone number
        if (entry.phoneNumber && (typeof entry.phoneNumber === 'string' || typeof entry.phoneNumber === 'number')) {
          const phoneNumberStr = String(entry.phoneNumber).trim();
          if (phoneNumberStr !== '') {
            patientPhoneNumber.value = phoneNumberStr;
            whatsappPhoneNumber.value = phoneNumberStr;
            patientName.value = entry.patientName || '';
            showWhatsAppDialog.value = true;
          }
        }
      } catch (err) {
        uiStore.openNotificationMessage(
          err?.response?.data?.error || err.message || 'Failed to save procedure',
          '',
          'error'
        ); // <-- error
        console.error('Procedure save error:', err);
      }
      showForm.value = null;
    };
    const openIPD = () => {
      showAddDialog.value = false;
      showForm.value = 'ipd';
      editEntry.value = null;
      isEditModel.value = false;
    };
    const openProcedure = () => {
      showAddDialog.value = false;
      showForm.value = 'procedure';
    };
    const openSurgicalPlan = (ipdRecordId = null) => {
      showAddDialog.value = false;
      selectedIpdRecordId.value = ipdRecordId;
      showForm.value = 'surgicalPlan';
    };
    
    // Added function for opening tentative surgery form
    const openTentativeSurgery = () => {
      showAddDialog.value = false;
      showTentativeSurgeryList.value = false; // Hide list when opening form
      showForm.value = 'tentativeSurgery';
      editEntry.value = null;
      isEditModel.value = false;
    };
    
    // Added function for showing tentative surgery list
    const showTentativeSurgeryListFn = () => {
      showAddDialog.value = false;
      showForm.value = null; // Hide form when showing list
      showTentativeSurgeryList.value = true;
    };
    
    const handleSurgicalPlanSaved = async (plan) => {
      try {
        // The surgical plan is now handled in the SurgicalPlanForm component itself
        // We just need to close the form and show a success message
        uiStore.openNotificationMessage('Surgical plan saved successfully!', '', 'success');
        showForm.value = null;
      } catch (err) {
        uiStore.openNotificationMessage(
          err?.response?.data?.error || err.message || 'Failed to save surgical plan',
          '',
          'error'
        );
        console.error('Surgical plan save error:', err);
      }
    };
    const closeForm = () => {
      showForm.value = null;
      showTentativeSurgeryList.value = false; // Added
      editEntry.value = null;
      isEditModel.value = false;
    };
    const handleEditEntry = (entry) => {
      console.log('Editing entry:', entry);
      editEntry.value = entry;
      isEditModel.value = true;
      showForm.value = 'ipd';
    };
    
    // Added function for editing tentative surgery
    const handleEditTentativeSurgery = (entry) => {
      editEntry.value = entry;
      isEditModel.value = true;
      showForm.value = 'tentativeSurgery';
    };
    const handleMarkStentRemoved = async (item) => {
      try {
        const updateData = {
          stentRemoved: true,
          dateOfRemoval: item.dateOfRemoval
        };
        await updateProcedure(item._id || item.id, updateData);
        await fetchProcedureData();
        window.dispatchEvent(new CustomEvent('procedure-record-updated'));
        uiStore.openNotificationMessage('Stent marked as removed successfully!', '', 'success'); // <-- success
      } catch (err) {
        uiStore.openNotificationMessage(
          err?.response?.data?.error || err.message || 'Failed to mark stent as removed',
          '',
          'error'
        ); // <-- error
      }
    };
    
    // Send WhatsApp message function
    const sendWhatsAppMessage = () => {
      // Simple implementation - open WhatsApp with pre-filled message
      const phoneNumber = String(whatsappPhoneNumber.value || '');
      
      // Format dates for display
      const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
      };
      
      const message = `Hello ${procedureDetails.value.patientName || 'Patient'},

Your procedure record has been successfully created.

Patient Name: ${procedureDetails.value.patientName || 'N/A'}
Phone Number: ${phoneNumber}
Procedure Type: ${procedureDetails.value.procedureType || 'N/A'}
Implant/Removal: ${procedureDetails.value.implantOrRemoval || 'N/A'}
${procedureDetails.value.implantOrRemoval === 'Removal' ? 'Date of Removal: ' + formatDate(procedureDetails.value.dateOfRemoval) : 'Date of Implant/Sutures: ' + formatDate(procedureDetails.value.dateOfImplantSutures)}
Details: ${procedureDetails.value.implantDetails || 'N/A'}

Please follow all post-procedure care instructions provided by your healthcare team.

If you have any concerns or questions, please contact our healthcare facility.

Thank you for choosing our healthcare services.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      showWhatsAppDialog.value = false;
    };
    
    // Event handlers for real-time updates
    const handleTentativeSurgeryUpdated = () => {
      // The TentativeSurgeryDataList component handles its own data fetching
      // This event listener ensures the component knows to refresh its data
      // We also refresh the IPD data in case there are related changes
      fetchIPDData();
    };
    
    onMounted(() => {
      fetchIPDData();
      fetchProcedureData();
      // Set up event listeners for real-time updates
      window.addEventListener('tentative-surgery-updated', handleTentativeSurgeryUpdated);
    });
    
    onBeforeUnmount(() => {
      // Clean up event listeners
      window.removeEventListener('tentative-surgery-updated', handleTentativeSurgeryUpdated);
    });
    
    return {
      ipdData, procedureData, showForm, showAddDialog, showTentativeSurgeryList, // Added showTentativeSurgeryList
      handleEntrySaved, handleProcedureSaved, handleSurgicalPlanSaved,
      handleTentativeSurgerySaved, // Added function for handling tentative surgery saves
      openIPD, openProcedure, openSurgicalPlan, openTentativeSurgery, // Added openTentativeSurgery
      showTentativeSurgeryListFn, handleEditTentativeSurgery, // Added new functions
      closeForm, handleMarkStentRemoved,
      editEntry, isEditModel, handleEditEntry, selectedIpdRecordId,
      // WhatsApp message variables and functions
      showWhatsAppDialog, patientPhoneNumber, patientName, whatsappPhoneNumber, procedureDetails, sendWhatsAppMessage
    };
  },
};
</script>