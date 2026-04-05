import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

API.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('poscafe_tokens') || '{}');
  if (tokens.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = JSON.parse(localStorage.getItem('poscafe_tokens') || '{}');
      if (tokens.refresh) {
        try {
          const res = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
            refresh: tokens.refresh,
          });
          const newTokens = { ...tokens, access: res.data.access };
          localStorage.setItem('poscafe_tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return API(originalRequest);
        } catch {
          localStorage.removeItem('poscafe_tokens');
          localStorage.removeItem('poscafe_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
