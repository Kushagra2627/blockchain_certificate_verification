import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("cert_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("cert_token") || null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const { token: jwtToken, ...userData } = response.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("cert_token", jwtToken);
        localStorage.setItem("cert_user", JSON.stringify(userData));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Check server connection.",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success) {
        const { token: jwtToken, ...userInfo } = response.data;
        setUser(userInfo);
        setToken(jwtToken);
        localStorage.setItem("cert_token", jwtToken);
        localStorage.setItem("cert_user", JSON.stringify(userInfo));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cert_token");
    localStorage.removeItem("cert_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === "Admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
