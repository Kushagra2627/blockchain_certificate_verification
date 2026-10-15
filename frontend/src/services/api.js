import axios from "axios";

// Resolves backend API URL safely whether VITE_API_URL ends with /api or not
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "/api";
  if (url.startsWith("http") && !url.endsWith("/api")) {
    url = `${url.replace(/\/+$/, "")}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
