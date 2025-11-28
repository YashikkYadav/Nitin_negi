<template>
  <v-dialog v-model="isDialogOpen" max-width="556px" class="start-consultation">
    <v-card class="popup-card">
      <v-form @submit.prevent ref="form">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{usersData?.user ? 'Edit' : 'Add'}} Role</span>
          <v-icon size="20" @click="$emit('close-dialog')">mdi-close</v-icon>
        </v-card-title>

      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AddUpdateRoleModel",
  props: {
    dialog: Boolean,
    usersData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return { }
  },
  computed: {
    isDialogOpen() {
      return this.dialog;
    },
    appointmentInfo() {
      return this.usersData || {};
    }
  },
  watch: {
    usersData: { }
  },
  methods: { },
};
</script>
