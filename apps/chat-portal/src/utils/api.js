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
      const token = window.__cb_session_token; // Load from memory storage context index
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
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
