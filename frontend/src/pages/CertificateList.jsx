import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import CertificateCard from "../components/CertificateCard";
import { certificateService } from "../services/certificateService";
import { useAuth } from "../hooks/useAuth";

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

      const searchQuery = isStudent && !search.trim() ? user?.name || "" : search;

      const res = await certificateService.getCertificates({ page, limit: 6, search: searchQuery });
      if (res.success) {
        let certData = res.data || [];

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
    <div className="flex bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3c4a42]/30 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#dce3f1] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3] text-3xl">award</span>
              <span>{isStudent ? "Student Locker — My Certificates" : "Institutional Certificate Registry"}</span>
            </h1>
            <p className="text-xs text-[#bbcabf] mt-1">
              {isStudent
                ? "View and download your official conferred academic credentials and blockchain proofs"
                : "Browse all stored credentials and verify their blockchain transaction logs"}
            </p>
          </div>

          <button
            onClick={fetchCertificates}
            className="px-3 py-1.5 rounded-lg bg-[#19202a] hover:bg-[#232a35] text-[#dce3f1] border border-[#3c4a42]/60 self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-[#151c26] p-2 rounded-xl border border-[#3c4a42]/40 flex items-center gap-3 px-4 shadow-sm">
          <span className="material-symbols-outlined text-[#4edea3] text-[20px]">search</span>
          <input
            type="text"
            placeholder={
              isStudent
                ? "Filter my certificates by course or student name..."
                : "Search by Student Name, Course, or Institution..."
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent border-none outline-none text-[#dce3f1] placeholder-[#bbcabf]/60 text-sm py-1.5 font-medium"
          />
        </div>

        {/* Certificate Grid */}
        {loading ? (
          <LoadingSpinner label={isStudent ? "Searching student locker..." : "Loading certificate registry..."} />
        ) : certificates.length === 0 ? (
          <div className="text-center py-16 bg-[#151c26] rounded-xl border border-[#3c4a42]/40 space-y-3">
            <span className="material-symbols-outlined text-5xl text-[#bbcabf]/50">folder_off</span>
            <h3 className="text-[#dce3f1] font-bold text-base">No Matching Certificates Found</h3>
            <p className="text-xs text-[#bbcabf] max-w-md mx-auto">
              {isStudent
                ? "No certificates match your search query for your account."
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
          <div className="flex items-center justify-center gap-2 pt-4 font-mono text-xs">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-lg bg-[#19202a] disabled:opacity-40 text-[#dce3f1] font-semibold border border-[#3c4a42]/40"
            >
              Previous
            </button>
            <span className="text-[#bbcabf]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg bg-[#19202a] disabled:opacity-40 text-[#dce3f1] font-semibold border border-[#3c4a42]/40"
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
