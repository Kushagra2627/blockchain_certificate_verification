import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { Building, Mail, Lock, User, Shield, ArrowRight } from "lucide-react";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerAuth, loading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const res = await registerAuth(data);
    if (res.success) {
      toast.success("Account registered successfully!");
      navigate("/dashboard");
    } else {
      toast.error(res.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Register Account</h2>
          <p className="text-xs text-slate-400">Educational Institution & User Signup</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Dr. Alexander Wright"
                {...register("name", { required: "Name is required" })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            {errors.name && <span className="text-xs text-red-400 mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="alexander@stanford.edu"
                {...register("email", { required: "Email is required" })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            {errors.email && <span className="text-xs text-red-400 mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Institution / Organization</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Stanford University"
                {...register("institution", { required: "Institution name is required" })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            {errors.institution && <span className="text-xs text-red-400 mt-1 block">{errors.institution.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <select
                {...register("role")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="Admin">Admin (Can issue certificates on blockchain)</option>
                <option value="Student">Student (View & download certificate)</option>
                <option value="Verifier">Verifier (Public Auditor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min length is 6" } })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            {errors.password && <span className="text-xs text-red-400 mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? "Registering..." : "Create Account"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
