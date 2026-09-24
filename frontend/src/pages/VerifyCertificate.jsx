import React, { useState, useRef } from "react";
import { certificateService } from "../services/certificateService";
import { validateSelectedFile } from "../utils/fileValidator";
import toast from "react-hot-toast";

export default function VerifyCertificate() {
  const [category, setCategory] = useState("document"); // "document" or "image"
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [calculatedHash, setCalculatedHash] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = async (selected) => {
    if (!selected) return;

    // Validate size (<= 10 MB) and category compatibility
    const validation = validateSelectedFile(selected, category);
    if (!validation.valid) {
      toast.error(validation.error);
      setFile(null);
      setCalculatedHash(null);
      return;
    }

    setFile(selected);
    setResult(null);

    // Compute SHA-256 client-side for preview
    try {
      const arrayBuffer = await selected.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      setCalculatedHash(hashHex);
    } catch (err) {
      console.error("SHA256 calculation failed", err);
    }
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error(`Please select a ${category} file first`);
      return;
    }

    // Re-validate before upload
    const validation = validateSelectedFile(file, category);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Backend: POST /api/certificates/verify
      const res = await certificateService.verifyCertificate(file, category);
      setResult(res);

      if (res.verified && res.status === "AUTHENTIC") {
        toast.success(
          res.verificationSource === "BLOCKCHAIN"
            ? "✓ Document Authentic & Verified on Ethereum!"
            : "✓ Document Authentic & Verified (Database Record)!"
        );
      } else if (res.status === "REVOKED") {
        toast.error("⚠ Document was REVOKED on-chain!");
      } else {
        toast.error("✗ Document Invalid — Hash not found on blockchain");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed. Check connection.";
      toast.error(msg);
      setResult({ verified: false, status: "ERROR", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const acceptAttribute =
    category === "image"
      ? ".jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.svg,image/*"
      : ".pdf,.doc,.docx,.txt,.rtf,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

  return (
    <div className="min-h-screen bg-[#0d141e] text-[#dce3f1] pt-24 pb-16 crypto-grid">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#151c26] border border-[#3c4a42]/40 mb-4">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">verified_user</span>
            <span className="font-mono text-xs text-[#4edea3] tracking-widest">STANDALONE VERIFICATION CONSOLE</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
            Cryptographic Document Check
          </h1>
          <p className="text-[#bbcabf] max-w-xl mx-auto text-sm leading-relaxed">
            Upload the exact original document or image. We compute its SHA-256 byte digest and query it against the Ethereum smart contract — no ID or text input required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Upload Card */}
          <div className="bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/40 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3]">upload_file</span>
              Upload & Verify File
            </h2>

            {/* Category Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#dce3f1] mb-2">What do you want to verify?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCategory("document");
                    setFile(null);
                    setCalculatedHash(null);
                    setResult(null);
                  }}
                  className={`py-2.5 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                    category === "document"
                      ? "bg-[#10b981]/20 border-[#10b981] text-[#4edea3] shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "bg-[#0d141e] border-[#3c4a42]/60 text-[#bbcabf] hover:border-[#4edea3]/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  Document
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("image");
                    setFile(null);
                    setCalculatedHash(null);
                    setResult(null);
                  }}
                  className={`py-2.5 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                    category === "image"
                      ? "bg-[#10b981]/20 border-[#10b981] text-[#4edea3] shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "bg-[#0d141e] border-[#3c4a42]/60 text-[#bbcabf] hover:border-[#4edea3]/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">image</span>
                  Image
                </button>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center bg-[#0d141e]/50 transition-all cursor-pointer ${
                  dragging
                    ? "border-[#4edea3] bg-[#10b981]/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "border-[#3c4a42]/60 hover:border-[#4edea3]/60"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <span className="material-symbols-outlined text-4xl text-[#4edea3] mb-2 block">
                  {category === "image" ? "image" : "picture_as_pdf"}
                </span>
                <p className="text-sm font-semibold text-white">
                  {file ? file.name : `Click or Drag ${category === "image" ? "Image" : "Document"} Here`}
                </p>
                <p className="text-xs text-[#bbcabf]/70 mt-1">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB — Ready to verify`
                    : category === "image"
                    ? "JPG, PNG, WEBP, GIF, BMP, TIFF, SVG up to 10 MB"
                    : "PDF, DOC, DOCX, TXT, RTF, ODT up to 10 MB"}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={acceptAttribute}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* SHA-256 Preview */}
              {calculatedHash && (
                <div className="p-3 bg-[#0d141e] rounded-lg border border-[#3c4a42]/40 text-xs font-mono">
                  <span className="text-[#bbcabf] font-sans block mb-1">
                    Calculated SHA-256 Digest (client-side preview):
                  </span>
                  <span className="text-[#4edea3] break-all">{calculatedHash}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className="w-full py-3 bg-[#10b981] hover:bg-[#45dfa4] text-[#00422b] font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-shine cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#00422b] border-t-transparent rounded-full animate-spin"></span>
                    Querying Ethereum Blockchain...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">fact_check</span>
                    Verify File Bytes on Blockchain
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Card */}
          <div className="bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/40 shadow-xl min-h-[300px]">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3]">travel_explore</span>
              Blockchain Verification Result
            </h2>

            {/* Idle state */}
            {!result && !loading && (
              <div className="py-10 text-center text-[#bbcabf]/50">
                <span className="material-symbols-outlined text-5xl block mb-3">plagiarism</span>
                <p className="text-sm">
                  Upload a document or image and click verify to query the Ethereum smart contract ledger.
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="py-10 text-center text-[#4edea3]">
                <div className="w-10 h-10 border-2 border-[#4edea3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-medium">Computing SHA-256 & Searching Blockchain...</p>
                <p className="text-xs text-[#bbcabf] mt-1">This may take a few seconds</p>
              </div>
            )}

            {/* AUTHENTIC result */}
            {result && !loading && result.verified && result.status === "AUTHENTIC" && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10b981]/15 text-[#4edea3] border border-[#4edea3]/40 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                  ✓ {result.verificationSource === "BLOCKCHAIN" ? "Authentic & Verified on Ethereum" : "Authentic & Verified (Database)"}
                </div>
                {result.message && (
                  <p className="text-xs text-[#bbcabf] italic">{result.message}</p>
                )}

                <div className="space-y-2 text-xs">
                  {[
                    ["Recipient / Subject", result.certificate?.studentName],
                    ["Document / Course", result.certificate?.course],
                    ["Issuing Institution", result.certificate?.institution],
                    ["Issue Date", result.certificate?.issueDate ? new Date(result.certificate.issueDate).toLocaleDateString("en-IN") : "N/A"],
                    ["Category", (result.certificate?.fileCategory || category).toUpperCase()],
                    ["File Name", result.certificate?.fileName || file?.name || "N/A"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-[#3c4a42]/20 pb-1.5">
                      <span className="text-[#bbcabf]">{label}:</span>
                      <span className="font-semibold text-white text-right max-w-[60%]">{value || "N/A"}</span>
                    </div>
                  ))}
                </div>

                {result.blockchainProof?.transactionHash && (
                  <div className="p-2 bg-[#0d141e] rounded border border-[#3c4a42]/40 text-xs font-mono">
                    <span className="text-[#bbcabf] block mb-0.5">Ethereum Tx Hash:</span>
                    <span className="text-[#4edea3] break-all">{result.blockchainProof.transactionHash}</span>
                  </div>
                )}
              </div>
            )}

            {/* REVOKED result */}
            {result && !loading && result.status === "REVOKED" && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Revoked On-Chain by Authority
                </div>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  This document hash exists in the contract registry but was marked REVOKED by the issuing authority administrator.
                </p>
                <div className="p-2 bg-[#0d141e] rounded border border-yellow-500/20 text-xs font-mono text-[#bbcabf]">
                  Hash: <span className="text-yellow-400 break-all">{result.uploadedDocumentHash}</span>
                </div>
              </div>
            )}

            {/* INVALID / NOT FOUND result */}
            {result && !loading && (result.status === "INVALID" || result.status === "ERROR") && (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">gpp_bad</span>
                  Hash Unregistered / Not Found
                </div>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  {result.message || "The SHA-256 byte digest of the uploaded file does not match any registered document on the Ethereum blockchain."}
                </p>
                {result.uploadedDocumentHash && (
                  <div className="p-2 bg-[#0d141e] rounded border border-red-500/20 text-xs font-mono">
                    <span className="text-[#bbcabf] block mb-0.5">Checked hash:</span>
                    <span className="text-red-400 break-all">{result.uploadedDocumentHash}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
