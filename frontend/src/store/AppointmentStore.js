import { defineStore } from 'pinia'
import { AxiosAppointment } from '../apis/Appointment'

export const useAppointmentStore = defineStore('appointmentStore', {
  state: () => ({
    doctorId: localStorage.getItem('doctor_id') || null,
  }),

  actions: {
    async getUpcomingAppointmentApiCall(currentPage, limit) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.UpcomingAppointments(this.doctorId, currentPage, limit)
      return data
    },
    async getPastAppointmentApiCall(currentPage, limit) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.PastAppointments(this.doctorId, currentPage, limit)
      return data
    },
    async getDateViseAppointmentApiCall(fromDate, toDate, currentPage, limit) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.DateViseAppointments(this.doctorId, fromDate, toDate, currentPage, limit)
      return data
    },
    async getAllAppointmentLocationsApiCall() {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.AppointmentLocations(this.doctorId)
      return data
    },
    async getAllAppointmentDatesApiCall(selectedLocation) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.AppointmentDates(this.doctorId, selectedLocation)
      return data
    },
    async getAllAppointmentSlotsApiCall(selectedLocation, selectedDate) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.AppointmentSlots(this.doctorId, selectedLocation, selectedDate)
      return data
    },
    async UpdateAppointmentStatusApiCall(payload) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.appointmentUpdateStatus(payload)
      return data
    },
    async BookAppointmentApiCall(payload) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.appointmentBook(this.doctorId, payload)
      return data
    },
    async CancelAppointmentApiCall(appointmentId) {
      const AppointmentService = new AxiosAppointment()
      const data = await AppointmentService.appointmentCancel(appointmentId)
      return data
    },
  },
})
