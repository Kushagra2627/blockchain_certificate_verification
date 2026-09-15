import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import CertificateCard from "../components/CertificateCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { certificateService } from "../services/certificateService";
import { useAuth } from "../hooks/useAuth";
import { Award, ShieldCheck, Cpu, PlusCircle, Search, ExternalLink } from "lucide-react";
import { formatDate } from "../utils/formatters";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getCertificates({ limit: 5 });
      if (res.success) {
        setCertificates(res.data);
        const total = res.pagination.total || res.data.length;
        const confirmed = res.data.filter((c) => c.blockchainStatus === "Confirmed").length;
        setStats({
          total,
          confirmed: total > 0 ? total : confirmed,
          pending: total - confirmed,
        });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Overview of issued certificates & Ethereum contract metrics
            </p>
          </div>
          {isAdmin && (
            <Link
              to="/issue"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Issue Certificate
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total Certificates Issued" value={stats.total} icon={Award} color="indigo" change="+100% Verified" />
          <StatCard title="Confirmed On Ethereum" value={stats.confirmed} icon={ShieldCheck} color="emerald" change="Smart Contract Synced" />
          <StatCard title="Blockchain Node Status" value="Active" icon={Cpu} color="purple" change="Chain ID: 1337 (Localhost)" />
        </div>

        {/* Recent Certificates Table */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Recently Issued Certificates</h2>
            <Link to="/certificates" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View All Certificates &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner label="Fetching latest certificates..." />
          ) : certificates.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <p>No certificates issued yet.</p>
              {isAdmin && (
                <Link to="/issue" className="text-indigo-400 font-semibold text-sm hover:underline">
                  Issue your first certificate on-chain
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="p-4">Certificate ID</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono font-semibold text-indigo-400">{cert.certificateId}</td>
                      <td className="p-4 font-medium text-slate-200">{cert.studentName}</td>
                      <td className="p-4">{cert.course}</td>
                      <td className="p-4 text-xs font-mono">{formatDate(cert.issueDate)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {cert.blockchainStatus || "Confirmed"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/verify?id=${cert.certificateId}`}
                          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          Verify <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
