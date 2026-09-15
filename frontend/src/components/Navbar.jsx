import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { shortenAddress } from "../utils/formatters";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d141e]/90 backdrop-blur-md border-b border-[#3c4a42]/30 w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between h-16">
        {/* Brand Logo Anchor */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, "hero-section")}
          className="text-lg font-semibold tracking-tight text-[#dce3f1] flex items-center gap-2 active:scale-[0.98] transition-transform group"
        >
          <span className="w-8 h-8 rounded-lg bg-[#232a35] border border-[#3c4a42]/50 flex items-center justify-center text-[#4edea3] group-hover:border-[#4edea3]/60 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all">
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">verified_user</span>
          </span>
          <span className="tracking-wide font-bold">VARUTHA</span>
        </Link>

        {/* Section Scroll Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, "how-it-works")}
            className="text-[#bbcabf] hover:text-[#4edea3] transition-colors duration-150 py-1 hover:border-b-2 hover:border-[#4edea3]"
          >
            How It Works
          </a>

          <a
            href="#verify"
            onClick={(e) => handleNavClick(e, "verify")}
            className="text-[#bbcabf] hover:text-[#4edea3] transition-colors duration-150 py-1 hover:border-b-2 hover:border-[#4edea3]"
          >
            Verify
          </a>

          <a
            href="#student-locker"
            onClick={(e) => handleNavClick(e, "student-locker")}
            className="text-[#bbcabf] hover:text-[#4edea3] transition-colors duration-150 py-1 hover:border-b-2 hover:border-[#4edea3]"
          >
            Student Locker
          </a>

          <a
            href="#why-blockchain"
            onClick={(e) => handleNavClick(e, "why-blockchain")}
            className="text-[#bbcabf] hover:text-[#4edea3] transition-colors duration-150 py-1 hover:border-b-2 hover:border-[#4edea3]"
          >
            Why Blockchain
          </a>
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-3">
          {/* MetaMask Button */}
          <button
            onClick={connectMetaMask}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
              walletAddress
                ? "bg-[#10b981]/10 text-[#4edea3] border-[#4edea3]/40"
                : "bg-[#232a35] text-[#bbcabf] hover:border-[#4edea3]/60 hover:text-[#4edea3] border-[#3c4a42]/60"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">wallet</span>
            <span>{walletAddress ? shortenAddress(walletAddress, 4) : "MetaMask"}</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#19202a] text-[#4edea3] border border-[#4edea3]/40 hover:bg-[#232a35] text-xs font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  <span>Dashboard</span>
                </Link>
              )}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-[#dce3f1]">{user?.name}</span>
                <span className="text-[10px] text-[#4edea3] font-mono font-medium">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:bg-[#93000a]/40 text-xs font-medium transition-all active:scale-95 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold bg-[#232a35] text-[#dce3f1] border border-[#3c4a42]/60 rounded-lg hover:border-[#4edea3]/60 hover:text-[#4edea3] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-200 flex items-center gap-1.5 active:scale-95 btn-shine"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>Admin Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
