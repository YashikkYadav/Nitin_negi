<template>
  <v-container fluid>
    <v-row class="pa-4 pa-md-8" style="min-height: 100vh;">
      <!-- Left: User Form -->
      <v-col
        cols="12"
        md="7"
        class="d-flex align-center"
        style="padding-bottom: 0;"
      >
        <v-card
          class="pa-4 pa-md-8 w-100"
          elevation="2"
          style="min-height: 100%;"
        >
          <h2 class="text-h5 text-md-h4 mb-4 mb-md-6 font-weight-bold">User Roles and Permissions</h2>
          <v-row dense>
            <v-col cols="12" md="6" class="mb-3 mb-md-4">
              <v-text-field
                label="Name"
                v-model="selectedUser.name"
                :error="errors.name"
                @input="errors.name = false"
                variant="outlined"
                dense
                class="mb-0 responsive-input"
              />
            </v-col>
            <v-col cols="12" md="6" class="mb-3 mb-md-4">
              <v-text-field
                label="Email"
                v-model="selectedUser.email"
                :error="errors.email"
                @input="errors.email = false"
                variant="outlined"
                dense
                class="mb-0 responsive-input"
              />
            </v-col>
            <v-col cols="12" md="6" class="mb-3 mb-md-4">
              <v-select
                label="Role"
                :items="roles"
                v-model="selectedUser.role"
                variant="outlined"
                dense
                class="mb-0 responsive-input"
              />
            </v-col>
            <v-col cols="12" md="6" class="mb-3 mb-md-4">
              <v-text-field
                label="Password"
                v-model="selectedUser.password"
                :placeholder="selectedUser._id || selectedUser.id ? 'Leave blank to not change password' : 'Default: changeme123'"
                variant="outlined"
                dense
                class="mb-0 responsive-input"
                type="text"
                autocomplete="new-password"
              />
            </v-col>
          </v-row>
          <div class="d-flex justify-end mb-4 mb-md-6">
            <v-btn
              class="saaro-btn px-6 py-2 responsive-btn"
              @click="handleAddNewUser"
              block="$vuetify.display.xs"
            >
              + Add New User
            </v-btn>
          </div>
          <h3 class="text-subtitle-1 text-md-h6 mb-2 mb-md-3 font-weight-medium">Section Access Control</h3>
          <v-row dense>
            <v-col
              cols="12"
              md="6"
              v-for="(level, section) in selectedUser.permissions"
              :key="section"
              class="mb-2"
            >
              <div class="d-flex align-center flex-wrap">
                <v-checkbox
                  :label="formatSection(section)"
                  :model-value="level !== 'none'"
                  @update:model-value="checked => handlePermissionCheckboxChangeManual(section, checked)"
                  class="mr-2 responsive-checkbox"
                  dense
                  hide-details
                  style="min-width: 120px;"
                />
                
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <!-- Spacer for mobile -->
      <v-col
        class="d-block d-md-none"
        cols="12"
        style="min-height: 12px;"
      ></v-col>
      <!-- Right: User List -->
      <v-col
        cols="12"
        md="5"
        class="d-flex align-center mt-4 mt-md-0"
        style="min-height: 100%;"
      >
        <v-card class="pa-4 pa-md-6 w-100" elevation="2" style="height: 100%;">
          <v-row class="mb-2">
            <v-col cols="12">
              <v-text-field
                v-model="searchQuery"
                label="Search Users"
                append-inner-icon="mdi-magnify"
                variant="outlined"
                class="search-bar responsive-input"
                dense
                clearable
              />
            </v-col>
          </v-row>
          <v-list class="mt-2" style="max-height: 60vh; overflow-y: auto;">
            <v-list-item
              v-for="user in filteredUsers"
              :key="user._id || user.id"
              :class="{
                'bg-grey-lighten-3': isSelected(user),
                'user-list-mobile': true
              }"
              class="mb-3 rounded"
              style="transition: background 0.2s; padding: 18px 14px;"
              @click="handleSelectUser(user)"
            >
              <div class="d-flex align-center w-100 flex-wrap flex-md-nowrap user-profile-row">
                <v-avatar
                  :size="$vuetify.display.xs ? 36 : ($vuetify.display.sm ? 44 : 56)"
                  class="mr-3 mr-md-4 elevation-2 mb-2 mb-md-0 user-avatar"
                >
                  <img :src="user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'" alt="avatar" style="object-fit: cover;" />
                </v-avatar>
                <div class="flex-grow-1 user-profile-info">
                  <div class="font-weight-bold text-body-1 user-profile-name mb-1">{{ user.name }}</div>
                  <div class="text-caption text-grey-darken-1 user-profile-email mb-1">{{ user.email }}</div>
                  <div class="text-caption font-italic text-grey-darken-2 user-profile-role">{{ user.role }}</div>
                </div>
                <v-btn icon @click.stop="handleDeleteUser(user._id || user.id)" class="ml-2 user-profile-delete responsive-btn">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-list-item>
            <div v-if="filteredUsers.length === 0" class="text-center text-grey mt-6">
              No users found.
            </div>
          </v-list>
          <div class="d-flex flex-column justify-end mt-6">
             <v-btn
              class="mb-2 mr-md-3 px-5 responsive-btn"
              @click="resetForm"
              :block="$vuetify.display.xs"
              
            >
              Cancel
            </v-btn>
            <v-btn class="saaro-btn px-6 responsive-btn" @click="handleSave" :disabled="!selectedUser" block="$vuetify.display.xs">Save & Apply</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- Credentials Modal -->
    <v-dialog v-model="showCredentials" max-width="95vw" width="400">
      <v-card class="pa-4 pa-md-6" style="border-radius: 18px;">
        <v-card-title class="text-h6 text-md-h5 font-weight-bold pb-2 pt-0">User Created Successfully!</v-card-title>
        <v-divider class="mb-4"></v-divider>
        <v-card-text class="pb-0">
          <div class="mb-4">
            <div class="mb-3 d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-account</v-icon>
              <span class="font-weight-medium responsive-label" style="min-width: 80px;">Name:</span>
              <span class="ml-2 responsive-value">{{ newUserCredentials?.name }}</span>
            </div>
            <div class="mb-3 d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-email</v-icon>
              <span class="font-weight-medium responsive-label" style="min-width: 80px;">Email:</span>
              <span class="ml-2 responsive-value">{{ newUserCredentials?.email }}</span>
            </div>
            <div class="mb-3 d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-lock</v-icon>
              <span class="font-weight-medium responsive-label" style="min-width: 80px;">Password:</span>
              <span class="ml-2 font-mono px-2 py-1 rounded responsive-value" style="background: #f5f6fa;">{{ newUserCredentials?.password }}</span>
            </div>
            <v-alert type="warning" class="mt-4" border="start" colored-border>
              <strong>Important:</strong> Please share these credentials with the user.<br>
              They can change their password after first login.
            </v-alert>
          </div>
        </v-card-text>
        <v-divider class="my-2"></v-divider>
        <v-card-actions class="pt-2 pb-0 d-flex justify-end">
          <v-btn class="saaro-btn px-5 responsive-btn" @click="closeCredentialsModal" block="$vuetify.display.xs">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Loading v-if="loading" />
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, inject, watch, onMounted } from "vue";
import { defaultRolePermissions } from "@/data/rolePermissions";
import { getUsers, createUser, updateUser, deleteUser } from "@/apis/User";
import { useUiStore } from "@/store/UiStore"; // <-- use UiStore for notifications


const emptyUserTemplate = {
  name: "",
  email: "",
  role: "custom",
  permissions: {
    dashboard: "none",
    appointments: "none",
    invoice: "none",
    patientQueue: "none",
    createRx: "none",
    allPatients: "none",
    ipd: "none",
    messages: "none",
    social: "none",
    automation: "none",
    library: "none",
    settings: "none",
    consult: "none",
    templateLibrary: "none",
    medicineLibrary: "none",
    dropdownLibrary: "none",
    users: "none",
    profile: "none",
    auth: "none",
    other: "none"
  },
  avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
  password: "changeme123"
};

const roles = [
  { value: "doctor", title: "Doctor" },
  { value: "receptionist", title: "Receptionist" },
  { value: "billingStaff", title: "Billing Staff" },
  { value: "admin", title: "Admin" },
  { value: "custom", title: "Custom" }
];
const permissionLevels = [
  { value: "view", title: "View" },
  { value: "edit", title: "Edit" },
  { value: "full", title: "Full" }
];

const users = ref([]);
const selectedUser = reactive({ ...emptyUserTemplate });
const uiStore = useUiStore(); // <-- initialize UiStore

watch(
  () => selectedUser.role,
  (newRole) => {
    if (newRole && defaultRolePermissions[newRole]) {
      selectedUser.permissions = { ...defaultRolePermissions[newRole] };
    }
  }
);

const searchQuery = ref("");
const errors = reactive({ name: false, email: false });
const loading = ref(false);
const error = ref("");
const showCredentials = ref(false);
const newUserCredentials = ref(null);

const filteredUsers = computed(() =>
  users.value.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

async function fetchUsers() {
  loading.value = true;
  error.value = "";
  try {
    const res = await getUsers();
    users.value = Array.isArray(res) ? res : [];
    console.log(users.value);
  } catch (e) {
    error.value = "Failed to load users.";
    users.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUsers);

function handleSelectUser(user) {
  Object.assign(selectedUser, emptyUserTemplate, user);
  // Set password field blank for update
  selectedUser.password = "";
  errors.name = false;
  errors.email = false;
  showCredentials.value = false;
  newUserCredentials.value = null;
}

function handlePermissionCheckboxChangeManual(section, checked) {
  selectedUser.permissions[section] = checked ? "view" : "none";
}

async function handleAddNewUser() {
  errors.name = !selectedUser.name.trim();
  errors.email = !selectedUser.email.trim();
  if (errors.name || errors.email) return;
  loading.value = true;
  error.value = "";
  try {
    const userData = {
      name: selectedUser.name.trim(),
      email: selectedUser.email.trim(),
      password: selectedUser.password || "changeme123",
      role: selectedUser.role,
      permissions: { ...selectedUser.permissions },
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
    };
    const res = await createUser(userData);
    newUserCredentials.value = {
      name: res.data?.name || userData.name,
      email: res.data?.email || userData.email,
      password: userData.password,
    };
    showCredentials.value = true;
    await fetchUsers();
    Object.assign(selectedUser, emptyUserTemplate);
    errors.name = false;
    errors.email = false;
    uiStore.openNotificationMessage("User created successfully.", "", "success"); // <-- notification
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to add user.";
    uiStore.openNotificationMessage(error.value, "", "error"); // <-- notification
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  if (!selectedUser.id && !selectedUser._id) return;
  loading.value = true;
  error.value = "";
  try {
    const userId = selectedUser._id || selectedUser.id;
    const updateData = { ...selectedUser };
    delete updateData.id;
    delete updateData._id;
    if (!updateData.password) {
      delete updateData.password;
    }
    await updateUser(userId, updateData);
    await fetchUsers();
    uiStore.openNotificationMessage("User updated successfully.", "", "success"); // <-- notification
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to update user.";
    uiStore.openNotificationMessage(error.value, "", "error"); // <-- notification
  } finally {
    loading.value = false;
  }
}

async function handleDeleteUser(userId) {
  loading.value = true;
  error.value = "";
  try {
    await deleteUser(userId);
    await fetchUsers();
    if (selectedUser._id === userId || selectedUser.id === userId) {
      Object.assign(selectedUser, emptyUserTemplate);
      errors.name = false;
      errors.email = false;
    }
    uiStore.openNotificationMessage("User deleted successfully.", "", "success"); // <-- notification
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to delete user.";
    uiStore.openNotificationMessage(error.value, "", "error"); // <-- notification
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(selectedUser, emptyUserTemplate);
  errors.name = false;
  errors.email = false;
  showCredentials.value = false;
  newUserCredentials.value = null;
}

function closeCredentialsModal() {
  showCredentials.value = false;
  newUserCredentials.value = null;
}

function isSelected(user) {
  return selectedUser.id === user.id || selectedUser._id === user._id;
}

function formatSection(section) {
  return section.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
</script>

<script>
export default {
  components: {
    Loading: {
      template: `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 120px;">
          <span style="font-size: 1.2em; color: #8f6cb4;">
            <svg style="vertical-align: middle;" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#8f6cb4" stroke-width="4" stroke-linecap="round" stroke-dasharray="60" stroke-dashoffset="20">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 12 12" to="360 12 12"/>
              </circle>
            </svg>
            Loading...
          </span>
        </div>
      `
    }
  }
}
</script>

<style scoped>
.responsive-input {
  font-size: 1rem;
}
.responsive-btn {
  font-size: 1rem;
  min-height: 38px;
}
.responsive-label {
  font-size: 1rem;
}
.responsive-value {
  font-size: 1rem;
}

@media (max-width: 960px) {
  .pa-md-8 {
    padding: 16px !important;
  }
  .pa-md-6 {
    padding: 12px !important;
  }
  .mb-md-6 {
    margin-bottom: 16px !important;
  }
  .mb-md-4 {
    margin-bottom: 12px !important;
  }
  .mb-md-3 {
    margin-bottom: 8px !important;
  }
  .mt-md-0 {
    margin-top: 0 !important;
  }
  .mr-md-4 {
    margin-right: 12px !important;
  }
  .flex-md-nowrap {
    flex-wrap: wrap !important;
  }
  .user-profile-row {
    flex-direction: row !important;
    align-items: flex-start !important;
    gap: 8px;
  }
  .user-avatar {
    min-width: 40px !important;
    min-height: 40px !important;
    max-width: 40px !important;
    max-height: 40px !important;
  }
  .user-profile-info {
    min-width: 0;
    flex: 1 1 60%;
    margin-right: 8px;
  }
  .user-profile-name,
  .user-profile-email,
  .user-profile-role {
    font-size: 0.95em !important;
    word-break: break-word;
  }
  .user-profile-delete {
    margin-left: 0 !important;
    margin-top: 4px;
  }
  .user-list-mobile {
    margin-bottom: 10px !important;
    padding: 12px 8px !important;
  }
  .responsive-input {
    font-size: 0.98rem !important;
    min-height: 36px !important;
  }
  .responsive-btn {
    font-size: 0.98rem !important;
    min-height: 36px !important;
    padding: 8px 12px !important;
  }
  .responsive-label, .responsive-value {
    font-size: 0.97rem !important;
  }
  .user-profile-name,
  .user-profile-email,
  .user-profile-role {
    font-size: 0.93em !important;
  }
}

@media (max-width: 600px) {
  .pa-4 {
    padding: 8px !important;
  }
  .mb-4 {
    margin-bottom: 8px !important;
  }
  .search-bar {
    border-radius: 24px !important;
  }
  .user-avatar {
    min-width: 32px !important;
    min-height: 32px !important;
    max-width: 32px !important;
    max-height: 32px !important;
  }
  .user-profile-row {
    gap: 4px;
  }
  .user-list-mobile {
    margin-bottom: 8px !important;
    padding: 10px 4px !important;
  }
  .responsive-input {
    font-size: 0.95rem !important;
    min-height: 32px !important;
  }
  .responsive-btn {
    font-size: 0.95rem !important;
    min-height: 32px !important;
    padding: 6px 8px !important;
  }
  .responsive-label, .responsive-value {
    font-size: 0.95rem !important;
  }
  .user-profile-name,
  .user-profile-email,
  .user-profile-role {
    font-size: 0.91em !important;
  }
}
</style>