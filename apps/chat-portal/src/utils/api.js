import axios from 'axios';
import { encryptPayload } from './security/networkCrypto';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject session token from memory state
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.__cb_session_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle silent token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh token endpoint on account-api
        const refreshRes = await axios.post(
          'http://account.cloudbase.local/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (refreshRes.data?.success && refreshRes.data?.token) {
          window.__cb_session_token = refreshRes.data.token;
          originalRequest.headers.Authorization = `Bearer ${refreshRes.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.warn('🔄 Silent token refresh failed. User session terminated.');
        if (typeof window !== 'undefined') {
          window.location.href = 'http://account.cloudbase.local';
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Custom wrapper for secure POST requests (used for account-api).
 */
export const securePost = async (url, data) => {
  try {
    const encryptedBody = await encryptPayload(data);
    return await axios.post(url, encryptedBody, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Secure POST failed for ${url}:`, error);
    throw error;
  }
};

export default api;
