<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-card title="Any Implants" flat>
        <v-divider></v-divider>
        <v-data-table
          :headers="implantHeaders"
            :items="implantData"
          class="tablee invoice-table template-table dashboard-table grey-head"
        >
          <template #top>
            <div class="table-filters">
              <a-range-picker
                @change="onRangeChangeImplant"
                :format="['DD/MM/YYYY', 'DD/MM/YY']"
                style="width: fit-content;"
              >
                <template #suffixIcon></template>
              </a-range-picker>
            </div>
            <v-divider></v-divider>
          </template>
          <template v-if="isLoading" v-slot:body>
            <tr v-for="n in 6" :key="n">
              <td v-for="header in headers" :key="header.key">
                <v-skeleton-loader type="text"></v-skeleton-loader>
              </td>
            </tr>
          </template>
          <template v-slot:[`item.name`]="{ item }">
            <span class="cell-name">{{ item.name }}</span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span class="cell-date">{{ formatedDate(item.date) }}</span>
          </template>
        </v-data-table>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card title="Surgery" flat>
        <v-divider></v-divider>
        <v-data-table
          :headers="surgeryHeaders"
          :items="surgeryData"
          class="tablee invoice-table template-table dashboard-table grey-head"
        >
          <template #top>
            <div class="table-filters">
              <a-range-picker
                @change="onRangeChangeSurgery"
                :format="['DD/MM/YYYY', 'DD/MM/YY']"
                style="width: fit-content;"
              >
                <template #suffixIcon></template>
              </a-range-picker>
            </div>
            <v-divider></v-divider>
          </template>
          <template v-if="isLoading" v-slot:body>
            <tr v-for="n in 6" :key="n">
              <td v-for="header in headers" :key="header.key">
                <v-skeleton-loader type="text"></v-skeleton-loader>
              </td>
            </tr>
          </template>
          <template v-slot:[`item.name`]="{ item }">
            <span class="cell-name">{{ item.name }}</span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span class="cell-date">{{ formatedDate(item.date) }}</span>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { checkAuth, getDateFormate } from '@/lib/utils/utils';
import { useDashboardStore } from '@/store/DashboardStore';
import { getAllProcedures } from '@/apis/Procedure';

export default {
  name: "SurgeryTables",
  data() {
    return {
      implantHeaders: [
        { key: "name", title: "Name" },
        { key: "implant", title: "Implant" },
        { key: "phone", title: "Phone No" },
        { key: "date", title: "Date" },
      ],
      surgeryHeaders: [
        { key: "name", title: "Name" },
        { key: "surgery", title: "Surgery" },
        { key: "phone", title: "Phone No" },
        { key: "date", title: "Date" },
      ],
      implantData: [],
      surgeryData: [],
      implantFilter: {
        from: this.getTodayDate(),
        to: this.getTodayDate()
      },
      surgeryFilter: {
        from: this.getTodayDate(),
        to: this.getTodayDate()
      },
      dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY'],
      currentDate: new Date().toISOString().split('T')[0]
    };
  },
  mounted() {
    const auth = checkAuth(this.$router);
    if (auth) {
      this.fetchSurgeryData();
      this.fetchImplantData();
      
      // Listen for procedure data changes
      window.addEventListener('procedure-record-added', this.fetchImplantData);
      window.addEventListener('procedure-record-updated', this.fetchImplantData);
      window.addEventListener('procedure-record-deleted', this.fetchImplantData);
    }
  },
  beforeUnmount() {
    // Remove event listeners
    window.removeEventListener('procedure-record-added', this.fetchImplantData);
    window.removeEventListener('procedure-record-updated', this.fetchImplantData);
    window.removeEventListener('procedure-record-deleted', this.fetchImplantData);
  },
  methods: {
    async fetchSurgeryData() {
      const res = await useDashboardStore().getSurgeryDataApiCall("Surgery", this.currentDate, this.currentDate)

      if (res) {
        this.surgeryData = res.surgery.filter(({ patientId }) => patientId).map(({ patientId, date, name }) => ({
          name: patientId?.fullName,
          phone: patientId?.phoneNumber,
          date: date,
          surgery: name
        }));
      }
    },
    async fetchImplantData() {
      // Updated to use procedure data
      const allProcedures = await getAllProcedures();
      this.implantData = allProcedures
        .filter(p => p.implantOrRemoval === 'Implant')
        .map(p => ({
          name: p.patientName,
          phone: p.phoneNumber,
          date: p.dateOfImplantSutures || p.dateOfRemoval,
          implant: p.implantDetails
        }));
    },
    formatedDate(date) {
      return getDateFormate(date);
    },
    getTodayDate() {
      return new Date().toISOString().split('T')[0];
    },
    async onRangeChangeImplant(date, dateString) {
      // Optionally, you can filter by date here as well
      const allProcedures = await getAllProcedures();
      this.implantData = allProcedures
        .filter(p => p.implantOrRemoval === 'Implant')
        .filter(p => {
          if (!dateString[0] || !dateString[1]) return true;
          const d = new Date(p.dateOfImplantSutures || p.dateOfRemoval);
          return d >= new Date(dateString[0]) && d <= new Date(dateString[1]);
        })
        .map(p => ({
          name: p.patientName,
          phone: p.phoneNumber,
          date: p.dateOfImplantSutures || p.dateOfRemoval,
          implant: p.implantDetails
        }));
    },
    async onRangeChangeSurgery(date, dateString) {
      if (dateString[1]) {
        const res = await useDashboardStore().getSurgeryDataApiCall("Surgery", dateString[0], dateString[1])

        if (res) {
          this.surgeryData = res.surgery.filter(({ patientId }) => patientId).map(({ patientId, date, name }) => ({
            name: patientId?.fullName,
            phone: patientId?.phoneNumber,
            date: date,
            surgery: name
          }));
        }
      }
    },
  },
};
</script>

<style scoped>
/* Re-using IPDDataList responsive table style approach */
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
.cell-name { color: #1f2937; }
.cell-date { color: #3ec972; }

@media (max-width: 960px) {
  .grey-head >>> thead {
    font-size: 13px;
  }
  .grey-head >>> tbody tr td {
    font-size: 13px;
    padding: 6px 8px;
  }
}

@media (max-width: 600px) {
  .grey-head >>> thead {
    font-size: 12.5px !important;
  }
  .grey-head >>> tbody tr td {
    font-size: 12.5px !important;
    padding: 6px 4px !important;
  }
}
</style>