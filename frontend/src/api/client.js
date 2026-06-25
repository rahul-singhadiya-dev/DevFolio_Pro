// src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

let authToken = null;
let unauthorizedCallback = () => {};

export const setClientToken = (token) => {
  authToken = token;
};

export const registerAuthCallbacks = ({ onUnauthorized }) => {
  unauthorizedCallback = onUnauthorized;
};

// Request Interceptor to add Bearer token
client.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to capture 401 Unauthorized errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      authToken = null;
      unauthorizedCallback();
    }
    return Promise.reject(error);
  }
);

export default client;
