import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import CertificateCard from "../components/CertificateCard";
import { certificateService } from "../services/certificateService";
import { useAuth } from "../hooks/useAuth";
import { Search, Award, RefreshCw, FileText } from "lucide-react";

const CertificateList = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "Student";

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCertificates();
  }, [page, search]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);

      // If student, auto-populate search query with student name if blank so they default to their own records
      const searchQuery = isStudent && !search.trim() ? user?.name || "" : search;

      const res = await certificateService.getCertificates({ page, limit: 6, search: searchQuery });
      if (res.success) {
        let certData = res.data || [];

        // Additional client-side filter for student role to ensure privacy & security:
        // Student only sees certificates matching their own name/email, or matching their explicit query if it belongs to them
        if (isStudent && user) {
          const studentNameLower = (user.name || "").toLowerCase();
          const studentEmailLower = (user.email || "").toLowerCase();

          certData = certData.filter((cert) => {
            const certName = (cert.studentName || "").toLowerCase();
            const certEmail = (cert.studentEmail || "").toLowerCase();
            return (
              certName.includes(studentNameLower) ||
              (studentEmailLower && certEmail.includes(studentEmailLower)) ||
              (search.trim() && certName.includes(search.trim().toLowerCase()))
            );
          });
        }

        setCertificates(certData);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
              <Award className="w-7 h-7 text-indigo-400" />
              {isStudent ? "Find & Download My Certificate" : "Certificate Registry"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {isStudent
                ? "Search by Certificate ID or Student Name to locate and download your official PDF certificate"
                : "Browse all stored credentials and verify their blockchain transaction logs"}
            </p>
          </div>

          <button
            onClick={fetchCertificates}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 self-start sm:self-auto flex items-center gap-2 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex items-center gap-3 px-4 shadow-lg">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder={
              isStudent
                ? "Search by Certificate ID or Student Name (e.g., CERT2026001 or " + (user?.name || "Student Name") + ")..."
                : "Search by Certificate ID, Student Name, Course, or Institution..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-sm py-2 font-medium"
          />
        </div>

        {/* Certificate Grid */}
        {loading ? (
          <LoadingSpinner label={isStudent ? "Searching your certificates..." : "Loading certificate registry..."} />
        ) : certificates.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-slate-200 font-bold text-base">No Matching Certificates Found</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              {isStudent
                ? "No certificates match your search query for your account. Please check the Certificate ID or Student Name entered."
                : "No certificates match your search criteria in the database."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert._id} certificate={cert} isStudentView={isStudent} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              Previous
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CertificateList;
