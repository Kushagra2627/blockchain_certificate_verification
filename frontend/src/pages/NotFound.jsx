import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 text-center">
      <div className="space-y-4 max-w-md">
        <span className="material-symbols-outlined text-6xl text-[#ffb4ab]">error_outline</span>
        <h1 className="text-4xl font-bold text-[#dce3f1]">404 - Page Not Found</h1>
        <p className="text-xs text-[#bbcabf]">The requested route or verification record does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#10b981] text-[#00422b] font-semibold text-xs transition-all shadow-md"
        >
          Back to Verification Portal
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
