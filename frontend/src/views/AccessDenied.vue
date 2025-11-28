<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center text-center">
    <v-icon size="72" color="error" class="mb-4">mdi-lock-alert</v-icon>
    <h2 class="mb-2">Access Denied</h2>
    <p class="mb-6">You do not have permission to view this page.</p>
    <v-btn class="saaro-btn"  @click="$router.push('/dashboard')">Go to Dashboard</v-btn>
  </v-container>
</template>

<script>
export default {
  name: 'AccessDenied'
}
</script>