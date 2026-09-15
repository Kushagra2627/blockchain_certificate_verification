import React from "react";

const StatCard = ({ title, value, icon: Icon, change }) => {
  return (
    <div className="bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/40 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#bbcabf] uppercase tracking-wider">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-[#10b981]/15 border border-[#4edea3]/30 flex items-center justify-center text-[#4edea3]">
          {typeof Icon === "string" ? (
            <span className="material-symbols-outlined text-xl">{Icon}</span>
          ) : (
            <Icon className="w-5 h-5 text-[#4edea3]" />
          )}
        </div>
      </div>
      <div className="text-3xl font-bold text-[#dce3f1] font-mono">{value}</div>
      {change && <p className="text-xs font-mono text-[#4edea3]">{change}</p>}
    </div>
  );
};

export default StatCard;
