import React, { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // authService.login returns { success, data: { _id, name, email, role, token } }
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const userData = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          institution: response.data.institution,
        };
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response.message || "Login failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Check your credentials.",
      };
    }
  };

  const register = async (userData) => {
    try {
      // authService.register returns { success, data: { _id, name, email, role, token } }
      const response = await authService.register(userData);
      if (response.success && response.data) {
        const user = {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          institution: response.data.institution,
        };
        setUser(user);
        return { success: true, user };
      }
      return { success: false, message: response.message || "Registration failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed.",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === "Admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
