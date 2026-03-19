import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add a request interceptor to attach the token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('campkart-token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Add a response interceptor to handle token expiration/refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('campkart-refresh-token');
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken });
          localStorage.setItem('campkart-token', res.data.token);
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return API(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('campkart-token');
          localStorage.removeItem('campkart-refresh-token');
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getUser = () => {
  const token = localStorage.getItem('campkart-token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export default API;
