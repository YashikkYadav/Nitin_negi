<template>
    <div v-if="appointments?.appointments?.length > 0">
        <div v-for="(appointment, index) in appointments?.appointments" :key="index">
            <div>
                <div :class="['appointment-date', 'pa-4', { 'bt-0': index === 0 }]">
                    <h3>{{ formatedDate(appointment.date) }}</h3>
                </div>
                <div class="appointment-details" @click="$emit('toggle', index)">
                    <div class="detail">
                        <div class="appointment-circle"></div>
                        <div class="appointment-slots">{{ appointment.time }}</div>
                        <div>
                            <h3>{{ appointment.patientId.fullName }}</h3>
                        </div>
                    </div>
                    <div class="details">
                        <v-icon size="35"
                            :style="{ transform: activeIndex === index ? 'rotate(90deg)' : 'rotate(0deg)' }">mdi-menu-right</v-icon>
                        Details
                    </div>
                </div>
                <div class="px-4 extra-details" v-if="activeIndex === index">
                    <div>
                        <h4>Phone Number</h4>
                        <p>{{ appointment.patientId.phoneNumber ?? "-" }}</p>
                    </div>
                    <div>
                        <h4>Location</h4>
                        <p>{{ appointment.location }}</p>
                        <div class="mt-4" v-if="new Date(appointment.date) > new Date()">
                            <v-btn variant="text" color="#008000" @click="$emit('rescheduleAppointment', appointment)">Reschedule </v-btn>
                            <v-btn variant="text" color="#CD1C18" @click="deleteDialogHandle(appointment._id)">Cancel</v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="reached-list pa-4">
            <p>You've reached the end of the list</p>
        </div>
    </div>
    <div class="no-appointments" v-else>
        <img src="../../../assets/no_appointments.svg" />
        <h2>No Appointments</h2>
    </div>

    <common-model :commonModel="isDeleteModalOpen" @close-dialog="isDeleteModalOpen = false"
        @actions="onDeleteAppointment" title="Cancel Appointment"
        description="Are you sure you want to cancel appointment?" />
</template>

<script>
import CommonModel from '@/components/CommonModel.vue';
import { getDateFormateForAppointment } from '@/lib/utils/utils';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useUiStore } from '@/store/UiStore';

export default {
    name: "AppointmentList",
    props: {
        appointments: Array,
        activeIndex: Number,
    },
    components: {
        CommonModel
    },
    data() {
        return {
            isDeleteModalOpen: false,
            appointmentId: "",
        };
    },
    methods: {
        formatedDate(date) {
            return getDateFormateForAppointment(date);
        },

        async onDeleteAppointment() {
            const res = await useAppointmentStore().CancelAppointmentApiCall(this.appointmentId)

            this.isDeleteModalOpen = false;
            this.appointmentId = ""
            this.$emit('fetch-appointments');
            useUiStore().openNotificationMessage("Appointment Cancelled Successfully!");
        },

        deleteDialogHandle(id) {
            this.isDeleteModalOpen = true;
            this.appointmentId = id
        },
    }
};
</script>