import axios from "axios";

// In production (Vercel), the frontend and backend share the same domain,
// so /api proxy works. VITE_API_URL can override this for split deployments.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cert_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("cert_token");
      localStorage.removeItem("cert_user");
    }
    return Promise.reject(error);
  }
);

export default api;
