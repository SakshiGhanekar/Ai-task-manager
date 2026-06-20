import axios from 'axios';

let envBaseUrl = 'https://ai-task-manager-d8w1.onrender.com/api/';

// Auto-correct common configuration mistakes (missing /api or trailing slash)
if (envBaseUrl && !envBaseUrl.endsWith('/')) {
  envBaseUrl += '/';
}
if (envBaseUrl && !envBaseUrl.endsWith('api/')) {
  envBaseUrl += 'api/';
}

const baseURL = envBaseUrl;
const api = axios.create({
  baseURL,
  timeout: 60000, // 60s timeout to allow Render free tier to wake up
});

api.interceptors.request.use(
  (config) => {
    // Remove leading slash to prevent overriding the baseURL path
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Prevent infinite loops if they get a 403 while trying to log in/register
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
