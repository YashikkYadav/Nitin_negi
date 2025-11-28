const Roles = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  BILLING_STAFF: 'billingStaff',
  CUSTOM: 'custom',
  SUPER_ADMIN: 'superAdmin',
};

const Modules = {
  DASHBOARD: 'dashboard',
  APPOINTMENTS: 'appointments',
  INVOICE: 'invoice',
  PATIENT_QUEUE: 'patientQueue',
  CREATE_RX: 'createRx',
  ALL_PATIENTS: 'allPatients',
  IPD: 'ipd',
  MESSAGES: 'messages',
  SOCIAL: 'social',
  AUTOMATION: 'automation',
  LIBRARY: 'library',
  SETTINGS: 'settings',
  CONSULT: 'consult',
  TEMPLATE_LIBRARY: 'templateLibrary',
  MEDICINE_LIBRARY: 'medicineLibrary',
  DROPDOWN_LIBRARY: 'dropdownLibrary',
  USERS: 'users',
  PROFILE: 'profile',
  AUTH: 'auth',
  OTHER: 'other',
};

const AccessLevels = {
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
  FULL: 'full',
};

module.exports = { Roles, Modules, AccessLevels };