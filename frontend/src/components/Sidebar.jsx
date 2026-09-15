import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LayoutDashboard, PlusCircle, Award, Search, Shield } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || "Student";

  // Navigation link definitions per role
  const allLinks = [
    { name: "Dashboard Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["Admin"] },
    { name: "Issue New Certificate", path: "/issue", icon: PlusCircle, roles: ["Admin"] },
    { name: userRole === "Student" ? "My Certificates" : "All Certificates", path: "/certificates", icon: Award, roles: ["Admin", "Student"] },
    { name: "Verify Certificate", path: "/verify", icon: Search, roles: ["Admin"] },
  ];

  const filteredLinks = allLinks.filter((link) => link.roles.includes(userRole));

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-80px)]">
      <div className="space-y-6">
        <div className="px-3 py-2 bg-indigo-950/40 border border-indigo-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Portal Role
          </div>
          <p className="text-sm font-bold text-slate-200 mt-1">{userRole}</p>
          {user?.institution && <p className="text-xs text-slate-400 mt-0.5 truncate">{user.institution}</p>}
        </div>

        <nav className="space-y-1.5">
          {filteredLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Ethereum Mainnet Node</p>
        <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Connected (Hardhat/Ganache)
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
