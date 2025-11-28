<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <h1 class="dashboard-title">Dashboard</h1>
          <!-- Ask AI Button -->
          <v-btn 
            color="primary" 
            @click="openAIChat"
            class="ai-chat-button"
          >
            Ask AI
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <IPDBarGraphs :metrics="ipdMetrics" />
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <ProcedureMetrics :metrics="procedureMetrics" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <last-24-hours-patient />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <last-30-days-patient />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <last-30-days-invoice />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="6">
        <comparision-data />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <last-30-days-payment />
      </v-col>
    </v-row>
      <surgery-tables />

    <!-- AI Chat Modal -->
    <AIChatModal 
      v-model="showAIChat" 
    />
  </v-container>
</template>

<script>
import IPDBarGraphs from '@/components/IPDBarGraphs.vue';
import ProcedureMetrics from '@/components/ProcedureMetrics.vue';
import { getIPDDashboard } from '@/apis/IPD';
import { getProcedureDashboard } from '@/apis/Procedure';
import Last24HoursPatient from './components/Last24HoursPatient.vue'
import Last30DaysPatient from './components/Last30DaysPatient.vue'
import Last30DaysInvoice from './components/Last30DaysInvoice.vue';
import Last30DaysPayment from './components/Last30DaysPayment.vue';
import ComparisionData from './components/ComparisionData.vue';
import SurgeryTables from './components/SurgeryTables.vue';
import AIChatModal from '@/components/AIChatModal.vue';

export default {
  name: "Dashboard",
  components: {
    IPDBarGraphs,
    ProcedureMetrics,
    Last24HoursPatient,
    Last30DaysPatient,
    Last30DaysInvoice,
    Last30DaysPayment,
    ComparisionData,
    SurgeryTables,
    AIChatModal
  },
  data() {
    return {
      ipdMetrics: {},
      procedureMetrics: {},
      showAIChat: false
    };
  },
  async mounted() {
    await this.fetchAllMetrics();
    // Listen for IPD record changes
    window.addEventListener('ipd-record-added', this.fetchAllMetrics);
    window.addEventListener('ipd-record-updated', this.fetchAllMetrics);
    window.addEventListener('ipd-record-deleted', this.fetchAllMetrics);
    
    // Listen for procedure record changes
    window.addEventListener('procedure-record-added', this.fetchAllMetrics);
    window.addEventListener('procedure-record-updated', this.fetchAllMetrics);
    window.addEventListener('procedure-record-deleted', this.fetchAllMetrics);
  },
  beforeUnmount() {
    // Remove all event listeners
    window.removeEventListener('ipd-record-added', this.fetchAllMetrics);
    window.removeEventListener('ipd-record-updated', this.fetchAllMetrics);
    window.removeEventListener('ipd-record-deleted', this.fetchAllMetrics);
    window.removeEventListener('procedure-record-added', this.fetchAllMetrics);
    window.removeEventListener('procedure-record-updated', this.fetchAllMetrics);
    window.removeEventListener('procedure-record-deleted', this.fetchAllMetrics);
  },
  methods: {
    async fetchAllMetrics() {
      try {
        // Fetch both IPD and procedure metrics in parallel
        const [ipdRes, procedureRes] = await Promise.all([
          getIPDDashboard('monthly'),
          getProcedureDashboard('monthly')
        ]);
        
        this.ipdMetrics = ipdRes && ipdRes.metrics ? ipdRes.metrics : {};
        
        this.procedureMetrics = procedureRes && procedureRes.metrics ? procedureRes.metrics : {};
        // console.log(this.ipdMetrics)
        // console.log(procedureRes)
        if (!ipdRes || !ipdRes.metrics) {
          console.warn('IPD dashboard response missing metrics:', ipdRes);
        }
        if (!procedureRes || !procedureRes.metrics) {
          console.warn('Procedure dashboard response missing metrics:', procedureRes);
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        this.ipdMetrics = {};
        this.procedureMetrics = {};
      }
    },
    
    openAIChat() {
      console.log("Ask AI button clicked - opening chat modal");
      this.showAIChat = true;
    }
  },
};
</script>

<style scoped>
.ai-chat-button {
  z-index: 100;
}
</style>