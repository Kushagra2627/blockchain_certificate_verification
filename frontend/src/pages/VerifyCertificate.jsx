import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import { certificateService } from "../services/certificateService";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, UploadCloud, FileText, ChevronDown, ChevronUp, User, Building, Calendar, Award, Cpu } from "lucide-react";
import { formatDate, shortenAddress } from "../utils/formatters";

const VerifyCertificate = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setVerificationResult(null);
      } else {
        alert("Please select a valid PDF file");
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setVerificationResult(null);
      } else {
        alert("Please drop a valid PDF file");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setLoading(true);
      setVerificationResult(null);
      const res = await certificateService.verifyCertificate(selectedFile);
      setVerificationResult(res);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        verified: false,
        status: "VERIFICATION_ERROR",
        message: error.response?.data?.message || "Failed to communicate with verification backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" /> Blockchain PDF Verification Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload the original certificate PDF to verify its authenticity directly against the Ethereum blockchain.
          </p>
        </div>

        {/* PDF Upload Card */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-indigo-400 bg-indigo-500/10"
                : selectedFile
                ? "border-emerald-500/60 bg-emerald-950/10"
                : "border-slate-700 hover:border-slate-500 bg-slate-900/40"
            }`}
            onClick={() => document.getElementById("pdfInput").click()}
          >
            <input
              id="pdfInput"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-slate-100 font-semibold text-sm truncate max-w-md">{selectedFile.name}</p>
                  <p className="text-slate-400 text-xs font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document Ready
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto opacity-80" />
                <div>
                  <p className="text-slate-200 font-medium text-sm">
                    Drop your certificate PDF here, or <span className="text-indigo-400 underline">browse</span>
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Only official PDF files supported (Max 10 MB)</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedFile || loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Calculating SHA-256 & Querying Blockchain..." : "Verify PDF Authenticity"}
          </button>
        </form>

        {loading && <LoadingSpinner label="Computing SHA-256 Hash & Checking Ethereum Node..." />}

        {verificationResult && (
          <div className="space-y-6 animate-fadeIn">
            {/* AUTHENTIC RESULT */}
            {verificationResult.status === "AUTHENTIC" && (
              <div className="glass-panel p-8 rounded-2xl border border-emerald-500/50 bg-emerald-950/20 shadow-2xl space-y-6">
                <div className="flex items-start gap-4 pb-6 border-b border-emerald-500/20">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                      ✓ Authentic Certificate
                    </span>
                    <h2 className="text-2xl font-black text-slate-100 mt-2">Document Verified Successfully</h2>
                    <p className="text-slate-300 text-sm mt-1">
                      The uploaded PDF matches the cryptographic certificate record anchored on the Ethereum blockchain.
                    </p>
                  </div>
                </div>

                {/* Certificate Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm pt-2">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <User className="w-4 h-4 text-emerald-400" /> Student Name
                    </span>
                    <p className="text-slate-100 font-bold text-base">{verificationResult.certificate.studentName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Award className="w-4 h-4 text-emerald-400" /> Course / Degree
                    </span>
                    <p className="text-slate-100 font-bold text-base">{verificationResult.certificate.course}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Building className="w-4 h-4 text-emerald-400" /> Institution
                    </span>
                    <p className="text-slate-100 font-semibold">{verificationResult.certificate.institution}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-4 h-4 text-emerald-400" /> Issue Date
                    </span>
                    <p className="text-slate-200 font-mono">{formatDate(verificationResult.certificate.issueDate)}</p>
                  </div>
                </div>

                {/* Expandable Advanced Blockchain Proof */}
                <div className="border-t border-slate-800 pt-4">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-xs font-mono text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Advanced Blockchain Proof Details
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2 text-slate-300 animate-fadeIn">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Document SHA-256 Hash:</span>
                        <span className="text-emerald-400 break-all">{verificationResult.uploadedDocumentHash}</span>
                      </div>
                      {verificationResult.blockchainProof?.issuerWallet && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Issuer Wallet Address:</span>
                          <span className="text-slate-300">{verificationResult.blockchainProof.issuerWallet}</span>
                        </div>
                      )}
                      {verificationResult.blockchainProof?.transactionHash && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Transaction Hash:</span>
                          <span className="text-indigo-400">{verificationResult.blockchainProof.transactionHash}</span>
                        </div>
                      )}
                      {verificationResult.certificate?.certificateId && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Certificate Reference ID:</span>
                          <span className="text-slate-400">{verificationResult.certificate.certificateId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INVALID / TAMPERED RESULT */}
            {verificationResult.status === "INVALID" && (
              <div className="glass-panel p-8 rounded-2xl border border-red-500/50 bg-red-950/20 shadow-2xl space-y-4">
                <div className="flex items-start gap-4">
                  <XCircle className="w-12 h-12 text-red-400 shrink-0 mt-1" />
                  <div>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-mono font-bold uppercase tracking-wider border border-red-500/30">
                      ✗ Invalid / Tampered Certificate
                    </span>
                    <h2 className="text-2xl font-black text-slate-100 mt-2">Verification Failed</h2>
                    <p className="text-slate-300 text-sm mt-1">
                      The SHA-256 hash of this PDF document does not match any certificate anchored on the Ethereum blockchain.
                    </p>
                    <p className="text-red-400/80 text-xs mt-2 font-mono">
                      Calculated Hash: {verificationResult.uploadedDocumentHash}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* REVOKED RESULT */}
            {verificationResult.status === "REVOKED" && (
              <div className="glass-panel p-8 rounded-2xl border border-amber-500/50 bg-amber-950/20 shadow-2xl space-y-4">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-12 h-12 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider border border-amber-500/30">
                      ⚠ Certificate Revoked
                    </span>
                    <h2 className="text-2xl font-black text-slate-100 mt-2">Certificate Has Been Revoked</h2>
                    <p className="text-slate-300 text-sm mt-1">
                      This PDF document was previously anchored on the blockchain, but the issuing institution has officially revoked it.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyCertificate;
