import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerAuth, loading } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const res = await registerAuth({
      ...data,
      role: "Admin",
    });

    if (res.success) {
      toast.success("Institution registration successful!");
      navigate("/dashboard");
    } else {
      toast.error(res.message || "Registration failed");
    }
  };

  return (
    <div className="bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif] min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#151c26] rounded-2xl p-8 border border-[#3c4a42]/40 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 border border-[#4edea3]/40 text-[#4edea3] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">account_balance</span>
          </div>
          <h2 className="text-2xl font-bold text-[#dce3f1]">Register Institution Admin</h2>
          <p className="text-xs text-[#bbcabf]">Create an administrator account for credential issuance</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Dr. Alexander Wright"
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none"
            />
            {errors.name && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Institution Name</label>
            <input
              type="text"
              placeholder="Stanford Institute of Technology"
              {...register("institution", { required: "Institution name is required" })}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none"
            />
            {errors.institution && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.institution.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Email Address</label>
            <input
              type="email"
              placeholder="admin@stanford.edu"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none font-mono"
            />
            {errors.email && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none font-mono"
            />
            {errors.password && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#10b981] hover:bg-[#45dfa4] text-[#00422b] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 btn-shine cursor-pointer"
          >
            <span>{loading ? "Registering..." : "Create Admin Account"}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#bbcabf] pt-2 border-t border-[#3c4a42]/30">
          Already registered?{" "}
          <Link to="/login" className="text-[#4edea3] hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
