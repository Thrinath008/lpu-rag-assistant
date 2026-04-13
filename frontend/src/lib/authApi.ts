import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_ROOT =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';
const API_V1_URL = `${API_ROOT}/api/v1`;

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_V1_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  logout: async (token: string) => {
    try {
      await axios.post(`${API_V1_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Ignore errors on logout
    }
  },

  getCurrentUser: async (token: string) => {
    const response = await axios.get(`${API_V1_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export const createAuthHeader = (token: string | null) => {
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const setupAuthInterceptor = () => {
  axios.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
