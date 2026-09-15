import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import CertificateCard from "../components/CertificateCard";
import { certificateService } from "../services/certificateService";
import { Award, ArrowLeft } from "lucide-react";

const CertificateDetails = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [certificateId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getCertificateById(certificateId);
      if (res.success) {
        setCertificate(res.data);
      }
    } catch (error) {
      console.error("Error loading certificate details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <Link to="/certificates" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Certificate Registry
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Award className="w-7 h-7 text-indigo-400" /> Certificate Details
          </h1>
          <p className="text-slate-400 text-sm mt-1">Official Blockchain Certificate Record</p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading certificate details..." />
        ) : !certificate ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800">
            <p className="text-slate-400">Certificate not found.</p>
          </div>
        ) : (
          <CertificateCard certificate={certificate} />
        )}
      </main>
    </div>
  );
};

export default CertificateDetails;
