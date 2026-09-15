import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || "Student";

  const allLinks = [
    { name: "Dashboard Overview", path: "/dashboard", icon: "dashboard", roles: ["Admin"] },
    { name: "Issue New Certificate", path: "/issue", icon: "add_circle", roles: ["Admin"] },
    { name: userRole === "Student" ? "My Locker" : "All Certificates", path: "/certificates", icon: "award", roles: ["Admin", "Student"] },
    { name: "Verify Certificate", path: "/verify", icon: "search", roles: ["Admin"] },
  ];

  const filteredLinks = allLinks.filter((link) => link.roles.includes(userRole));

  return (
    <aside className="w-64 bg-[#151c26] border-r border-[#3c4a42]/40 p-6 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-64px)]">
      <div className="space-y-6">
        <div className="p-3 bg-[#0d141e] border border-[#3c4a42]/40 rounded-xl">
          <div className="flex items-center gap-2 text-[#4edea3] font-semibold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span>Portal Role</span>
          </div>
          <p className="text-sm font-bold text-[#dce3f1] mt-1">{userRole}</p>
          {user?.institution && <p className="text-xs text-[#bbcabf] mt-0.5 truncate">{user.institution}</p>}
        </div>

        <nav className="space-y-1.5 font-medium text-sm">
          {filteredLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/40 shadow-md font-semibold"
                    : "text-[#bbcabf] hover:text-[#dce3f1] hover:bg-[#19202a]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 rounded-xl bg-[#0d141e] border border-[#3c4a42]/40 text-xs text-[#bbcabf]">
        <p className="font-semibold text-[#dce3f1]">Ethereum Mainnet Node</p>
        <p className="text-[11px] text-[#4edea3] font-mono mt-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
          Connected (Hardhat Node)
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
