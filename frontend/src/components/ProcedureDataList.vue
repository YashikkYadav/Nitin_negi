<template>
  <v-container fluid class="procedure-list-container sm:px-0 md:px-4">
    <!-- Filters -->
    <v-row class="filter-row flex flex-wrap mt-2">
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
    <!-- Implant/Removal Tabs -->
    <!-- <v-row class="mb-3">
      <v-col cols="12">
        <v-tabs v-model="implantFilter" bg-color="primary" dark>
          <v-tab value="all">All</v-tab>
          <v-tab value="implant">Implant</v-tab>
          <v-tab value="removal">Removal</v-tab>
        </v-tabs>
      </v-col>
    </v-row> -->
    
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
    </v-row>
   
    <v-row>
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
   
    <v-card flat title="OPD Procedure" class="table grey-head">
       <v-tabs v-model="implantFilter" >
          <v-tab value="all">All</v-tab>
          <v-tab value="implant">Implant</v-tab>
          <v-tab value="removal">Removal</v-tab>
        </v-tabs>
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
            <td v-for="header in headers" :key="header.key">
              <v-skeleton-loader type="text"></v-skeleton-loader>
            </td>
          </tr>
        </template>
        <template v-slot:[`item.patientName`]="{ item }">
          <span>{{ patientLookup[item.patientUid] || item.patientName || '-' }}</span>
        </template>
        <template v-slot:[`item.phoneNumber`]="{ item }">
          <span>{{ item.phoneNumber || '-' }}</span>
        </template>
        <template v-slot:[`item.implantOrRemoval`]="{ item }">
          <span>{{ item.implantOrRemoval || '-' }}</span>
        </template>
        <template v-slot:[`item.implantDetails`]="{ item }">
          <span>{{ item.implantDetails || '-' }}</span>
        </template>
        <template v-slot:[`item.dateOfRemoval`]="{ item }">
          <span>{{ item.dateOfRemoval ? new Date(item.dateOfRemoval).toLocaleDateString('en-GB') : '-' }}</span>
        </template>
        <template v-slot:[`item.dateOfImplantSutures`]="{ item }">
          <span>{{ item.dateOfImplantSutures ? new Date(item.dateOfImplantSutures).toLocaleDateString('en-GB') : '-' }}</span>
        </template>
        <template v-slot:[`item.procedureType`]="{ item }">
          <v-chip v-if="item.procedureType" color="primary" size="small">{{ item.procedureType }}</v-chip>
          <span v-else>-</span>
        </template>
        <template v-slot:[`item.stentRemoved`]="{ item }">
          <v-icon v-if="item.stentRemoved === true" color="success">mdi-check-circle</v-icon>
          <v-icon
            v-else-if="item.implantOrRemoval === 'Implant' || item.implantOrRemoval === 'Removal'"
            color="info"
            class="action-btn-mobile"
            style="cursor:pointer;"
            @click="openStentModal(item)"
          >mdi-pencil</v-icon>
        </template>
      </v-data-table-server>
      <!-- Modal for procedure date -->
      <v-dialog v-model="showStentModal" max-width="400px">
        <v-card>
          <v-card-title>Update Procedure Date</v-card-title>
          <v-card-text>
            <p class="mb-3">Set the date for this procedure:</p>
            <v-text-field
              v-model="stentRemovalDate"
              label="Procedure Date"
              type="date"
              required
              :min="minStentRemovalDate"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn text @click="closeStentModal">Cancel</v-btn>
            <v-btn color="primary" @click="submitStentModal">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
     </v-container>
</template>

<script>
// filepath: c:\projects\saaro\frontend\src\components\ProcedureDataList.vue
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { usePatientStore } from '@/store/PatientStore';
import { getAllProcedures } from '@/apis/Procedure';
export default {
  name: 'ProcedureDataList',
  props: {
    procedureData: {
      type: Array,
      required: true
    }
  },
  setup(props, { emit, expose }) {
    const headers = [
      { key: 'patientName', title: 'Patient Name' },
      { key: 'phoneNumber', title: 'Phone Number' },
      { key: 'implantOrRemoval', title: 'Implant/Removal' },
      { key: 'implantDetails', title: 'Details' },
      { key: 'dateOfRemoval', title: 'Date of Removal' },
      { key: 'dateOfImplantSutures', title: 'Date of implant/Sutures' },
      { key: 'procedureType', title: 'Procedure Type' },
      { key: 'stentRemoved', title: 'Stent Removed' },
    ];
    const selectedProcedureType = ref('All');
    const implantFilter = ref('all');
    const dateFrom = ref('');
    const dateTo = ref('');
    const search = ref('');
    const procedureData = ref([]);
    const loading = ref(false);
    const pageSizeOptions = [10, 25, 50, 100];
    const pageSize = ref(10);
    const currentPage = ref(1);

    const procedureTypeOptions = computed(() => {
      const types = props.procedureData.map(item => item.procedureType).filter(Boolean);
      return [...new Set(types)];
    });

    const filteredData = computed(() => {
      let data = props.procedureData;
      
      // Apply implant/removal filter
      if (implantFilter.value !== 'all') {
        data = data.filter(item => {
          const implantOrRemoval = item.implantOrRemoval || '';
          if (implantFilter.value === 'implant') {
            return implantOrRemoval.toLowerCase().includes('implant');
          } else if (implantFilter.value === 'removal') {
            return implantOrRemoval.toLowerCase().includes('removal');
          }
          return true;
        });
      }
      
      if (selectedProcedureType.value && selectedProcedureType.value !== 'All') {
        data = data.filter(item => item.procedureType === selectedProcedureType.value);
      }
      if (dateFrom.value || dateTo.value) {
        data = data.filter(item => {
          const itemDate = item.dateOfRemoval || item.dateOfImplantSutures;
          if (!itemDate) return false;
          const date = new Date(itemDate);
          const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
          const toDate = dateTo.value ? new Date(dateTo.value) : null;
          if (fromDate && toDate) return date >= fromDate && date <= toDate;
          if (fromDate) return date >= fromDate;
          if (toDate) return date <= toDate;
          return true;
        });
      }
      if (search.value) {
        const s = search.value.toLowerCase();
        data = data.filter(item =>
          (item.patientName && item.patientName.toLowerCase().includes(s)) ||
          (item.phoneNumber && item.phoneNumber.toLowerCase().includes(s)) ||
          (item.patientUid && item.patientUid.toLowerCase().includes(s))
        );
      }
      return data;
    });

    const totalRecords = computed(() => filteredData.value.length);
    const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)));
    const pagedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredData.value.slice(start, end);
    });

    watch([search, currentPage, pageSize], () => {
      // No server fetch, just update pagedData
    });

    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value) return;
      currentPage.value = page;
    };

    const updatePageSize = (newSize) => {
      pageSize.value = newSize;
      currentPage.value = 1;
    };

    const fetchProcedures = async () => {
      loading.value = true;
      const res = await getAllProcedures(search.value);
      procedureData.value = res.procedures || res;
      loading.value = false;
    };

    watch([search], fetchProcedures, { immediate: true });
    onMounted(() => {
      fetchProcedures();
      refreshPatientList();
      window.addEventListener('patient-updated', handlePatientUpdated);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('patient-updated', handlePatientUpdated);
    });

    function handlePatientUpdated() {
      fetchProcedures();
      refreshPatientList();
    }

    const clearAllFilters = () => {
      selectedProcedureType.value = 'All';
      implantFilter.value = 'all';
      dateFrom.value = '';
      dateTo.value = '';
      search.value = '';
    };

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

    const hasActiveFilters = computed(() =>
      selectedProcedureType.value !== 'All' ||
      implantFilter.value !== 'all' ||
      dateFrom.value ||
      dateTo.value ||
      search.value
    );

    const activeFiltersText = computed(() => {
      const filters = [];
      if (selectedProcedureType.value !== 'All') filters.push(`Type: ${selectedProcedureType.value}`);
      if (implantFilter.value !== 'all') filters.push(`Implant/Removal: ${implantFilter.value}`);
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

    // Modal state for procedure date
    const showStentModal = ref(false);
    const stentModalItem = ref(null);
    const stentRemovalDate = ref('');
    const minStentRemovalDate = computed(() => {
      if (stentModalItem.value && stentModalItem.value.dateOfImplantSutures) {
        return stentModalItem.value.dateOfImplantSutures.split('T')[0];
      }
      return null;
    });
    const openStentModal = (item) => {
      stentModalItem.value = item;
      // For removal procedures, use the existing dateOfRemoval or current date if not set
      // For implant procedures, use current date
      if (item.implantOrRemoval === 'Removal' && item.dateOfRemoval) {
        stentRemovalDate.value = item.dateOfRemoval.split('T')[0];
      } else {
        stentRemovalDate.value = new Date().toISOString().split('T')[0];
      }
      showStentModal.value = true;
    };
    const closeStentModal = () => {
      showStentModal.value = false;
      stentModalItem.value = null;
      stentRemovalDate.value = '';
    };
    const submitStentModal = () => {
      if (!stentRemovalDate.value) {
        alert('Please select a procedure date');
        return;
      }
      
      // Only check implant date constraint for implant procedures
      if (
        stentModalItem.value &&
        stentModalItem.value.implantOrRemoval === 'Implant' &&
        stentModalItem.value.dateOfImplantSutures &&
        stentRemovalDate.value < stentModalItem.value.dateOfImplantSutures.split('T')[0]
      ) {
        alert('Removal date cannot be before implant date');
        return;
      }
      
      emit('mark-stent-removed', { ...stentModalItem.value, dateOfRemoval: stentRemovalDate.value });
      closeStentModal();
    };

    // Patient name lookup
    const patientLookup = ref({});
    const refreshPatientList = async () => {
      const store = usePatientStore();
      const res = await store.getAllPatientsMasterApiCall(1, 1000, '');
      if (res && res.patients) {
        patientLookup.value = Object.fromEntries(res.patients.map(p => [p.uid, p.fullName]));
      }
    };
    onMounted(refreshPatientList);
    if (typeof expose === 'function') {
      expose({ refreshPatientList });
    }

    // Count by type for chips
    const countByType = (type) => {
      if (type === 'All') return props.procedureData.length;
      return props.procedureData.filter(item => item.procedureType === type).length;
    };

    return {
      headers,
      selectedProcedureType,
      implantFilter,
      dateFrom,
      dateTo,
      procedureTypeOptions,
      filteredData,
      pagedData,
      pageSize,
      pageSizeOptions,
      updatePageSize,
      search,
      loading,
      clearAllFilters,
      hasActiveFilters,
      activeFiltersText,
      datePresets,
      applyDatePreset,
      isPresetActive,
      showStentModal,
      stentModalItem,
      stentRemovalDate,
      openStentModal,
      closeStentModal,
      submitStentModal,
      minStentRemovalDate,
      patientLookup,
      refreshPatientList,
      currentPage,
      totalPages,
      totalRecords,
      goToPage,
    };
  }
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
  .procedure-list-container {
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

