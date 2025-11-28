import { defineStore } from 'pinia';


export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    role: null,
    permissions: {},
    initialized: false,
    _bootPromise: null,
  }),

  actions: {
    setUserDetails(user, role, permissions) {
      this.user = user;
      this.role = role;
      this.permissions = permissions && typeof permissions === 'object' ? permissions : {};
      try {
        localStorage.setItem('user_snapshot', JSON.stringify({
          user: this.user,
          role: this.role,
          permissions: this.permissions,
        }));
      } catch (_) {}
    },

    clearUserDetails() {
      this.user = null;
      this.role = null;
      this.permissions = {};
      localStorage.removeItem('user_snapshot');
      this.initialized = true;
    },

    async _hydrateFromSnapshot() {
      try {
        const raw = localStorage.getItem('user_snapshot');
        if (raw) {
          const parsed = JSON.parse(raw);
            this.user = parsed.user || null;
            this.role = parsed.role || null;
            this.permissions = parsed.permissions || {};
        }
      } catch (_) {}
    },

    async _fetchRemoteIfNeeded() {
      if (this.user) return;
      const staffId = localStorage.getItem('staff_id');
      const doctorId = localStorage.getItem('doctor_id');

      // If staffId exists, always treat user as staff (even if doctorId also exists)
      if (!staffId && !doctorId) return;

      try {
        if (staffId) {
          const { getUserById } = await import('../apis/User');
          const user = await getUserById(staffId);
          if (user && user.role && user.permissions) {
            this.setUserDetails(user, user.role, user.permissions);
            return; // staff takes precedence
          } else {
            localStorage.removeItem('staff_id');
          }
        }

        // Only fetch doctor if no valid staff user was set and doctorId exists
        if (!this.user && doctorId) {
          const { getDoctorById } = await import('../apis/doctor');
          const data = await getDoctorById(doctorId);
          if (data?.doctor) {
            this.setUserDetails(
              data.doctor,
              data.doctor.role,
              data.doctor.permissions || {}
            );
          } else {
            localStorage.removeItem('doctor_id');
          }
        }
      } catch (_) {
        localStorage.removeItem('staff_id');
        localStorage.removeItem('doctor_id');
      }
    },

    async bootstrap() {
      if (this.initialized) return;
      if (!this._bootPromise) {
        this._bootPromise = (async () => {
          await this._hydrateFromSnapshot();
          // Only hit API if still no cached user
          if (!this.user) {
            await this._fetchRemoteIfNeeded();
          }
          this.initialized = true;
        })();
      }
      await this._bootPromise;
    },
  },

  getters: {
    isLoggedIn: (state) => !!state.user,
    hasAccess: (state) => (module, minAccessLevel) => {
      // superAdmin has full access
      if (String(state.role).toLowerCase() === 'superadmin') return true;
      if (!state.initialized) return false;
      if (!state.user) return false;
      const order = ['none', 'view', 'edit', 'full'];
      const userLevel = state.permissions?.[module];
      if (!userLevel) return false;
      const ui = order.indexOf(String(userLevel).toLowerCase());
      const mi = order.indexOf(String(minAccessLevel).toLowerCase());
      if (ui === -1 || mi === -1) return false;
      return ui >= mi;
    },
  }
});


