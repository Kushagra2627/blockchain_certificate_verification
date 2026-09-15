import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from "../context/ThemeContext";
import { ShieldCheck, LogOut, LayoutDashboard, PlusCircle, Search, Award, Sun, Moon, Wallet } from "lucide-react";
import { shortenAddress } from "../utils/formatters";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setWalletAddress(window.ethereum.selectedAddress);
    }
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask extension not found in your browser! Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        toast.success(`MetaMask Connected: ${shortenAddress(accounts[0])}`);
      }
    } catch (err) {
      console.error("MetaMask connection error:", err);
      toast.error("Failed to connect MetaMask wallet");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStudent = user?.role === "Student";

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-700/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight gradient-text">CertiChain</span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Blockchain Verified
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-slate-300 hover:text-indigo-400 transition-colors">
            Home
          </Link>

          {/* Public or Admin can see Verify Certificate; Student cannot */}
          {(!isAuthenticated || isAdmin) && (
            <Link to="/verify" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors">
              <Search className="w-4 h-4" />
              Verify Certificate
            </Link>
          )}

          {isAuthenticated && (
            <>
              {/* Admin Links */}
              {isAdmin && (
                <>
                  <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link to="/issue" className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    Issue Certificate
                  </Link>
                  <Link to="/certificates" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors">
                    <Award className="w-4 h-4" />
                    All Certificates
                  </Link>
                </>
              )}

              {/* Student Links */}
              {isStudent && (
                <Link to="/certificates" className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  <Award className="w-4 h-4" />
                  My Certificates
                </Link>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* MetaMask Button */}
          <button
            onClick={connectMetaMask}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
              walletAddress
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            {walletAddress ? shortenAddress(walletAddress, 4) : "MetaMask"}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
                <span className="text-[10px] text-indigo-400 font-mono font-medium">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Register Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
