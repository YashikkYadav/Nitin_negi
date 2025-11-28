<template>
  <div class="sidebar">
    <v-navigation-drawer expand-on-hover rail rail-width="50" @mouseover="onHover(true)" @mouseleave="onHover(false)">
      <v-list>
        <!-- Logo -->
        <v-list-item class="logo">
          <v-list-item-content>
            <v-img
              src="../assets/nn_logo.svg"
              alt="Logo"
              style="height: auto;"
              class="ml-0 logo-image my-5"
            />
          </v-list-item-content>
        </v-list-item>

        <!-- Menu Items -->
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          class="custom-list-item"
          :class="itemClasses('/dashboard', Modules.DASHBOARD)"
          @click="handleNav($event, '/dashboard', Modules.DASHBOARD)"
        />
        <v-list-item
          prepend-icon="mdi-file-document"
          title="Invoice"
          value="invoice"
          class="custom-list-item"
          :class="itemClasses('/invoice', Modules.INVOICE)"
          @click="handleNav($event, '/invoice', Modules.INVOICE)"
        />
        <v-list-item
          prepend-icon="mdi-account-group"
          title="Patient Queue"
            value="patientQueue"
          class="custom-list-item"
          :class="itemClasses('/patient-queue', Modules.PATIENT_QUEUE)"
          @click="handleNav($event, '/patient-queue', Modules.PATIENT_QUEUE)"
        />
        <v-list-item
          prepend-icon="mdi-prescription"
          title="Create Rx"
          value="createRx"
          class="custom-list-item"
          :class="itemClasses('/create-rx', Modules.CREATE_RX)"
          @click="handleNav($event, '/create-rx', Modules.CREATE_RX)"
        />
        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="All Patients"
          value="allPatients"
          class="custom-list-item"
          :class="itemClasses('/all-patients', Modules.ALL_PATIENTS)"
          @click="handleNav($event, '/all-patients', Modules.ALL_PATIENTS)"
        />
        <v-list-item
          prepend-icon="mdi-calendar"
          title="Appointments"
          value="appointments"
          class="custom-list-item"
          :class="itemClasses('/appointments', Modules.APPOINTMENTS)"
          @click="handleNav($event, '/appointments', Modules.APPOINTMENTS)"
        />
        <v-list-item
          prepend-icon="mdi-hospital-building"
          title="IPD"
          value="ipd"
          class="custom-list-item"
          :class="itemClasses('/ipd', Modules.IPD)"
          @click="handleNav($event, '/ipd', Modules.IPD)"
        />
        <v-list-item
          prepend-icon="mdi-message"
          title="Messages"
          value="messages"
          class="custom-list-item"
          :class="itemClasses('/messages', Modules.MESSAGES)"
          @click="handleNav($event, '/messages', Modules.MESSAGES)"
        />
        <v-list-item
          prepend-icon="mdi-google-circles-extended"
          title="Social"
          value="social"
          class="custom-list-item"
          :class="itemClasses('/social', Modules.SOCIAL)"
          @click="handleNav($event, '/social', Modules.SOCIAL)"
        />
        <v-list-item
          prepend-icon="mdi-source-branch"
          title="Automation"
          value="automation"
          class="custom-list-item"
          :class="itemClasses('/automation', Modules.AUTOMATION)"
          @click="handleNav($event, '/automation', Modules.AUTOMATION)"
        />

        <!-- More label -->
        <v-list-item disabled class="more-btn-sidebar">
          <v-list-item-content>
            <v-list-item-title>More</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Library Group (only if any submodule allowed) -->
        <v-list-group
          v-if="showLibraryGroup"
          value="library"
          class="sidebar-drawer"
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-library"
              title="Library"
              :class="{
                'disabled-item': !anyLibraryAccess,
              }"
              @click.stop
            />
          </template>

          <v-list-item
            title="Template"
            value="template"
            class="custom-list-item"
            :class="itemClasses('/template-library', Modules.TEMPLATE_LIBRARY)"
            @click="handleNav($event, '/template-library', Modules.TEMPLATE_LIBRARY)"
          />
          <v-list-item
            title="Medicine"
            value="medicine"
            class="custom-list-item"
            :class="itemClasses('/medicine-library', Modules.MEDICINE_LIBRARY)"
            @click="handleNav($event, '/medicine-library', Modules.MEDICINE_LIBRARY)"
          />
            <v-list-item
            title="Dropdown"
            value="dropdown"
            class="custom-list-item"
            :class="itemClasses('/dropdown-library', Modules.DROPDOWN_LIBRARY)"
            @click="handleNav($event, '/dropdown-library', Modules.DROPDOWN_LIBRARY)"
          />
        </v-list-group>

        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="User"
          value="users"
          class="custom-list-item"
          :class="itemClasses('/users', Modules.USERS)"
          @click="handleNav($event, '/users', Modules.USERS)"
        />
        <v-list-item
          prepend-icon="mdi-cogs"
          title="Settings"
          value="settings"
          class="custom-list-item"
          :class="itemClasses('/settings', Modules.SETTINGS)"
          @click="handleNav($event, '/settings', Modules.SETTINGS)"
        />
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { useUserStore } from '@/store/UserStore'
import { useUiStore } from '@/store/UiStore'
import { Modules, AccessLevels, Roles } from '@/constants/permissions.constants'

export default {
  data() {
    return {
      drawer: true,
      rail: false,
      Modules,
      AccessLevels
    }
  },
  computed: {
    activeRoute() {
      return this.$route.path
    },
    userStore() {
      return useUserStore()
    },
    isSuperAdmin() {
      return this.userStore.role === Roles.SUPER_ADMIN
    },
    anyLibraryAccess() {
      return (
        this.hasAccess(Modules.TEMPLATE_LIBRARY) ||
        this.hasAccess(Modules.MEDICINE_LIBRARY) ||
        this.hasAccess(Modules.DROPDOWN_LIBRARY)
      )
    },
    showLibraryGroup() {
      return this.hasAccess(Modules.LIBRARY) || this.anyLibraryAccess
    }
  },
  methods: {
    hasAccess(moduleKey, level = AccessLevels.VIEW) {
      if (this.isSuperAdmin) return true
      return this.userStore.hasAccess(moduleKey, level)
    },
    handleNav(e, path, moduleKey, level = AccessLevels.VIEW) {
      if (!this.isSuperAdmin && !this.hasAccess(moduleKey, level)) {
        useUiStore().openNotificationMessage('Access denied', '', 'error')
        e.preventDefault()
        return
      }
      if (this.$route.path !== path) this.$router.push(path)
    },
    itemClasses(path, moduleKey, level = AccessLevels.VIEW) {
      const lacks = !this.hasAccess(moduleKey, level)
      return {
        'active-item': this.activeRoute === path,
        'disabled-item': !this.isSuperAdmin && lacks
      }
    },
    onHover(state) {
      // ...existing code (hover logic unchanged)...
      if (!state) {
        const items = document.querySelector('.sidebar-drawer .v-list-group__items')
        const moreItem = document.querySelector('.more-btn-sidebar')
        if (items) items.style.display = 'none'
        if (moreItem) moreItem.style.display = 'none'
      } else {
        const items = document.querySelector('.sidebar-drawer .v-list-group__items')
        const moreItem = document.querySelector('.more-btn-sidebar')
        if (
          this.activeRoute === '/template-library' ||
          this.activeRoute === '/medicine-library' ||
          this.activeRoute === '/dropdown-library'
        ) {
          if (items) items.style.display = 'block'
        }
        if (moreItem) moreItem.style.display = 'block'
      }
    }
  }
}
</script>

<style scoped>
.active-item {
  background-color: rgba(0, 123, 255, 0.12);
  color: #1976d2 !important;
}
.disabled-item {
  opacity: 0.45;
}
.disabled-item:hover {
  background: none !important;
  cursor: not-allowed;
}
</style>
