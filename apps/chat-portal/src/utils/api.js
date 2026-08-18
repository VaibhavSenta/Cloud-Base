/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import axios from 'axios';
import { encryptPayload } from './security/networkCrypto';
import { config } from './config';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject session token from memory state
api.interceptors.request.use(
  (reqConfig) => {
    if (typeof window !== 'undefined') {
      const token = window.__cb_session_token;
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return reqConfig;
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
        // Call refresh token endpoint on account-api using config url
        const refreshRes = await axios.post(
          `${config.accountApiUrl}/auth/refresh`,
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
    console.warn(`Secure POST failed for ${url}:`, error.message);
    throw error;
  }
};

/**
 * Custom wrapper for secure PATCH requests (used for account-api).
 */
export const securePatch = async (url, data) => {
  try {
    const encryptedBody = await encryptPayload(data);
    return await axios.patch(url, encryptedBody, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.warn(`Secure PATCH failed for ${url}:`, error.message);
    throw error;
  }
};

export default api;
