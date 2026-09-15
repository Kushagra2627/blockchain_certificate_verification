import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        toast.success(`Welcome back, ${res.user?.name || "User"}!`);
        if (res.user?.role === "Admin") {
          navigate("/dashboard");
        } else {
          navigate("/certificates");
        }
      } else {
        toast.error(res.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d141e] text-[#dce3f1] flex items-center justify-center px-4 pt-20 pb-12 crypto-grid">
      <div className="w-full max-w-md bg-surface-container-low p-8 rounded-2xl border border-outline-variant/40 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/50 text-primary mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="material-symbols-outlined text-2xl" data-icon="lock">lock</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Account Authentication</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Access your Student Locker or Institutional Admin Console
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-lg" data-icon="mail">mail</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@university.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-lg border border-outline-variant/50 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-lg" data-icon="key">key</span>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-lg border border-outline-variant/50 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-container hover:bg-secondary text-on-primary-container font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 btn-shine"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg" data-icon="login">login</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
}
