<template>
  <v-app>
    <template v-if="isLoginRoute">
      <router-view />
    </template>
    <template v-else>
      <SideBar />
      <v-main>
        <HeadBar />
        <router-view></router-view>
      </v-main>
    </template>
  </v-app>
  <base-message />
</template>

<script>
import { computed, defineAsyncComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SideBar from "./components/SideBar.vue";
import HeadBar from "./components/HeadBar.vue";
import BaseMessage from './components/core/BaseMessage.vue';
import { useUserStore } from './store/UserStore';

export default {
  name: 'App',

  components: {
    SideBar,
    HeadBar,
    BaseMessage: defineAsyncComponent(() => Promise.resolve(BaseMessage))
  },

  setup() {
    const route = useRoute();
    const userStore = useUserStore();
    const isLoginRoute = computed(() => route.path === '/login');
   
    
    onMounted(async () => {
      await userStore.bootstrap();
    })

    return {
      isLoginRoute
    }
  }
}
</script>

