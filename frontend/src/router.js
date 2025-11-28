import { createRouter, createWebHistory } from 'vue-router'
import { Modules, AccessLevels, Roles } from './constants/permissions.constants.js'
import { useUserStore } from './store/UserStore.js'
import { useUiStore } from './store/UiStore.js'

import DashBoard from './views/dashboard/DashBoard.vue'
import Invoice from './views/invoice/Invoice.vue'
import AllPatients from './views/allPatients/AllPatients.vue'
import CreateRx from './views/createRx/createRx.vue'
import PatientQueue from './views/patientQueue/patientQueue.vue'
import Appointments from './views/appointments/Appointments.vue'
import Messages from './views/messages/Messages.vue'
import Social from './views/social/Social.vue'
import Automation from './views/automation/Automation.vue'
import TemplateLibrary from './views/templateLibrary/TemplateLibrary.vue'
import MedicineLibrary from './views/medicineLibrary/MedicineLibrary.vue'
import DropdownLibrary from './views/dropdownLibrary/DropdownLibrary.vue'
import Profile from './views/profile/Profile.vue'
import Login from './views/login/Login.vue'
import ViewHistory from './views/viewHistory/ViewHistory.vue'
import Consult from './views/consult/consult.vue'
import Users from './views/users/Users.vue'
import IPD from './views/ipd.vue'
import AccessDenied from './views/AccessDenied.vue'

const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashBoard,
    meta: {
      module: Modules.DASHBOARD,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/invoice',
    name: 'Invoice',
    component: Invoice,
    meta: {
      module: Modules.INVOICE,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/patient-queue',
    name: 'PatientQueue',
    component: PatientQueue,
    meta: {
      module: Modules.PATIENT_QUEUE,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/create-rx',
    name: 'CreateRx',
    component: CreateRx,
    meta: {
      module: Modules.CREATE_RX,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/:patientId/consult',
    name: 'ConsultCard',
    component: Consult,
    meta: {
      module: Modules.CONSULT,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/all-patients',
    name: 'AllPatients',
    component: AllPatients,
    meta: {
      module: Modules.ALL_PATIENTS,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/:patientId/view-history',
    name: 'View History',
    component: ViewHistory,
    meta: {
      module: Modules.ALL_PATIENTS,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: Appointments,
    meta: {
      module: Modules.APPOINTMENTS,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    meta: {
      module: Modules.MESSAGES,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/social',
    name: 'Social',
    component: Social,
    meta: {
      module: Modules.SOCIAL,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/automation',
    name: 'Automation',
    component: Automation,
    meta: {
      module: Modules.AUTOMATION,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/template-library',
    name: 'Template',
    component: TemplateLibrary,
    meta: {
      module: Modules.TEMPLATE_LIBRARY,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/medicine-library',
    name: 'Medicine',
    component: MedicineLibrary,
    meta: {
      module: Modules.MEDICINE_LIBRARY,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/dropdown-library',
    name: 'Dropdown',
    component: DropdownLibrary,
    meta: {
      module: Modules.DROPDOWN_LIBRARY,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {
      module: Modules.USERS,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      module: Modules.PROFILE,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      module: Modules.AUTH,
      accessLevel: AccessLevels.PUBLIC
    }
  },
  {
    path: '/ipd',
    name: 'IPD',
    component: IPD,
    meta: {
      module: Modules.IPD,
      accessLevel: AccessLevels.VIEW
    }
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDenied,
    meta: {
      module: Modules.OTHER,
      accessLevel: AccessLevels.PUBLIC
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/Dashboard',
    meta: {
      module: Modules.OTHER,
      accessLevel: AccessLevels.PUBLIC
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token')
  const userStore = useUserStore()
  const uiStore = useUiStore()

  // Public (login) handling
  if (to.path === '/login') {
    if (isAuthenticated) {
      if (from.path !== '/Dashboard') return next('/Dashboard')
      return next(false)
    }
    return next()
  }

  // Require auth
  if (!isAuthenticated) {
    if (to.path !== '/login') return next('/login')
    return next()
  }

  // Super admin bypass
  if (userStore.role === Roles.SUPER_ADMIN) return next()

  // Access control
  if (to.meta?.module && to.meta?.accessLevel && !userStore.hasAccess(to.meta.module, to.meta.accessLevel)) {

    if (to.path !== '/access-denied') {
      uiStore.openNotificationMessage('Access denied', '', 'error')
      return next('/access-denied')
    }
  }
  if(to.path === '/profile') {
    if ( userStore.role !== Roles.SUPER_ADMIN || !userStore.role !== Roles.ADMIN) {
      uiStore.openNotificationMessage('Access denied', '', 'error')
      return next('/access-denied')
    }
  }
  next()
})

export default router
   