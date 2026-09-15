import React from "react";

const LoadingSpinner = ({ label = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="w-10 h-10 border-4 border-[#3c4a42] border-t-[#4edea3] rounded-full animate-spin"></div>
      <p className="text-xs font-mono text-[#bbcabf] animate-pulse">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
