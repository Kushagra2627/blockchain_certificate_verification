import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Search, Award, Lock, Cpu, CheckCircle2, ArrowRight } from "lucide-react";

const Landing = () => {
  const [certId, setCertId] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (certId.trim()) {
      navigate(`/verify?id=${encodeURIComponent(certId.trim())}`);
    }
  };

  return (
    <div className="space-y-24 py-12 px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Cpu className="w-4 h-4 animate-spin" /> Next-Gen Blockchain Verification System
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Tamper-Proof Academic Certificates <br />
          Anchored on <span className="gradient-text">Ethereum Blockchain</span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg leading-relaxed">
          Instantly issue, store, and verify academic credentials with absolute mathematical certainty. Eliminate resume fraud with immutable smart contracts.
        </p>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center gap-2 p-2 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Search className="w-5 h-5 text-indigo-400" />
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g., CERT-2026-001)"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            Verify Now <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel glass-panel-hover p-8 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Immutable Ledger</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Certificates are cryptographically hashed and recorded permanently on Ethereum smart contracts.
          </p>
        </div>

        <div className="glass-panel glass-panel-hover p-8 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Instant Verification</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Employers & institutions can verify any credential within seconds using a unique Certificate ID without third parties.
          </p>
        </div>

        <div className="glass-panel glass-panel-hover p-8 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Institutional Portal</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Full admin dashboard for universities to batch issue credentials, track transaction hashes, and manage records.
          </p>
        </div>
      </section>

      {/* Action Banner */}
      <section className="glass-panel rounded-3xl p-10 border border-indigo-500/30 text-center space-y-6 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900">
        <h2 className="text-3xl font-extrabold text-slate-100">Are you an Accredited Educational Institution?</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          Register an Admin account to begin issuing smart-contract verified credentials instantly.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Register Institution
          </Link>
          <Link
            to="/verify"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700 transition-all"
          >
            Public Verification Engine
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
