import axios from 'axios';
import { AuthStore } from '../services/authStore.js';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const session = AuthStore.getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Handle errors globally with retry logic for transient failures
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 Unauthorized errors — clear session and redirect to login
    if (error.response && error.response.status === 401) {
      const url = config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/verify') || url.includes('/auth/send-otp') || url.includes('/auth/reset-password');

      // Do not redirect if this is an authentication attempt — allow the login form to display error feedback
      if (!isAuthEndpoint) {
        console.warn('[API Client] Unauthorized (401). Clearing stale session.');
        AuthStore.clearSession();
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin-login') {
          window.location.href = '/admin-login';
        }
      }
      return Promise.reject(error);
    }

    // Retry on 500/503 (database cold start / transient errors)
    const retryableStatuses = [500, 503];
    if (
      error.response &&
      retryableStatuses.includes(error.response.status) &&
      config
    ) {
      config.__retryCount = config.__retryCount || 0;

      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 1000; // 1s, 2s backoff
        console.warn(
          `[API Client] Retrying request (${config.__retryCount}/2) after ${delay}ms: ${config.url}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  }
);
