<template>
    <div class="headbar"> 
        <div class="header-bar">
            <v-row justify="end" align="center">
                <v-btn flat icon class="icon-spacing">
                    <v-icon>mdi-bell</v-icon>
                </v-btn>

                <!-- Name: static if no staffId, dynamic if staffId -->
                <span class="user-name" v-if="!hasStaff">Dr. Nitin Negi</span>
                <span class="user-name" v-else>{{ userStore.user?.name || 'User' }}</span>

                <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                        <v-btn flat icon v-bind="props" class="icon-spacing">
                            <v-avatar size="32">
                                <!-- Avatar: static vs dynamic -->
                                <img v-if="!hasStaff" src="../assets/nnnnn.png" alt="Profile" />
                                <img v-else :src="userStore.user?.avatar || defaultAvatar" alt="Profile" />
                            </v-avatar>
                        </v-btn>
                    </template>
                    <v-list>
                      <router-link v-if="!hasStaff" to="/profile" style="text-decoration: none; color: inherit;">
                        <v-list-item>Profile</v-list-item>
                      </router-link>
                        <v-list-item @click="handleLogout">Logout</v-list-item>
                    </v-list>
                </v-menu>
            </v-row>
        </div>
        <div class="custom-border"></div>
    </div>
  </template>

<script>
import { useUiStore } from '@/store/UiStore'
import { useUserStore } from '@/store/UserStore'

export default {
  data() {
    return {
      hasStaff: false,
      defaultAvatar: '../assets/nnnnn.png'
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    }
  },
  created() {
    this.hasStaff = !!localStorage.getItem('staff_id')
    if (this.hasStaff) {
      const store = this.userStore
      if (!store.initialized) {
        // bootstrap is safe even if called multiple times due to guard inside
        store.bootstrap?.()
      }
    }
  },
  methods: {
    handleLogout() {
      const userStore = this.userStore
      userStore.clearUserDetails && userStore.clearUserDetails()
      localStorage.removeItem('doctor_id')
      localStorage.removeItem('access_token')
      localStorage.removeItem('staff_id')
      this.$router.push('/login')
      useUiStore().openNotificationMessage('You Are Successfully Logged Out!')
    },
  },
}
</script>
