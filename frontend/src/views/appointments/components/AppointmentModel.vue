<template>
  <v-dialog v-model="isDialogOpen" max-width="556px" class="start-consultation">
    <v-card class="popup-card">
      <v-form @submit.prevent ref="form">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{appointmentData?._id ? 'Reschedule' : 'Book'}} Appointment {{ appointmentData?.patientId?.fullName && `- ${appointmentData?.patientId?.fullName}` }}</span>
          <v-icon size="20" @click="$emit('close-dialog')">mdi-close</v-icon>
        </v-card-title>
        <div class="py-5">
          <div>
            <div v-if="!isOTPGenerated">
              <div class="bottom-form">
                <div class="px-5">
                  <v-label class="label-title">Name</v-label>
                  <v-text-field v-model="form.name" label="Name" variant="outlined" :rules="[rules.required]">
                  </v-text-field>
                </div>
                <div class="px-5">
                  <v-label class="label-title">Contact Number</v-label>
                  <v-text-field v-model="form.contactNumber" label="Contact Number" variant="outlined"
                    :rules="[rules.required]">
                  </v-text-field>
                </div>
                <div class="px-5">
                  <v-label class="label-title">Select Type</v-label>
                  <v-select v-model="form.selectType" :items="['Online', 'Offline']" label="Select Type"
                    variant="outlined" :rules="[rules.required]">
                  </v-select>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="px-5 mb-5"> <button class="back-btn" @click="proceed = false" v-if="proceed"><v-icon
                    size="20">mdi-arrow-left</v-icon>Back</button></div>
              <div class="px-5 mb-5">
                <div v-if="!proceed" class="selected-location">
                  <v-label class="label-title">Location</v-label>
                  <v-select v-model="location" :items="locationData" item-value="_id" item-title="address"
                    label="Select Location" variant="outlined" dense @change="onSelectLocation">
                  </v-select>
                  <div class="error" v-if="locationError">Location is required.</div>
                </div>
                <div v-else>
                  <v-label class="label-title">Selected location</v-label>
                  <div class="all-dates mb-5">
                    <v-btn class="active">{{ selectedLocationName }}</v-btn>
                  </div>
                </div>
              </div>
              <div class="px-5 mb-5" v-if="location">
                <div v-if="!proceed">
                  <v-label class="label-title">Select time</v-label>
                  <div class="all-dates">
                    <v-btn v-for="(item, index) in AvilabeleDates" :key="index"
                      :class="{ active: selectedDate === item }" @click="selectDate(item)">{{ formatDate(item)
                      }}</v-btn>
                  </div>
                  <div class="error" v-if="timeError">Time is required.</div>
                </div>
                <div v-else>
                  <v-label class="label-title">Selected time</v-label>
                  <div class="all-dates">
                    <v-btn class="active">{{ formatDate(selectedDate) }}</v-btn>
                  </div>
                </div>
              </div>
              <div class="px-5" v-if="selectedDate">
                <div v-if="!proceed">
                  <v-label class="label-title">Slots</v-label>
                  <div class="all-slots">
                    <v-btn v-for="(item, index) in AvilabeleSlots" :key="index"
                      :class="{ active: selectedSlot === item }" @click="selectSlot(item)">{{ item }}</v-btn>
                  </div>
                  <div class="error" v-if="slotError">Slot is required.</div>
                  <div class="error" v-if="noSlotError">No slots avilabele.</div>
                </div>
                <div v-else>
                  <v-label class="label-title">Selected Slot</v-label>
                  <div class="all-slots">
                    <v-btn class="active">{{ selectedSlot }}</v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>

          </div>
          <div class="footer">
            <button class="saaro-btn" @click="generateOTP" v-if="!isOTPGenerated">Select Location</button>
            <button class="saaro-btn" @click="proceedWithData" v-else-if="!proceed">Proceed</button>
            <button class="saaro-btn" @click="confirmAndBook" v-else-if="proceed">Confirm & Book</button>
          </div>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { checkAuth } from '@/lib/utils/utils';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useUiStore } from '@/store/UiStore';

export default {
  name: "AppointmentModel",
  props: {
    dialog: Boolean,
    appointmentData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      proceed: false,
      isOTPGenerated: false,
      locationData: [],
      form: {
        selectType: null,
        name: "",
        contactNumber: ""
      },
      rules: {
        required: (value) => !!value || "Location is required.",
      },
      AvilabeleDates: [],
      AvilabeleSlots: [],
      location: null,
      selectedLocationName: "",
      selectedDate: null,
      selectedSlot: null,
      locationError: false,
      timeError: false,
      slotError: false,
      noSlotError: false,
      selectType: null,
      contactNumber: "",
      name: "",
      noDatesError: "",
      isOTP: false,
      inputOTP: "",
      otpError: false,
    }
  },
  computed: {
    isDialogOpen() {
      return this.dialog;
    },
    appointmentInfo() {
      return this.appointmentData || {};
    }
  },
  watch: {
    appointmentData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.initializeAppointmentData();
          this.isOTPGenerated = true;
          this.proceed = false;
        }else{
          this.isOTPGenerated = false;
          this.proceed = false;
          this.form = {};
          this.selectedDate = null;
          this.selectedSlot = null;
          this.location = null;
        }
      },
      deep: true,
      immediate: true
    },
    location(newValue) {
      if (newValue) {
        this.selectedLocationName = this.locationData.find(item => item._id === newValue)?.address || '';
        this.AvilabeleSlots = [];
        this.onSelectLocation(newValue);
      }
    },
    selectedDate(newValue) {
      if (newValue) {
        this.onSelectDate(newValue);
      }
    }
  },
  mounted() {
    const auth = checkAuth(this.$router);
    if (auth) {
      this.fetchLocationData();
    }
  },
  methods: {
    async initializeAppointmentData() {
      if (this.appointmentData?.location) {
        const selectedLocation = this.locationData.find(
          (loc) => loc.address === this.appointmentData.location
        );

        if (selectedLocation) {
          this.location = selectedLocation._id;

          if (this.appointmentData.date) {
            this.selectedDate = this.appointmentData.date.split("T")[0];
            this.isOTPGenerated = true;
            this.selectedSlot = this.appointmentData.time;
            this.form.selectType = this.appointmentData.type;
            this.form.contactNumber = this.appointmentData.patientId?.phoneNumber;
            this.form.name = this.appointmentData.type.patientId?.fullName;
          }
        }
      }
    },
    async fetchLocationData() {
      const res = await useAppointmentStore().getAllAppointmentLocationsApiCall()

      if (res) {
        this.locationData = res.locations
      }
    },
    async onSelectLocation(selectedLocation) {
      const res = await useAppointmentStore().getAllAppointmentDatesApiCall(selectedLocation)

      if (res) {
        this.AvilabeleDates = res.dates
      }
    },
    async onSelectDate(selectedDate) {
      const res = await useAppointmentStore().getAllAppointmentSlotsApiCall(this.location, selectedDate)

      if (res) {
        this.AvilabeleSlots = res.timeSlots
        this.selectedSlot = null
        if (this.AvilabeleSlots.length > 0) {
          this.noSlotError = false
        } else {
          this.noSlotError = true
        }
      }
    },
    async confirmAndBook() {
      const requestData = {
        phoneNumber: this.form.contactNumber,
        date: this.selectedDate,
        time: this.selectedSlot,
        type: this.form.selectType,
        location: this.selectedLocationName,
        name: this.form.name
      }

      const res = await useAppointmentStore().BookAppointmentApiCall(requestData)

      if (res) {
        this.$emit('close-dialog');
        this.$emit('fetch-appointments');
        useUiStore().openNotificationMessage("Appointment Booked Succesfully!")
      }
    },
    selectDate(index) {
      this.selectedDate = index;
      this.timeError = false
    },
    selectSlot(index) {
      this.selectedSlot = index;
      this.slotError = false
    },
    async proceedWithData() {
      if (this.location === null) {
        this.locationError = true
        return
      }
      if (this.selectedDate === null) {
        this.locationError = false
        this.timeError = true
        return
      }
      if (this.selectedSlot === null) {
        this.timeError = false
        this.slotError = true
        return
      }
      if (this.location !== null && this.selectedSlot !== null && this.selectedDate !== null) {
        this.proceed = true
      }
    },
    async generateOTP() {
      const { valid } = await this.$refs.form.validate()
      if (valid) {
        this.isOTPGenerated = true;
      }
    },
    formatDate(date) {
      if (!date) return "Invalid Date"; // Handle empty values
      let d = new Date(date);
      if (isNaN(d.getTime())) return "Invalid Date"; // Handle invalid dates
      return new Intl.DateTimeFormat('en-GB').format(d); // Formats to DD-MM-YYYY
    },
  },
};
</script>
