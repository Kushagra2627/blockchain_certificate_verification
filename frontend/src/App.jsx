import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IssueCertificate from "./pages/IssueCertificate";
import CertificateList from "./pages/CertificateList";
import VerifyCertificate from "./pages/VerifyCertificate";
import CertificateDetails from "./pages/CertificateDetails";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public & Open Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<VerifyCertificate />} />

                {/* Shared Admin & Student Protected Routes */}
                <Route
                  path="/certificates"
                  element={
                    <ProtectedRoute roles={["Admin", "Student"]}>
                      <CertificateList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificates/:certificateId"
                  element={
                    <ProtectedRoute roles={["Admin", "Student"]}>
                      <CertificateDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Admin-Only Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute roles={["Admin"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/issue"
                  element={
                    <ProtectedRoute roles={["Admin"]}>
                      <IssueCertificate />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
