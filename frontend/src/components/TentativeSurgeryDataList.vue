<template>
  <v-container fluid class="ipd-list-container sm:px-0 md:px-4">
    <!-- Filters (search + date) -->
    <v-row class="filter-row flex flex-wrap items-center mb-2">
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

      <v-col cols="12" md="4" class="mb-2 md:mb-0">
        <!-- intentionally blank: tabs live in table header -->
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

      <v-col cols="12" md="2" class="mb-2 md:mb-0">
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

    <!-- Data Table Card -->
    <v-card class="grey-head rounded-lg mt-2 table-card">
       <v-card title="Tentative Surgery Records" flat></v-card>
      <!-- Header bar: left = status tabs (above patient name), right = Clear All Filters (sticky) -->
      <div class="table-header-bar">
        <div class="header-left">
          <nav class="status-tabs" role="tablist" aria-label="Status tabs">
            <a
              v-for="option in statusOptions"
              :key="option.value"
              href="#"
              class="status-tab"
              :class="{ 'is-active': statusFilter === option.value }"
              @click.prevent="statusFilter = option.value"
              role="tab"
              :aria-selected="statusFilter === option.value"
            >
              {{ option.title }}
            </a>
            <!-- animated underline element -->
            <span class="tabs-underline" :style="underlineStyle"></span>
          </nav>
        </div>

        <div class="header-right">
          <!-- Always visible clear-all button at top-right of the table -->
          <v-btn
            color="secondary"
            variant="outlined"
            class="clear-all-btn"
            @click="clearAllFilters"
          >
            Clear All Filters
          </v-btn>
        </div>
      </div>
     
      <v-data-table-server
        :headers="headers"
        :items="pagedData"
        :loading="loading"
        class="elevation-1"
        :page="currentPage"
        :items-length="totalRecords"
        :items-per-page="pageSize"
        @update:page="goToPage"
        @update:items-per-page="updatePageSize"
      >
        <template v-slot:[`item.patientName`]="{ item }">
          <span class="cell-name">{{ item.patientId?.fullName || '-' }}</span>
        </template>

        <template v-slot:[`item.phoneNumber`]="{ item }">
          <span>{{ item.patientId?.phoneNumber || '-' }}</span>
        </template>

        <template v-slot:[`item.gender`]="{ item }">
          <span>{{ item.patientId?.gender || '-' }}</span>
        </template>

        <template v-slot:[`item.dateOfSurgery`]="{ item }">
          <span class="cell-date">{{ formatDate(item.dateOfSurgery) }}</span>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip :color="getStatusColor(item.status)" dark small>
            {{ getStatusTitle(item.status) }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <div class="flex gap-2">
            <v-btn icon @click="$emit('edit-entry', item)" class="action-btn-mobile">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { getAllTentativeSurgeries } from '@/apis/TentativeSurgery';

export default {
  name: 'TentativeSurgeryDataList',
  emits: ['edit-entry'],
  setup() {
    const statusOptions = [
      { title: 'All', value: 'all' },
      { title: 'Pending', value: 'pending' },
      { title: 'Completed', value: 'completed' },
      { title: 'Not Seen', value: 'not seen' }
    ];

    const statusFilter = ref('all');
    const dateFrom = ref('');
    const dateTo = ref('');
    const search = ref('');
    const tentativeSurgeryData = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const pageSizeOptions = [10, 25, 50, 100];

    const headers = [
      { key: 'patientName', title: 'Patient Name' },
      { key: 'phoneNumber', title: 'Phone Number' },
      { key: 'gender', title: 'Gender' },
      { key: 'dateOfSurgery', title: 'Date of Surgery' },
      { key: 'status', title: 'Status' },
      { key: 'actions', title: 'Actions', sortable: false },
    ];

    const fetchTentativeSurgeries = async () => {
      loading.value = true;
      try {
        const res = await getAllTentativeSurgeries();
        tentativeSurgeryData.value = res.data || res || [];
        // console.log('Tentative surgeries fetched successfully:', tentativeSurgeryData.value);
      } catch (error) {
        console.error('Error fetching tentative surgeries:', error);
        tentativeSurgeryData.value = [];
      } finally {
        loading.value = false;
      }
    };

    const filteredTentativeSurgeryData = computed(() => {
      if (!statusFilter.value || statusFilter.value === 'all') return tentativeSurgeryData.value;
      return tentativeSurgeryData.value.filter(item => (item.status || '').toString().toLowerCase() === statusFilter.value);
    });

    const dateFilteredData = computed(() => {
      if (!dateFrom.value && !dateTo.value) return filteredTentativeSurgeryData.value;
      return filteredTentativeSurgeryData.value.filter(item => {
        const date = item.dateOfSurgery ? new Date(item.dateOfSurgery) : null;
        const fromDate = dateFrom.value ? new Date(dateFrom.value) : null;
        const toDate = dateTo.value ? new Date(dateTo.value) : null;
        if (!date) return false;
        if (fromDate && toDate) return date >= fromDate && date <= toDate;
        if (fromDate) return date >= fromDate;
        if (toDate) return date <= toDate;
        return true;
      });
    });

    const searchedTentativeSurgeryData = computed(() => {
      if (!search.value) return dateFilteredData.value;
      const searchTerm = search.value.toLowerCase().trim();
      return dateFilteredData.value.filter(item =>
        (item.patientId?.fullName && item.patientId.fullName.toLowerCase().includes(searchTerm)) ||
        (item.patientId?.phoneNumber && item.patientId.phoneNumber.toString().includes(searchTerm)) ||
        (item.patientId?.uid && item.patientId.uid.toLowerCase().includes(searchTerm)) ||
        (item.procedureName && item.procedureName.toLowerCase().includes(searchTerm))
      );
    });
    
    const sortedTentativeSurgeryData = computed(() =>
      [...searchedTentativeSurgeryData.value].sort((a, b) => {
        const da = a.dateOfSurgery ? new Date(a.dateOfSurgery) : new Date(0);
        const db = b.dateOfSurgery ? new Date(b.dateOfSurgery) : new Date(0);
        return db - da;
      })
    );

    // Computed properties for pagination
    const totalRecords = computed(() => sortedTentativeSurgeryData.value.length);
    const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value) || 1);
    const pagedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return sortedTentativeSurgeryData.value.slice(start, end);
    });

    watch(search, () => { currentPage.value = 1; });
    watch([statusFilter, dateFrom, dateTo], () => { currentPage.value = 1; });

    onMounted(() => {
      fetchTentativeSurgeries();
      window.addEventListener('patient-updated', fetchTentativeSurgeries);
      window.addEventListener('tentative-surgery-updated', fetchTentativeSurgeries);
      // initial underline calc
      nextTick(() => updateUnderline());
      window.addEventListener('resize', updateUnderline);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('patient-updated', fetchTentativeSurgeries);
      window.removeEventListener('tentative-surgery-updated', fetchTentativeSurgeries);
      window.removeEventListener('resize', updateUnderline);
    });

    const goToPage = (page) => {
      if (page < 1) { currentPage.value = 1; return; }
      const maxPage = Math.ceil(totalRecords.value / pageSize.value);
      if (page > maxPage) currentPage.value = maxPage || 1;
      else currentPage.value = page;
    };

    const updatePageSize = (newSize) => {
      const currentRecordIndex = (currentPage.value - 1) * pageSize.value;
      pageSize.value = newSize;
      currentPage.value = Math.floor(currentRecordIndex / newSize) + 1;
      const maxPage = Math.ceil(totalRecords.value / newSize);
      if (currentPage.value > maxPage) currentPage.value = maxPage || 1;
    };

    const clearAllFilters = () => {
      statusFilter.value = 'all';
      dateFrom.value = '';
      dateTo.value = '';
      search.value = '';
      nextTick(() => updateUnderline());
    };

    const hasActiveFilters = computed(() =>
      statusFilter.value !== 'all' ||
      dateFrom.value ||
      dateTo.value ||
      search.value
    );

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('en-GB');
    };

    const getStatusColor = (status) => {
      switch ((status || '').toString().toLowerCase()) {
        case 'pending': return 'warning';
        case 'completed': return 'success';
        case 'not seen': return 'error';
        default: return 'grey';
      }
    };

    const getStatusTitle = (statusValue) => {
      if (!statusValue) return '-';
      const found = statusOptions.find(opt => opt.value === statusValue || opt.title.toLowerCase() === statusValue.toString().toLowerCase());
      return found ? found.title : (statusValue.charAt(0).toUpperCase() + statusValue.slice(1));
    };

    // TAB underline logic
    const underlineStyle = ref({ width: '0px', left: '0px' });

    const updateUnderline = () => {
      // find active tab element and set underline style to match
      const tabs = document.querySelectorAll('.status-tab');
      const active = Array.from(tabs).find(t => t.classList.contains('is-active'));
      if (active) {
        const rect = active.getBoundingClientRect();
        const parentRect = active.parentElement.getBoundingClientRect();
        underlineStyle.value = {
          width: `${rect.width}px`,
          left: `${rect.left - parentRect.left}px`
        };
      } else {
        underlineStyle.value = { width: '0px', left: '0px' };
      }
    };

    // react to statusFilter changes
    watch(statusFilter, () => {
      nextTick(() => updateUnderline());
    });

    // also update after DOM changes (data load)
    watch(pagedData, () => {
      nextTick(() => updateUnderline());
    });

    // Watch for component updates to ensure tab underline is correct
    watch(() => tentativeSurgeryData.value, () => {
      nextTick(() => updateUnderline());
    }, { immediate: true });

    return {
      headers,
      statusFilter,
      dateFrom,
      dateTo,
      search,
      loading,
      currentPage,
      pageSize,
      pageSizeOptions,
      statusOptions,
      tentativeSurgeryData,
      pagedData,
      totalPages,
      totalRecords,
      goToPage,
      updatePageSize,
      formatDate,
      getStatusColor,
      getStatusTitle,
      clearAllFilters,
      hasActiveFilters,
      underlineStyle
    };
  }
};
</script>

<style scoped>
/* base header/body */
.grey-head >>> thead {
  background-color: #f5f6fa;
  font-size: 14px;
}
.grey-head >>> tbody tr td {
  font-size: 14px;
  padding: 10px 14px;
  min-width: 80px;
  word-break: break-word;
}

/* table header bar */
.table-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 3;
}

/* NAV tabs container */
.status-tabs {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding-left: 8px; /* aligns visually with table */
  user-select: none;
}

/* each tab looks like text (no button appearance) */
.status-tab {
  display: inline-block;
  text-decoration: none;
  color: rgba(17,24,39,0.9);
  /* font-weight: 600; */
  padding: 6px 0;
  cursor: pointer;
  transition: color .12s ease;
  position: relative;
  font-size: 14px;
}

/* active tab: different color */
.status-tab.is-active {
  color: var(--v-theme-primary);
  border-bottom: 1px solid black;
  font-weight: 600;
}
/* subtle hover */
.status-tab:hover {
  color: var(--v-theme-primary);
}

/* animated underline element */
.tabs-underline {
  position: absolute;
  bottom: -2px; /* sits just under the tabs */
  height: 4px;
  background: var(--v-theme-primary);
  border-radius: 4px;
  transition: left .18s cubic-bezier(.2,.9,.3,1), width .18s cubic-bezier(.2,.9,.3,1);
  will-change: left, width;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
/* Clear All Filters button */
.clear-all-btn {
  white-space: nowrap;
  height: 36px;
}

/* custom cell classes */
.cell-name { color: #111827; }
.cell-date { color: #0f9d58; }

/* action button */
.action-btn-mobile {
  min-width: 32px;
  height: 32px;
  padding: 0;
}

/* responsive tweaks */
@media (max-width: 960px) {
  .grey-head >>> thead { font-size: 13px; }
  .grey-head >>> tbody tr td { font-size: 13px; padding: 8px 10px; }
  .status-tabs { gap: 12px; padding-left: 6px; }
  .status-tab { font-size: 13px; }
  .table-header-bar { padding: 8px 12px; }
}

@media (max-width: 600px) {
  .ipd-list-container { padding: 0 6px !important; }
  .grey-head >>> thead { font-size: 12.5px !important; }
  .grey-head >>> tbody tr td { font-size: 12.5px !important; padding: 6px 6px !important; }
  .status-tab { font-size: 12px; }
  .clear-all-btn { height: 34px; font-size: 13px; }
}
</style>