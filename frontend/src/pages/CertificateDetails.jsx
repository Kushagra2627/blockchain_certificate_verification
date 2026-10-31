import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import { certificateService } from "../services/certificateService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatters";
import toast from "react-hot-toast";

const CertificateDetails = () => {
  const { certificateId } = useParams(); // this is the MongoDB _id or certificateId from the URL
  const { user, isAdmin } = useAuth();
  const [certificate, setCertificate] = useState(null);
  const [blockchainData, setBlockchainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [certificateId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
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

  const handleDownloadPDF = () => {
    const idForPdf = certificate?.certificateId || certificate?._id;
    if (!idForPdf) {
      toast.error("No certificate ID available to generate PDF.");
      return;
    }
    const url = `/api/certificates/${idForPdf}/pdf`;
    const a = document.createElement("a");
    a.href = url;
    a.download = certificate.originalFileName || certificate.originalPdfName || `Certificate-${idForPdf}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloading registered file...");
  };

  const handleRevokeConfirm = async () => {
    const targetId = certificate?._id || certificate?.certificateId;
    if (!targetId) return;

    try {
      setRevoking(true);
      const res = await certificateService.revokeCertificate(targetId);
      if (res.success) {
        toast.success("✓ Document officially REVOKED on Ethereum Sepolia!");
        setCertificate((prev) => ({
          ...prev,
          blockchainStatus: "Revoked",
          revocationTxHash: res.transactionHash,
          revokedAt: new Date(),
        }));
        setBlockchainData((prev) => ({
          ...prev,
          isRevoked: true,
          isValid: false,
        }));
        setShowRevokeModal(false);
      } else {
        toast.error(res.message || "Failed to revoke certificate.");
      }
    } catch (err) {
      console.error("Revocation error:", err);
      toast.error(err.response?.data?.message || "Error submitting revocation transaction to blockchain.");
    } finally {
      setRevoking(false);
    }
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

  const isRevoked = certificate.blockchainStatus === "Revoked" || blockchainData?.isRevoked;
  const isConfirmed = certificate.blockchainStatus === "Confirmed" && !isRevoked;

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
                ? "bg-red-500/15 text-red-400 border-red-500/40"
                : isConfirmed
                ? "bg-[#10b981]/20 text-[#4edea3] border-[#4edea3]/30"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
            }`}
          >
            {isRevoked ? "REVOKED ON-CHAIN" : isConfirmed ? "VERIFIED ON-CHAIN" : "PENDING"}
          </span>
        </div>

        {/* Main Certificate Card */}
        <div className="bg-[#151c26] p-8 rounded-xl border border-[#3c4a42]/40 space-y-6 shadow-xl">

          {/* Course & Institution Header */}
          <div className="text-center space-y-2 border-b border-[#3c4a42]/30 pb-6">
            <span className="material-symbols-outlined text-4xl text-[#4edea3]">
              {certificate.fileCategory === "image" ? "image" : "workspace_premium"}
            </span>
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
              <span className="text-[#bbcabf] font-medium">Student / Recipient</span>
              <p className="text-[#dce3f1] font-bold text-base mt-0.5">{certificate.studentName}</p>
            </div>
            {certificate.studentEmail && (
              <div>
                <span className="text-[#bbcabf] font-medium">Recipient Email</span>
                <p className="text-[#dce3f1] font-mono mt-0.5">{certificate.studentEmail}</p>
              </div>
            )}
            <div>
              <span className="text-[#bbcabf] font-medium">Conferral Date</span>
              <p className="text-[#dce3f1] font-mono mt-0.5">{formatDate(certificate.issueDate)}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">Classification</span>
              <p className="text-[#dce3f1] font-mono mt-0.5">{certificate.grade || "Pass"}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">File Category</span>
              <p className="text-[#dce3f1] font-mono mt-0.5 uppercase">{certificate.fileCategory || "document"}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">File Name</span>
              <p className="text-[#dce3f1] font-mono mt-0.5 truncate">{certificate.originalFileName || certificate.originalPdfName || "N/A"}</p>
            </div>
            <div>
              <span className="text-[#bbcabf] font-medium">Blockchain Status</span>
              <p className={`font-mono font-semibold mt-0.5 ${isRevoked ? "text-red-400" : "text-[#4edea3]"}`}>
                {isRevoked ? "Revoked" : certificate.blockchainStatus || "Confirmed"}
              </p>
            </div>
            {certificate.verificationUrl && (
              <div>
                <span className="text-[#bbcabf] font-medium">QR Verification Link</span>
                <p className="mt-0.5 truncate">
                  <a
                    href={certificate.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4edea3] hover:underline font-mono text-xs"
                  >
                    {certificate.verificationUrl}
                  </a>
                </p>
              </div>
            )}
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
                <span className="text-[#bbcabf] shrink-0">SHA-256 File Hash:</span>
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

            {/* Issuance Transaction Hash */}
            {certificate.transactionHash && (
              <div className="flex justify-between items-start gap-2 border-b border-[#3c4a42]/20 pb-2">
                <span className="text-[#bbcabf] shrink-0">Issuance Tx Hash:</span>
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

            {/* Revocation Transaction Hash if revoked */}
            {(certificate.revocationTxHash || isRevoked) && (
              <div className="flex justify-between items-start gap-2 border-b border-[#3c4a42]/20 pb-2 text-red-400">
                <span className="shrink-0 font-semibold">Revocation Tx Hash:</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate max-w-[220px]" title={certificate.revocationTxHash || "Revoked On-Chain"}>
                    {certificate.revocationTxHash || "Confirmed On-Chain"}
                  </span>
                  {certificate.revocationTxHash && (
                    <button
                      onClick={() => copyText(certificate.revocationTxHash)}
                      className="hover:text-red-300 shrink-0"
                      title="Copy revocation tx"
                    >
                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Issuer Wallet */}
            {blockchainData?.issuerWallet && (
              <div className="flex justify-between items-start gap-2 pt-1">
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
            {/* Download File */}
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3 rounded-lg bg-[#10b981] hover:bg-[#45dfa4] text-[#00422b] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all btn-shine cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Download Registered File
            </button>

            {/* Copy shareable link */}
            <button
              onClick={() => copyText(window.location.href)}
              className="py-3 px-5 rounded-lg bg-[#19202a] hover:bg-[#232a35] text-[#dce3f1] font-semibold text-sm flex items-center justify-center gap-2 border border-[#3c4a42]/60 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              Copy Link
            </button>

            {/* Admin Revoke Action Button */}
            {isAdmin && (
              isRevoked ? (
                <button
                  disabled
                  className="py-3 px-5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <span className="material-symbols-outlined text-[20px]">block</span>
                  Revoked
                </button>
              ) : (
                <button
                  onClick={() => setShowRevokeModal(true)}
                  disabled={revoking}
                  className="py-3 px-5 rounded-lg bg-[#2a1313] hover:bg-[#3d1818] text-[#ffb4ab] border border-red-500/40 text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                  Revoke Document
                </button>
              )
            )}
          </div>
        </div>

        {/* Revocation Confirmation Modal */}
        {showRevokeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#151c26] border border-red-500/40 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-red-400 border-b border-[#3c4a42]/30 pb-3">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <div>
                  <h3 className="font-bold text-lg text-white">Confirm Document Revocation</h3>
                  <p className="text-xs text-[#bbcabf]">Ethereum Sepolia Blockchain Action</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#dce3f1]">
                <p className="leading-relaxed">
                  Are you sure you want to revoke this document? This will submit a live revocation transaction to the Ethereum smart contract.
                </p>

                <div className="bg-[#0d141e] p-3 rounded-lg border border-[#3c4a42]/40 space-y-1 font-mono text-[11px]">
                  <p><span className="text-[#bbcabf]">Reference ID:</span> {certificate.certificateId || certificate._id}</p>
                  <p><span className="text-[#bbcabf]">Recipient:</span> {certificate.studentName}</p>
                  <p><span className="text-[#bbcabf]">Course / Title:</span> {certificate.course}</p>
                  <p className="truncate"><span className="text-[#bbcabf]">SHA-256:</span> {certificate.documentHash}</p>
                </div>

                <p className="text-[#ffb4ab] text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Once confirmed on the blockchain, this action is immutable and cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3c4a42]/30">
                <button
                  type="button"
                  disabled={revoking}
                  onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#19202a] hover:bg-[#232a35] text-[#dce3f1] font-semibold text-xs border border-[#3c4a42]/60 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={revoking}
                  onClick={handleRevokeConfirm}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {revoking ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Revoking On-Chain...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">gpp_bad</span>
                      <span>Confirm Revocation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CertificateDetails;
