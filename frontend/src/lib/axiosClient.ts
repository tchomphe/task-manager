import axios from 'axios';
import { clearToken, getToken } from './auth';

const axiosClient = axios.create({ baseURL: '/api' });

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
