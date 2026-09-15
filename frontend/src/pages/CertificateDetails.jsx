import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import { certificateService } from "../services/certificateService";
import { formatDate } from "../utils/formatters";
import toast from "react-hot-toast";

const CertificateDetails = () => {
  const { certificateId } = useParams(); // this is the MongoDB _id from the URL
  const [certificate, setCertificate] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [certificateId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Backend accepts: _id (24-char hex), documentHash (64-char hex), or certificateId string
      const res = await certificateService.getCertificateById(certificateId);
      if (res.success) {
        setCertificate(res.data);
        setBlockchainData(res.blockchainVerification || null);
      } else {
        toast.error(res.message || "Certificate not found.");
      }
    } catch (error) {
      console.error("Fetch details error:", error);
      toast.error(error.response?.data?.message || "Failed to load certificate details.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // PDF download — backend serves /api/certificates/:certificateId/pdf
  // Uses the human-readable certificateId if present, otherwise falls back to _id
  const handleDownloadPDF = () => {
    const idForPdf = certificate?.certificateId || certificate?._id;
    if (!idForPdf) {
      toast.error("No certificate ID available to generate PDF.");
      return;
    }
    const url = `/api/certificates/${idForPdf}/pdf`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificate-${idForPdf}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloading PDF certificate...");
  };

  if (loading) {
    return (
      <div className="flex bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif]">
        <Sidebar />
        <main className="flex-1 p-8">
          <LoadingSpinner label="Retrieving certificate details..." />
        </main>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif]">
        <Sidebar />
        <main className="flex-1 p-8 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-[#bbcabf]/50 block">search_off</span>
          <h2 className="text-xl font-bold">Certificate Record Not Found</h2>
          <p className="text-xs text-[#bbcabf]">The certificate may have been deleted or the link is invalid.</p>
          <Link to="/certificates" className="text-[#4edea3] underline text-xs font-mono">
            ← Back to Certificates
          </Link>
        </main>
      </div>
    );
  }

  const isRevoked = certificate.blockchainStatus === "Revoked";
  const isConfirmed = certificate.blockchainStatus === "Confirmed";

  return (
    <div className="flex bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Header Row */}
        <div className="flex items-center justify-between border-b border-[#3c4a42]/30 pb-4">
          <Link to="/certificates" className="text-xs font-mono text-[#4edea3] flex items-center gap-1 hover:underline">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Certificates</span>
          </Link>
          <span
            className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
              isRevoked
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : isConfirmed
                ? "bg-[#10b981]/20 text-[#4edea3] border-[#4edea3]/30"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
            }`}
          >
            {isRevoked ? "REVOKED" : isConfirmed ? "VERIFIED ON-CHAIN" : "PENDING"}
          </span>
        </div>

        {/* Main Certificate Card */}
        <div className="bg-[#151c26] p-8 rounded-xl border border-[#3c4a42]/40 space-y-6 shadow-xl">

          {/* Course & Institution Header */}
          <div className="text-center space-y-2 border-b border-[#3c4a42]/30 pb-6">
            <span className="material-symbols-outlined text-4xl text-[#4edea3]">workspace_premium</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#dce3f1]">{certificate.course}</h1>
            <p className="text-sm text-[#bbcabf]">{certificate.institution}</p>
            {certificate.certificateId && (
              <span className="inline-block px-3 py-1 rounded bg-[#0d141e] text-[#4edea3] font-mono text-xs border border-[#3c4a42]/40">
                ID: {certificate.certificateId}
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-[#bbcabf] font-medium">Student Name</span>
              <p className="text-[#dce3f1] font-bold text-base mt-0.5">{certificate.studentName}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">Student Email</span>
              <p className="text-[#dce3f1] font-mono mt-0.5">{certificate.studentEmail || "N/A"}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">Conferral Date</span>
              <p className="text-[#dce3f1] font-mono mt-0.5">{formatDate(certificate.issueDate)}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">Grade / Result</span>
              <p className="text-[#dce3f1] font-mono mt-0.5">{certificate.grade || "Pass"}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">Blockchain Status</span>
              <p className={`font-mono font-semibold mt-0.5 ${isRevoked ? "text-red-400" : "text-[#4edea3]"}`}>
                {certificate.blockchainStatus || "Confirmed"}
              </p>
            </div>
            {blockchainData?.existsOnChain && (
              <div>
                <span className="text-[#bbcabf] font-medium">On-Chain Timestamp</span>
                <p className="text-[#dce3f1] font-mono mt-0.5">
                  {blockchainData.timestamp
                    ? new Date(blockchainData.timestamp * 1000).toLocaleString("en-IN")
                    : "N/A"}
                </p>
              </div>
            )}
          </div>

          {/* Cryptographic Proof Block */}
          <div className="p-4 rounded-xl bg-[#0d141e] border border-[#3c4a42]/40 space-y-3 font-mono text-xs">
            <h4 className="font-semibold text-[#dce3f1] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4edea3]">lock</span>
              <span>Cryptographic Proof</span>
            </h4>

            {/* Document Hash */}
            {certificate.documentHash && (
              <div className="flex justify-between items-start gap-2 border-b border-[#3c4a42]/20 pb-2">
                <span className="text-[#bbcabf] shrink-0">SHA-256 PDF Hash:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#4edea3] truncate max-w-[220px]" title={certificate.documentHash}>
                    {certificate.documentHash}
                  </span>
                  <button
                    onClick={() => copyText(certificate.documentHash)}
                    className="text-[#bbcabf] hover:text-[#4edea3] shrink-0"
                    title="Copy hash"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  </button>
                </div>
              </div>
            )}

            {/* Transaction Hash */}
            {certificate.transactionHash && (
              <div className="flex justify-between items-start gap-2">
                <span className="text-[#bbcabf] shrink-0">Ethereum Tx Hash:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#6ffbbe] truncate max-w-[220px]" title={certificate.transactionHash}>
                    {certificate.transactionHash}
                  </span>
                  <button
                    onClick={() => copyText(certificate.transactionHash)}
                    className="text-[#bbcabf] hover:text-[#4edea3] shrink-0"
                    title="Copy tx hash"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  </button>
                </div>
              </div>
            )}

            {/* Issuer Wallet from blockchain */}
            {blockchainData?.issuerWallet && (
              <div className="flex justify-between items-start gap-2 border-t border-[#3c4a42]/20 pt-2">
                <span className="text-[#bbcabf] shrink-0">Issuer Wallet:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#bbcabf] truncate max-w-[220px]" title={blockchainData.issuerWallet}>
                    {blockchainData.issuerWallet}
                  </span>
                  <button
                    onClick={() => copyText(blockchainData.issuerWallet)}
                    className="text-[#bbcabf] hover:text-[#4edea3] shrink-0"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Download PDF — only if certificateId or _id available */}
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3 rounded-lg bg-[#10b981] hover:bg-[#45dfa4] text-[#00422b] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all btn-shine"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Download PDF Certificate
            </button>

            {/* Copy shareable link */}
            <button
              onClick={() => {
                copyText(window.location.href);
              }}
              className="flex-1 py-3 rounded-lg bg-[#19202a] hover:bg-[#232a35] text-[#dce3f1] font-semibold text-sm flex items-center justify-center gap-2 border border-[#3c4a42]/60 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              Copy Certificate Link
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CertificateDetails;
