import axiosAuthenticator from "@/plugins/axios";

export class AxiosAppointment {
    apiClient;
    constructor() {
        this.apiClient = new axiosAuthenticator()
    }

    UpcomingAppointments(doctorId, currentPage, limit) {
        return this.apiClient.get(`/appointment/${doctorId}/get-upcoming-appointments?page=${currentPage}&limit=${limit}`)
    }

    PastAppointments(doctorId, currentPage, limit) {
        return this.apiClient.get(`/appointment/${doctorId}/get-past-appointments?page=${currentPage}&limit=${limit}`)
    }

    DateViseAppointments(doctorId, fromDate, toDate, currentPage, limit) {
        return this.apiClient.get(`/appointment/${doctorId}/get-appointments-by-date-range?from=${fromDate}&to=${toDate}&page=${currentPage}&limit=${limit}`)
    }

    AppointmentLocations(doctorId) {
        return this.apiClient.get(`/appointment/${doctorId}/locations`)
    }

    AppointmentDates(doctorId, selectedLocation) {
        return this.apiClient.get(`/appointment/${doctorId}/${selectedLocation}/dates`)
    }
    
    AppointmentSlots(doctorId, selectedLocation, selectedDate) {
        return this.apiClient.get(`/appointment/${doctorId}/${selectedLocation}/date/${selectedDate}`)
    }

    appointmentUpdateStatus(payload) {
        return this.apiClient.patch(`/appointment/update-status`, payload)
    }

    appointmentBook(doctorId, payload) {
        return this.apiClient.post(`/appointment/${doctorId}/book-appointment`, payload)
    }

    appointmentCancel(appointmentId) {
        return this.apiClient.delete(`/appointment/${appointmentId}`)
    }
}
