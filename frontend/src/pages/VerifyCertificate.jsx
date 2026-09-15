import React, { useState } from "react";
import { certificateService } from "../services/certificateService";
import { formatDate } from "../utils/formatters";
import toast from "react-hot-toast";

const VerifyCertificate = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setVerificationResult(null);
      } else {
        toast.error("Please select a valid PDF file");
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
        toast.error("Please drop a valid PDF file");
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

  const clearLoadedFile = () => {
    setSelectedFile(null);
    setVerificationResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload a PDF certificate first!");
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);
      const res = await certificateService.verifyCertificate(selectedFile);
      setVerificationResult(res);

      if (res.status === "AUTHENTIC") {
        toast.success("✓ Certificate Authentic & Verified on Blockchain!");
      } else if (res.status === "REVOKED") {
        toast.error("⚠ Certificate Has Been Revoked!");
      } else {
        toast.error("✗ Invalid / Tampered Certificate!");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to communicate with verification backend.");
      setVerificationResult({
        verified: false,
        status: "INVALID",
        message: error.response?.data?.message || "Document SHA-256 not found on blockchain.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif] min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">verified_user</span>
            <span className="font-mono text-xs text-[#4edea3] tracking-wider uppercase">ETHEREUM PDF VERIFICATION ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#dce3f1] tracking-tight">
            Verify Certificate Authenticity
          </h1>
          <p className="text-sm text-[#bbcabf] max-w-xl mx-auto">
            Upload the official PDF certificate. The SHA-256 digest is computed in client memory and queried directly against Ethereum smart contracts.
          </p>
        </div>

        {/* PDF Ingestion Form */}
        <form onSubmit={handleSubmit} className="bg-[#151c26] p-8 rounded-xl border border-[#3c4a42]/40 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#3c4a42]/30">
            <h3 className="text-base font-semibold text-[#dce3f1]">Document Ingestion</h3>
            <span className="px-2.5 py-0.5 rounded bg-[#19202a] border border-[#3c4a42]/40 font-mono text-xs text-[#4edea3] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              Client-Side SHA-256 Engine
            </span>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById("verifyPagePdfInput").click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center bg-[#0d141e]/50 cursor-pointer dropzone-pulse transition-all ${
              isDragOver
                ? "border-[#4edea3] bg-[#10b981]/10"
                : selectedFile
                ? "border-[#4edea3]/80 bg-[#10b981]/5"
                : "border-[#3c4a42]/60 hover:border-[#4edea3]/70"
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-[#232a35] border border-[#3c4a42]/50 flex items-center justify-center text-[#4edea3] dropzone-icon transition-transform">
              <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-[#dce3f1]">
                {selectedFile ? selectedFile.name : "Drag & drop your certificate PDF here, or browse"}
              </p>
              <p className="text-xs text-[#bbcabf] mt-1">
                Zero-Knowledge Privacy: Raw PDF file is never stored or sent across the network
              </p>
            </div>
            <input
              id="verifyPagePdfInput"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="p-3.5 rounded-lg bg-[#19202a] border border-[#4edea3]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="material-symbols-outlined text-[#4edea3] text-[22px]">description</span>
                <div className="min-w-0 font-mono text-xs">
                  <div className="font-semibold text-[#dce3f1] truncate">{selectedFile.name}</div>
                  <div className="text-[#bbcabf] mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB • PDF Document Loaded</div>
                </div>
              </div>
              <button
                type="button"
                onClick={clearLoadedFile}
                className="px-2.5 py-1 rounded bg-[#232a35] hover:bg-[#2e3540] text-[#ffb4ab] text-xs font-mono border border-[#3c4a42]/40"
              >
                Clear
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || loading}
            className="w-full py-3.5 bg-[#10b981] hover:bg-[#45dfa4] text-[#00422b] font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-shine"
          >
            <span className="material-symbols-outlined text-[20px]">
              {loading ? "hourglass_empty" : "fact_check"}
            </span>
            <span>{loading ? "Computing SHA-256 & Checking Ethereum Node..." : "Verify Certificate Authenticity"}</span>
          </button>
        </form>

        {/* Verification Result Output */}
        {verificationResult && (
          <div className="space-y-6">
            {/* AUTHENTIC RESULT */}
            {verificationResult.status === "AUTHENTIC" && (
              <div className="p-8 rounded-xl bg-[#151c26] border border-[#4edea3]/50 shadow-[0_0_25px_rgba(16,185,129,0.15)] space-y-6">
                <div className="flex items-start gap-4 pb-6 border-b border-[#3c4a42]/30">
                  <span className="material-symbols-outlined text-4xl text-[#4edea3]">verified</span>
                  <div>
                    <span className="px-3 py-1 rounded bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30 text-xs font-mono font-bold uppercase">
                      ✓ Authentic Certificate
                    </span>
                    <h2 className="text-2xl font-bold text-[#dce3f1] mt-2">Document Verified Successfully</h2>
                    <p className="text-xs text-[#bbcabf] mt-1">
                      The uploaded PDF hash matches the cryptographically signed record anchored on Ethereum.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-2">
                  <div className="space-y-1">
                    <span className="text-[#bbcabf] font-medium">Student Name</span>
                    <p className="text-[#dce3f1] font-bold text-base">{verificationResult.certificate?.studentName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#bbcabf] font-medium">Course / Degree</span>
                    <p className="text-[#dce3f1] font-bold text-base">{verificationResult.certificate?.course}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#bbcabf] font-medium">Issuing Institution</span>
                    <p className="text-[#dce3f1] font-semibold">{verificationResult.certificate?.institution}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#bbcabf] font-medium">Issue Date</span>
                    <p className="text-[#dce3f1] font-mono">{formatDate(verificationResult.certificate?.issueDate)}</p>
                  </div>
                </div>

                {/* Advanced Proof details */}
                <div className="border-t border-[#3c4a42]/30 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 font-mono text-xs text-[#4edea3] hover:underline font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showAdvanced ? "expand_less" : "expand_more"}
                    </span>
                    Advanced Cryptographic & Blockchain Proof
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-4 rounded-xl bg-[#0d141e] border border-[#3c4a42]/40 font-mono text-xs space-y-2 text-[#dce3f1]">
                      <div className="flex justify-between items-center">
                        <span className="text-[#bbcabf]">Document SHA-256 Digest:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#4edea3] truncate max-w-xs">{verificationResult.uploadedDocumentHash}</span>
                          <button onClick={() => copyText(verificationResult.uploadedDocumentHash)} className="text-[#bbcabf] hover:text-[#4edea3]">
                            <span className="material-symbols-outlined text-[15px]">content_copy</span>
                          </button>
                        </div>
                      </div>

                      {verificationResult.blockchainProof?.issuerWallet && (
                        <div className="flex justify-between">
                          <span className="text-[#bbcabf]">Issuer Wallet Address:</span>
                          <span>{verificationResult.blockchainProof.issuerWallet}</span>
                        </div>
                      )}

                      {verificationResult.blockchainProof?.transactionHash && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#bbcabf]">Ethereum Tx Hash:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#6ffbbe]">{verificationResult.blockchainProof.transactionHash}</span>
                            <button onClick={() => copyText(verificationResult.blockchainProof.transactionHash)} className="text-[#bbcabf] hover:text-[#4edea3]">
                              <span className="material-symbols-outlined text-[15px]">content_copy</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INVALID RESULT */}
            {verificationResult.status === "INVALID" && (
              <div className="p-8 rounded-xl bg-[#151c26] border border-[#ffb4ab]/50 shadow-xl space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-4xl text-[#ffb4ab]">gpp_bad</span>
                  <div>
                    <span className="px-3 py-1 rounded bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 text-xs font-mono font-bold uppercase">
                      ✗ Invalid / Tampered Certificate
                    </span>
                    <h2 className="text-2xl font-bold text-[#dce3f1] mt-2">Verification Failed</h2>
                    <p className="text-xs text-[#bbcabf] mt-1 leading-relaxed">
                      The SHA-256 hash of this PDF document does not match any certificate anchored on the Ethereum smart contract registry.
                    </p>
                    <p className="text-[#ffb4ab] font-mono text-xs mt-3 break-all bg-[#0d141e] p-2.5 rounded border border-[#3c4a42]/40">
                      Calculated SHA-256 Digest: {verificationResult.uploadedDocumentHash || "UNREGISTERED"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* REVOKED RESULT */}
            {verificationResult.status === "REVOKED" && (
              <div className="p-8 rounded-xl bg-[#151c26] border border-yellow-500/50 shadow-xl space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-4xl text-yellow-400">warning</span>
                  <div>
                    <span className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-mono font-bold uppercase">
                      ⚠ Certificate Revoked
                    </span>
                    <h2 className="text-2xl font-bold text-[#dce3f1] mt-2">Certificate Has Been Revoked</h2>
                    <p className="text-xs text-[#bbcabf] mt-1 leading-relaxed">
                      This PDF document was previously anchored on the blockchain, but the issuing authority has officially revoked it on-chain.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
