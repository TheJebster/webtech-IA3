import axios from 'axios';

export const TOKEN_KEY = 'rentkit_token';

const api = axios.create({
  // Same address as the site by default (/api); VITE_API_URL can point at a separately hosted API
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// When the session is no longer valid, let the app know so it can log out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if ((status === 401 || (status === 403 && error.response?.data?.message?.includes('deactivated'))) &&
        !url.includes('/auth/login')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// Pulls a readable message (and field errors) out of an axios error
export function parseError(error) {
  if (!error.response) {
    return { message: 'Cannot reach the server. Check your connection and try again.', errors: {} };
  }
  const { message, errors } = error.response.data || {};
  return { message: message || 'Something went wrong.', errors: errors || {} };
}

export default api;
