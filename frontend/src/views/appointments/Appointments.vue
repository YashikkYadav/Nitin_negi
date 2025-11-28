<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="text-end mb-4 mt-4">
        <v-btn class="saaro-btn" color="#8f6cb4" large @click="addAppointment">
          Add Appointment
        </v-btn>
      </v-col>
    </v-row>
    <v-row>

    </v-row>
    <v-col cols="12" class="d-flex align-center px-0 appointment">
      <v-btn text color="#ffffff" rounded class="mr-4 filter-btn" :class="{ 'active-btn': tab === 'upcoming' }"
        @click="tab = 'upcoming'; activeIndex = null">
        Upcoming
      </v-btn>
      <v-btn text color="#ffffff" rounded class="mr-4 filter-btn" :class="{ 'active-btn': tab === 'past' }"
        @click="tab = 'past'; activeIndex = null">
        Past
      </v-btn>
      <v-btn text color="#ffffff" rounded class="mr-4 filter-btn" :class="{ 'active-btn': tab === 'filtered' }">
        <a-range-picker @change="onRangeChange" :format="['DD/MM/YYYY', 'DD/MM/YY']" :bordered="false"
          style="width: fit-content;">
          <template #suffixIcon></template>
        </a-range-picker>
      </v-btn>
    </v-col>
    <v-row>
      <v-col cols="12">
        <v-card elevation="3" class="appointment-card">
          <div class="v-card-title">Appointments</div>
          <v-card-text class="pa-0">
            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="upcoming">
                <AppointmentList :appointments="upcomingAppointments" @toggle="toggleDetails"
                  :active-index="activeIndex" @rescheduleAppointment="rescheduleAppointment" />
              </v-tabs-window-item>

              <v-tabs-window-item value="past">
                <AppointmentList :appointments="pastAppointments" @toggle="toggleDetails" :active-index="activeIndex" />
              </v-tabs-window-item>

              <v-tabs-window-item value="filtered">
                <div v-if="filterDates.length" class="pa-4 dates">
                  {{ filterDates[0] }} - {{ filterDates[1] }}
                </div>
                <AppointmentList :appointments="dateViseAppointments" @toggle="toggleDetails"
                  :active-index="activeIndex" />
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <appointment-model :dialog="dialog" :appointmentData="appointmentData" @close-dialog="dialog = false"
    @fetch-appointments="fetchUpcomingAppointments" />
</template>

<script>
import dayjs from "dayjs";
import AppointmentList from "./components/AppointmentList.vue";
import AppointmentModel from "./components/AppointmentModel.vue"
import { useAppointmentStore } from "@/store/AppointmentStore";
import { checkAuth } from "@/lib/utils/utils";

export default {
  name: "Appointments",
  components: { AppointmentList, AppointmentModel },
  data() {
    return {
      tab: "upcoming",
      activeIndex: null,
      filterDates: [],
      upcomingAppointments: [],
      pastAppointments: [],
      dateViseAppointments: [],
      dialog: false,
      currentPageNumber: 1,
      limit: 30,
      appointmentData: {}
    };
  },
  computed: {
    filteredAppointments() {
      return this.upcomingAppointments.filter((appointment) => {
        return appointment
      });
    },
  },
  mounted() {
    const auth = checkAuth(this.$router);
    if (auth) {
      this.fetchUpcomingAppointments();
      this.fetchPastAppointments();
    }
  },
  methods: {
    async fetchUpcomingAppointments() {
      const res = await useAppointmentStore().getUpcomingAppointmentApiCall(this.currentPageNumber, this.limit)
      if (res) {
        this.upcomingAppointments = res;
      }
    },
    async fetchPastAppointments() {
      const res = await useAppointmentStore().getPastAppointmentApiCall(this.currentPageNumber, this.limit)
      if (res) {
        this.pastAppointments = res;
      }
    },
    async fetchDateViseAppointments(fromDate, toDate) {
      const res = await useAppointmentStore().getDateViseAppointmentApiCall(fromDate, toDate, this.currentPageNumber, this.limit)
      if (res) {
        this.dateViseAppointments = res;
      }
    },
    toggleDetails(index) {
      this.activeIndex = this.activeIndex === index ? null : index;
    },
    rescheduleAppointment(data) {
      if (data) {
        this.appointmentData = { ...data }; // Ensure deep copy to avoid reactivity issues

        this.$nextTick(() => {
          this.dialog = true;
        });
      } else {
        console.warn("No appointment data provided for rescheduling");
      }
    }
    ,
    onRangeChange(date, dateString) {
      if (dateString[1]) {
        this.tab = "filtered";
        this.activeIndex = null;
        this.filterDates = dateString.map(d => dayjs(d, "DD/MM/YYYY").format("DD MMMM YYYY"));
        const foematedDate = dateString.map(d => dayjs(d, "DD/MM/YYYY").format("YYYY-MM-DD"));

        this.fetchDateViseAppointments(foematedDate[0], foematedDate[1]);
      }
    },
    addAppointment() {
      this.dialog = true;
      this.appointmentData = null;
    },
  },
};
</script>