import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
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
