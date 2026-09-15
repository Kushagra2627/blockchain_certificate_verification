import api from "./api";

export const authService = {
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    // Backend returns: { success, data: { _id, name, email, role, token } }
    const { data } = response.data;
    if (data?.token) {
      localStorage.setItem("cert_token", data.token);
      localStorage.setItem("cert_user", JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        institution: data.institution,
      }));
    }
    return response.data; // { success, data }
  },

  async register(userData) {
    const response = await api.post("/auth/register", userData);
    // Backend returns: { success, data: { _id, name, email, role, token } }
    const { data } = response.data;
    if (data?.token) {
      localStorage.setItem("cert_token", data.token);
      localStorage.setItem("cert_user", JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        institution: data.institution,
      }));
    }
    return response.data; // { success, data }
  },

  logout() {
    localStorage.removeItem("cert_token");
    localStorage.removeItem("cert_user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("cert_user");
    return userStr ? JSON.parse(userStr) : null;
  },
};
