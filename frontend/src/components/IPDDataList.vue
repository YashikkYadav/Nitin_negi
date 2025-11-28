<template>
  <v-container fluid class="ipd-list-container sm:px-0 md:px-4">
    <!-- Filters -->
    <v-row class="filter-row flex flex-wrap">
      <v-col cols="12" md="4" class="mb-2 md:mb-0">
        <v-text-field
          v-model="search"
          label="Name,Phone,UID"
          append-inner-icon="mdi-magnify"
          variant="solo"
          class="rounded-full search-bar max-w-[350px] bg-[#f5f6fa]"
          style="background:#f5f6fa;"
          dense
          clearable
        />
      </v-col>
      <v-col cols="12" md="4" v-if="hasSpecialProcedures" class="mb-2 md:mb-0">
        <!-- Filter by Procedure as chips, wrap enabled -->
        <div class="procedure-chip-group chip-group-responsive flex flex-wrap gap-x-2 gap-y-1 mb-2">
          <v-chip
            v-for="option in filterOptions"
            :key="option"
            variant="outlined"
            size="small"
            @click="procedureFilter = option"
            :color="procedureFilter === option ? 'primary' : undefined"
            class="cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md"
          >
            {{ option }}
          </v-chip>
        </div>
      </v-col>
      <v-col cols="12" md="2" class="mb-2 md:mb-0">
        <v-text-field
          v-model="dateFrom"
          label="Date From"
          type="date"
          variant="solo"
          class="rounded-full search-bar max-w-[350px] bg-[#f5f6fa]"
          style="background:#f5f6fa;"
          dense
          clearable
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-text-field
          v-model="dateTo"
          label="Date To"
          type="date"
          variant="solo"
          class="rounded-full search-bar max-w-[350px] bg-[#f5f6fa]"
          style="background:#f5f6fa;"
          dense
          clearable
        />
      </v-col>
    </v-row>
    <!-- Date Presets & Clear Filters -->
    <v-row class="align-center mb-3">
      <v-col cols="12" class="d-flex align-center flex-wrap">
        <v-btn
          v-for="preset in datePresets"
          :key="preset.label"
          text
          color="#ffffff"
          rounded
          class="mr-4 filter-btn"
          :class="{ 'active-btn': isPresetActive(preset) }"
          @click="applyDatePreset(preset)"
        >
          {{ preset.label }}
        </v-btn>
      </v-col>
      <v-col cols="12" class="flex justify-end">
        <v-btn
          color="secondary"
          variant="outlined"
          @click="clearAllFilters"
          class="mr-2 clear-filters-btn w-auto md:w-auto"
        >
          Clear All Filters
        </v-btn>
      </v-col>
    </v-row>
    
    <!-- Table -->
    <v-card title="IPD Records" flat>
      <v-data-table-server
        :headers="headers"
        :items="pagedData"
        :loading="loading"
        class="table grey-head"
        :page.sync="currentPage"
        :items-length="totalRecords"
        :items-per-page="pageSize"
        @update:page="goToPage"
        @update:items-per-page="updatePageSize"
      >
        <template v-if="loading" v-slot:body>
          <tr v-for="n in 6" :key="n">
            <td v-for="header in headers" :key="header.title">
              <v-skeleton-loader type="text"></v-skeleton-loader>
            </td>
          </tr>
        </template>
        <template v-slot:[`item.patientName`]="{ item }">
          <span>{{ item.patientId?.fullName || '-' }}</span>
        </template>
        <template v-slot:[`item.age`]="{ item }">
          <span>{{ item.patientId?.age || '-' }}</span>
        </template>
        <template v-slot:[`item.gender`]="{ item }">
          <span>{{ item.patientId?.gender || '-' }}</span>
        </template>
        <template v-slot:[`item.dateOfAdmission`]="{ item }">
          <span>{{ new Date(item.dateOfAdmission).toLocaleDateString('en-GB') }}</span>
        </template>
        <template v-slot:[`item.procedureName`]="{ item }">
          <v-chip v-if="highlightedProcedures.includes(item.procedureName)" color="primary" dark>
            {{ item.procedureName }}
          </v-chip>
          <span v-else>{{ item.procedureName }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="flex gap-2">
            <v-btn icon @click="$emit('edit-entry', item)" class="action-btn-mobile">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="openSurgicalPlan(item)" class="action-btn-mobile">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>
    <!-- Surgical Plan Dialog -->
    <SurgicalPlanForm
      :dialog="showSurgicalPlanDialog"
      :ipdRecordId="selectedIpdRecordId"
      @close-dialog="showSurgicalPlanDialog = false"
      @plan-saved="handleSurgicalPlanSaved"
    />
  </v-container>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { getAllIPD } from '@/apis/IPD';
import SurgicalPlanForm from './SurgicalPlanForm.vue';
import { createSurgicalPlan } from '@/apis/SurgicalPlan';
import { useUiStore } from '@/store/UiStore'; // <-- import UiStore

export default {
  name: 'IPDDataList',
  components: { SurgicalPlanForm },
  setup() {
    const highlightedProcedures = ['DJ Stent Removal', 'Dressing Removal', 'Sutures Removal'];
    const procedureFilter = ref('');
    const dateFrom = ref('');
    const dateTo = ref('');
    const search = ref('');
    const ipdData = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const pageSizeOptions = [10, 25, 50, 100];

    const headers = [
      { key: 'patientName', title: 'Patient Name' },
      { key: 'age', title: 'Age' },
      { key: 'gender', title: 'Gender' },
      { key: 'dateOfAdmission', title: 'Date of Admission' },
      { key: 'category', title: 'Category' },
      { key: 'operativeStatus', title: 'Operative Status' },
      { key: 'paymentMethod', title: 'Payment Method' },
      { key: 'paymentAmount', title: 'Payment Amount (₹)' },
      { key: 'donationAmount', title: 'Donation Amount (₹)' },
      { key: 'diagnosis', title: 'Diagnosis' },
      { key: 'surgeon', title: 'Surgeon' },
      { key: 'wardRoomNo', title: 'Ward/Room No.' },
      { key: 'notes', title: 'Notes' },
      { key: 'procedureName', title: 'Procedure' },
      { key: 'actions', title: 'Actions', sortable: false },
    ];

    const filterOptions = ['All', ...highlightedProcedures];
    const hasSpecialProcedures = computed(() => ipdData.value.some(item => highlightedProcedures.includes(item.procedureName)));

    const filteredIpdData = computed(() => {
      if (!procedureFilter.value || procedureFilter.value === 'All') return ipdData.value;
      return ipdData.value.filter(item => item.procedureName === procedureFilter.value);
    });

    const dateFilteredData = computed(() => {
      if (!dateFrom.value && !dateTo.value) return filteredIpdData.value;
      return filteredIpdData.value.filter(item => {
        const date = new Date(item.dateOfAdmission);
        const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
        const toDate = dateTo.value ? new Date(dateTo.value) : null;
        if (fromDate && toDate) return date >= fromDate && date <= toDate;
        if (fromDate) return date >= fromDate;
        if (toDate) return date <= toDate;
        return true;
      });
    });

    const validIpdData = computed(() =>
      dateFilteredData.value.filter(item => item.patientId && item.patientId.fullName && item.patientId.fullName.trim() !== '')
    );
    const sortedIpdData = computed(() =>
      [...validIpdData.value].sort((a, b) => new Date(b.dateOfAdmission) - new Date(a.dateOfAdmission))
    );
    const totalPages = computed(() => Math.ceil(sortedIpdData.value.length / pageSize.value) || 1);
    const totalRecords = computed(() => sortedIpdData.value.length);
    const pagedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return sortedIpdData.value.slice(start, end);
    });

    const fetchIPD = async () => {
      loading.value = true;
      const res = await getAllIPD(search.value);
      ipdData.value = res.ipds || res;
      loading.value = false;
    };

    watch([search, currentPage, pageSize], fetchIPD, { immediate: true });

    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
    };

    const updatePageSize = (newSize) => {
      pageSize.value = newSize;
      currentPage.value = 1;
    };

    onMounted(() => {
      fetchIPD();
      window.addEventListener('patient-updated', fetchIPD);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('patient-updated', fetchIPD);
    });

    const datePresets = [
      { label: 'Today', from: () => new Date().toISOString().split('T')[0], to: () => new Date().toISOString().split('T')[0] },
      { label: 'Last 7 days', from: () => new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: () => new Date().toISOString().split('T')[0] },
      { label: 'Last 30 days', from: () => new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], to: () => new Date().toISOString().split('T')[0] },
      { label: 'This month', from: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], to: () => new Date().toISOString().split('T')[0] },
    ];

    const applyDatePreset = (preset) => {
      dateFrom.value = preset.from();
      dateTo.value = preset.to();
    };
    const isPresetActive = (preset) => dateFrom.value === preset.from() && dateTo.value === preset.to();

    const clearAllFilters = () => {
      procedureFilter.value = '';
      dateFrom.value = '';
      dateTo.value = '';
      search.value = '';
    };

    const hasActiveFilters = computed(() =>
      procedureFilter.value !== '' ||
      dateFrom.value ||
      dateTo.value ||
      search.value
    );

    const activeFiltersText = computed(() => {
      const filters = [];
      if (procedureFilter.value && procedureFilter.value !== 'All') filters.push(`Procedure: ${procedureFilter.value}`);
      if (dateFrom.value || dateTo.value) {
        let dateText = 'Date';
        if (dateFrom.value && dateTo.value) dateText += `: ${dateFrom.value} to ${dateTo.value}`;
        else if (dateFrom.value) dateText += `: from ${dateFrom.value}`;
        else if (dateTo.value) dateText += `: until ${dateTo.value}`;
        filters.push(dateText);
      }
      if (search.value) filters.push(`Search: "${search.value}"`);
      return filters.join(', ');
    });

    // Surgical Plan Dialog
    const showSurgicalPlanDialog = ref(false);
    const selectedIpdRecordId = ref(null);
    const openSurgicalPlan = (item) => {
      selectedIpdRecordId.value = item._id || item.id;
      showSurgicalPlanDialog.value = true;
    };
    const uiStore = useUiStore(); // <-- use UiStore
    const handleSurgicalPlanSaved = async (plan) => {
      const payload = {
        ipdRecordId: plan.ipdRecordId,
        surgeryPerformed: plan.surgeryPerformed,
        instrumentsUsed: plan.instrumentsUsed,
        instrumentSettings: plan.settingsOfInstruments,
        implantsUsed: plan.implantsUsed,
        findings: plan.findings,
        specificFinding: plan.specificFinding,
        intraoperativeIssues: plan.intraoperativeIssue,
        postoperativeCare: plan.postopCare,
        postoperativeCourse: plan.postopComplication,
        results: plan.results,
        patientComplaints: plan.patientComplaints,
      };
      try {
        await createSurgicalPlan(payload);
        uiStore.openNotificationMessage('Surgical plan saved successfully!', '', 'success'); // <-- success notification
      } catch (err) {
        uiStore.openNotificationMessage(
          err?.response?.data?.error || err.message || 'Failed to save surgical plan',
          '',
          'error'
        ); // <-- error notification
        console.error('Failed to save surgical plan:', err);
      }
    };

    return {
      headers,
      procedureFilter,
      dateFrom,
      dateTo,
      filterOptions,
      hasSpecialProcedures,
      search,
      loading,
      pagedData,
      highlightedProcedures,
      datePresets,
      applyDatePreset,
      isPresetActive,
      clearAllFilters,
      hasActiveFilters,
      activeFiltersText,
      currentPage,
      pageSize,
      pageSizeOptions,
      updatePageSize,
      totalPages,
      totalRecords,
      goToPage,
      showSurgicalPlanDialog,
      selectedIpdRecordId,
      openSurgicalPlan,
      handleSurgicalPlanSaved,
    };
  },
};
</script>

<style scoped>
.grey-head >>> thead {
  background-color: #f5f6fa;
  font-size: 14px;
}
.grey-head >>> tbody tr td {
  font-size: 14px;
  padding: 8px 12px;
  min-width: 80px;
  word-break: break-word;
}
.action-btn-mobile {
  min-width: 32px;
  height: 32px;
  padding: 0;
}
.chip-group-responsive {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px 8px !important;
  margin-bottom: 8px !important;
}
.procedure-chip-group {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px 8px !important;
  margin-bottom: 8px !important;
}

@media (max-width: 600px) {
  .ipd-list-container {
    padding: 0 2px !important;
  }
  .grey-head >>> thead {
    font-size: 13px !important;
  }
  .grey-head >>> tbody tr td {
    font-size: 13px !important;
    padding: 6px 4px !important;
  }
  .action-btn-mobile {
    min-width: 32px !important;
    height: 32px !important;
    padding: 0 !important;
  }
  .procedure-chip-group {
    gap: 6px 8px !important;
    margin-bottom: 8px !important;
  }
  .filter-btn {
    min-width: 70px !important;
    font-size: 13px !important;
    margin-bottom: 6px !important;
  }
}
</style>