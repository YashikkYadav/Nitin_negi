import { useUiStore } from '@/store/UiStore';
import axios from 'axios';

class AxiosWrapper {
  axiosInstance;
  uiStore; // Renamed to follow conventions

  constructor(url = `${import.meta.env.VITE_SERVER_URL}/api`) {
    // Initialize the axios instance
    this.axiosInstance = axios.create({
      baseURL: url,
      // Remove static headers here
    });

    // Add request interceptor to set latest token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleErrorResponse(error);
        return Promise.reject(error);
      }
    );
  }

  // Lazy initialize the UI store when needed
  getUiStore() {
    if (!this.uiStore) {
      this.uiStore = useUiStore();
    }
    return this.uiStore;
  }

  handleErrorResponse(error) {
    let errorMessage = "";
    // console.log("Error object:", error);
    
    // More comprehensive error handling
    if (error.response) {
      // Server responded with error status
      if (typeof error.response.data === "string") {
        errorMessage = error.response.data;
      } else if (Array.isArray(error.response.data)) {
        errorMessage = error.response.data.map((err) => `• ${err.message}`).join("\n");
      } else if (typeof error.response.data === "object" && error.response.data !== null) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // Try to stringify the object to show more details
          errorMessage = JSON.stringify(error.response.data, null, 2);
        }
      } else {
        errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
      }
      
      // Special handling for the "Prescription is not drafted yet" case
      if (errorMessage === 'Prescription is not drafted yet.') {
        // This is not really an error that should be shown to the user
        // console.log("Ignoring 'Prescription is not drafted yet' message as it's expected for new patients");
        return; // Don't show notification for this case
      }
      
      // Special handling for 404 errors that might be expected
      if (error.response.status === 404) {
        // For some cases, 404 might be expected (like when a draft doesn't exist)
        console.log("Received 404, checking if this is expected...");
        // We'll still show other 404 errors, but not the prescription draft one
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "No response from server. Please check your connection and try again.";
    } else {
      // Something else happened
      errorMessage = error.message || "An unknown error occurred.";
    }

    // Fallback if errorMessage is still empty
    if (!errorMessage) {
      errorMessage = "An unknown error occurred.";
    }

    console.log("Processed error message:", errorMessage);
    
    // Only show error notification if it's a real error
    if (error.response && errorMessage !== 'Prescription is not drafted yet.') {
      const message = 'An error occurred.';
      try {
        const uiStore = this.getUiStore();
        uiStore.openNotificationMessage(
          message,
          errorMessage,
          'error'
        );
      } catch (e) {
        // If we can't access the store, log to console instead
        console.error(message, errorMessage);
      }
    } else if (error.request) {
      try {
        const uiStore = this.getUiStore();
        uiStore.openNotificationMessage(
          'No response from the server.',
          error.request.response || errorMessage,
          'error'
        );
      } catch (e) {
        console.error('No response from the server.', error.request.response || errorMessage);
      }
    } else if (errorMessage !== 'Prescription is not drafted yet.') {
      try {
        const uiStore = this.getUiStore();
        uiStore.openNotificationMessage(
          'Something went wrong! Please try again later',
          errorMessage,
          'error'
        );
      } catch (e) {
        console.error('Something went wrong! Please try again later', errorMessage);
      }
    }
  }

  get(url, config) {
    return this.axiosInstance.get(url, config).then((response) => response.data);
  }

  post(url, data, config) {
    return this.axiosInstance.post(url, data, config).then((response) => response.data);
  }

  put(url, data, config) {
    return this.axiosInstance.put(url, data, config).then((response) => response.data);
  }

  patch(url, data, config) {
    return this.axiosInstance.patch(url, data, config).then((response) => response.data);
  }

  delete(url, config) {
    return this.axiosInstance.delete(url, config).then((response) => response.data);
  }
}

export default AxiosWrapper;