/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
