import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add handle to all requests if available
apiClient.interceptors.request.use((config) => {
  const handle = localStorage.getItem('cf_handle');
  if (handle && !config.params) {
    config.params = {};
  }
  if (handle) {
    config.params = config.params || {};
    config.params.handle = handle;
  }
  return config;
});

export default apiClient;
