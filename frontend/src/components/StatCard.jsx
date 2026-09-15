import React from "react";

const StatCard = ({ title, value, icon: Icon, color = "indigo", change }) => {
  const colorMap = {
    indigo: "from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30",
    emerald: "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30",
    amber: "from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30",
    purple: "from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-slate-100 mt-2">{value}</p>
          {change && <p className="text-xs text-emerald-400 font-medium mt-1">{change}</p>}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br border ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
