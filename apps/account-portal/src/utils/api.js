import axios from 'axios';
import { encryptPayload } from './security/networkCrypto';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Cookies are the only source of truth now
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Custom wrapper for secure POST requests.
 */
export const securePost = async (url, data) => {
  try {
    const encryptedBody = await encryptPayload(data);
    return await api.post(url, encryptedBody);
  } catch (error) {
    console.error(`Secure POST failed for ${url}:`, error);
    throw error;
  }
};

export default api;
