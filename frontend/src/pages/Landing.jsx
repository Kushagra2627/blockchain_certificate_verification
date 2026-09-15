import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { certificateService } from "../services/certificateService";
import toast from "react-hot-toast";

const Landing = () => {
  const location = useLocation();

  // Verification Console State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [activeTab, setActiveTab] = useState("authentic"); // 'authentic' | 'invalid' | 'revoked'
  const [copiedTx, setCopiedTx] = useState(false);

  // Smooth scroll to section if state contains scrollTo target
  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  // File Upload Handlers
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

  // Real backend PDF verification trigger
  const executeVerification = async () => {
    if (!selectedFile) {
      toast.error("Please select or drop a PDF certificate first!");
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);
      const res = await certificateService.verifyCertificate(selectedFile);
      setVerificationResult(res);

      if (res.status === "AUTHENTIC") {
        setActiveTab("authentic");
        toast.success("✓ Certificate Authentic & Verified!");
      } else if (res.status === "REVOKED") {
        setActiveTab("revoked");
        toast.error("⚠ Certificate Has Been Revoked!");
      } else {
        setActiveTab("invalid");
        toast.error("✗ Invalid / Tampered Certificate!");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify document hash against blockchain.");
      setVerificationResult({
        verified: false,
        status: "INVALID",
        message: error.response?.data?.message || "Document SHA-256 not found on blockchain.",
      });
      setActiveTab("invalid");
    } finally {
      setLoading(false);
    }
  };

  // Load interactive demo samples
  const loadSampleFile = (type) => {
    setActiveTab(type);
    setVerificationResult(null);
    if (type === "authentic") {
      toast.success("Loaded Authentic Sample: Stanford Degree");
    } else if (type === "invalid") {
      toast.error("Loaded Invalid Sample: Tampered Diploma");
    } else if (type === "revoked") {
      toast("Loaded Revoked Sample: Flagged Credential", { icon: "⚠️" });
    }
  };

  const copyTxHash = (hashText) => {
    navigator.clipboard.writeText(hashText);
    setCopiedTx(true);
    toast.success("Transaction hash copied to clipboard!");
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif] antialiased selection:bg-[#10b981] selection:text-[#00422b] min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-[#3c4a42]/20 crypto-grid" id="hero-section">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-mesh-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-mesh-pulse" style={{ animationDelay: "4s" }}></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40 hover:border-[#4edea3]/40 transition-colors shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981] radar-beacon"></span>
                </span>
                <span className="font-mono text-xs text-[#4edea3] tracking-wider">PROTOCOL v0.8.20 • ETHEREUM ANCHORED</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#dce3f1] tracking-tight leading-tight">
                Academic Credentials, Secured by Blockchain.
              </h1>

              <p className="text-base sm:text-lg text-[#bbcabf] max-w-2xl leading-relaxed">
                Verify academic certificates using cryptographic document hashing and blockchain-backed records. Discard tampering and credential fraud through decentralized verification.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => scrollToSection("verify")}
                  className="px-6 py-3 bg-[#10b981] hover:bg-[#45dfa4] transition-all duration-200 text-[#00422b] text-sm font-semibold rounded-lg flex items-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.4)] active:scale-95 btn-shine cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">file_open</span>
                  <span>Verify a Certificate</span>
                </button>

                <button
                  onClick={() => scrollToSection("student-locker")}
                  className="px-6 py-3 bg-[#19202a] border border-[#3c4a42]/60 hover:bg-[#232a35] hover:border-[#4edea3]/60 transition-all duration-200 text-[#dce3f1] text-sm font-medium rounded-lg flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#4edea3]">lock</span>
                  <span>Student Locker</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#3c4a42]/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-[#bbcabf] text-xs hover:text-[#4edea3] transition-colors cursor-default group">
                  <span className="material-symbols-outlined text-[#4edea3] text-[18px] group-hover:scale-110 transition-transform">shield</span>
                  <span>Tamper Resistant</span>
                </div>
                <div className="flex items-center gap-2 text-[#bbcabf] text-xs hover:text-[#4edea3] transition-colors cursor-default group">
                  <span className="material-symbols-outlined text-[#4edea3] text-[18px] group-hover:scale-110 transition-transform">bolt</span>
                  <span>Instant Verification</span>
                </div>
                <div className="flex items-center gap-2 text-[#bbcabf] text-xs hover:text-[#4edea3] transition-colors cursor-default group">
                  <span className="material-symbols-outlined text-[#4edea3] text-[18px] group-hover:scale-110 transition-transform">link</span>
                  <span>Blockchain Secured</span>
                </div>
                <div className="flex items-center gap-2 text-[#bbcabf] text-xs hover:text-[#4edea3] transition-colors cursor-default group">
                  <span className="material-symbols-outlined text-[#4edea3] text-[18px] group-hover:scale-110 transition-transform">verified</span>
                  <span>Trusted Credentials</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: 3D Rotating Blockchain Cube & Satellite Orbit */}
            <div className="lg:col-span-5 flex justify-center items-center py-10 lg:py-0">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center cube-scene cube-container-float">
                {/* Orbital Satellite Ring */}
                <div className="absolute inset-0 flex items-center justify-center satellite-ring pointer-events-none">
                  <div className="absolute top-0 px-2 py-1 bg-[#2e3540]/90 backdrop-blur-sm border border-[#4edea3]/60 rounded text-[#4edea3] font-mono text-xs shadow-[0_0_12px_rgba(78,222,163,0.3)] flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
                    </span>
                    <span>BLOCK #194829</span>
                  </div>

                  <div className="absolute bottom-2 px-2 py-1 bg-[#2e3540]/90 backdrop-blur-sm border border-[#3c4a42] rounded text-[#bbcabf] font-mono text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-[#4edea3] animate-pulse">hub</span>
                    <span>VALIDATOR 0x4B</span>
                  </div>

                  <div className="absolute left-0 px-2 py-1 bg-[#2e3540]/90 backdrop-blur-sm border border-[#3c4a42] rounded text-[#bbcabf] font-mono text-xs">
                    <span>SHA-256</span>
                  </div>

                  <div className="absolute right-0 px-2 py-1 bg-[#2e3540]/90 backdrop-blur-sm border border-[#4edea3]/50 rounded text-[#4edea3] font-mono text-xs shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                    <span>CONSENSUS</span>
                  </div>
                </div>

                {/* SVG Interlink Orbit Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#4edea3]/30" fill="none" viewBox="0 0 320 320">
                  <circle className="opacity-50" cx="160" cy="160" r="120" strokeDasharray="4 4"></circle>
                  <line className="opacity-60" strokeDasharray="2 2" x1="160" x2="160" y1="160" y2="28"></line>
                  <line className="opacity-60" strokeDasharray="2 2" x1="160" x2="160" y1="160" y2="295"></line>
                  <line className="opacity-60" strokeDasharray="2 2" x1="160" x2="35" y1="160" y2="160"></line>
                  <line className="opacity-60" strokeDasharray="2 2" x1="160" x2="285" y1="160" y2="160"></line>
                </svg>

                {/* 3D Rotating Cube */}
                <div className="cube-wrapper">
                  <div className="cube-face front">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[#4edea3] text-2xl drop-shadow-[0_0_8px_rgba(78,222,163,0.6)]">deployed_code</span>
                      <div className="font-mono text-xs text-[#4edea3] font-medium tracking-tight mt-1">0x7F...2B</div>
                    </div>
                  </div>
                  <div className="cube-face back">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[#45dfa4] text-2xl drop-shadow-[0_0_8px_rgba(69,223,164,0.6)]">token</span>
                      <div className="font-mono text-xs text-[#6ffbbe] mt-1">STATE ROOT</div>
                    </div>
                  </div>
                  <div className="cube-face right">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[#4edea3] text-2xl drop-shadow-[0_0_8px_rgba(78,222,163,0.6)]">lock</span>
                      <div className="font-mono text-xs text-[#4edea3] mt-1">MERKLE</div>
                    </div>
                  </div>
                  <div className="cube-face left">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[#4edea3] text-2xl drop-shadow-[0_0_8px_rgba(78,222,163,0.6)]">fingerprint</span>
                      <div className="font-mono text-xs text-[#4edea3] mt-1">0x3A...9C</div>
                    </div>
                  </div>
                  <div className="cube-face top">
                    <div className="font-mono text-[10px] text-[#4edea3]">EVM LEDGER</div>
                  </div>
                  <div className="cube-face bottom">
                    <div className="font-mono text-[10px] text-[#4edea3]">IMMUTABLE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW CERTIFICATE VERIFICATION WORKS ================= */}
      <section className="py-20 bg-[#080f18] border-b border-[#3c4a42]/20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40 mb-3 hover:border-[#4edea3]/40 transition-colors">
              <span className="text-xs font-semibold text-[#4edea3] tracking-wider uppercase">Cryptographic Process</span>
            </div>
            <h2 className="text-3xl font-semibold text-[#dce3f1] tracking-tight">
              How Certificate Verification Works
            </h2>
            <p className="text-sm text-[#bbcabf] mt-3">
              VeritasLedger decouples private data from the public blockchain. Only standard mathematical digest proofs are queried.
            </p>
          </div>

          {/* 4 Structured Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 flex flex-col justify-between group cursor-default">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-semibold text-[#4edea3] px-2.5 py-1 rounded bg-[#19202a] border border-[#4edea3]/20 group-hover:border-[#4edea3]/50 group-hover:shadow-[0_0_10px_rgba(78,222,163,0.2)] transition-all">01</span>
                  <span className="material-symbols-outlined text-[#bbcabf] group-hover:text-[#4edea3] group-hover:scale-110 transition-all">upload_file</span>
                </div>
                <h3 className="text-lg font-semibold text-[#dce3f1] mb-2 group-hover:text-[#6ffbbe] transition-colors">Upload Certificate</h3>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  Upload the original PDF certificate issued by the institution directly into the local verification client.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#3c4a42]/20 font-mono text-xs text-[#bbcabf]/70 flex items-center justify-between">
                <span>Document stays client-side</span>
                <span className="material-symbols-outlined text-[14px] text-[#4edea3] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 flex flex-col justify-between group cursor-default">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-semibold text-[#4edea3] px-2.5 py-1 rounded bg-[#19202a] border border-[#4edea3]/20 group-hover:border-[#4edea3]/50 group-hover:shadow-[0_0_10px_rgba(78,222,163,0.2)] transition-all">02</span>
                  <span className="material-symbols-outlined text-[#bbcabf] group-hover:text-[#4edea3] group-hover:scale-110 transition-all">calculate</span>
                </div>
                <h3 className="text-lg font-semibold text-[#dce3f1] mb-2 group-hover:text-[#6ffbbe] transition-colors">Generate Hash</h3>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  Generate a unique 256-bit cryptographic digest (SHA-256) directly from the raw binary data of the PDF.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#3c4a42]/20 font-mono text-xs text-[#bbcabf]/70 flex items-center justify-between">
                <span>One-way mathematical digest</span>
                <span className="material-symbols-outlined text-[14px] text-[#4edea3] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 flex flex-col justify-between group cursor-default">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-semibold text-[#4edea3] px-2.5 py-1 rounded bg-[#19202a] border border-[#4edea3]/20 group-hover:border-[#4edea3]/50 group-hover:shadow-[0_0_10px_rgba(78,222,163,0.2)] transition-all">03</span>
                  <span className="material-symbols-outlined text-[#bbcabf] group-hover:text-[#4edea3] group-hover:scale-110 transition-all">search_check</span>
                </div>
                <h3 className="text-lg font-semibold text-[#dce3f1] mb-2 group-hover:text-[#6ffbbe] transition-colors">Verify on Blockchain</h3>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  Compare the document hash with the immutable decentralized smart contract registry anchored to Ethereum.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#3c4a42]/20 font-mono text-xs text-[#bbcabf]/70 flex items-center justify-between">
                <span>Decentralized RPC state call</span>
                <span className="material-symbols-outlined text-[14px] text-[#4edea3] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 flex flex-col justify-between group cursor-default">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-semibold text-[#4edea3] px-2.5 py-1 rounded bg-[#19202a] border border-[#4edea3]/20 group-hover:border-[#4edea3]/50 group-hover:shadow-[0_0_10px_rgba(78,222,163,0.2)] transition-all">04</span>
                  <span className="material-symbols-outlined text-[#bbcabf] group-hover:text-[#4edea3] group-hover:scale-110 transition-all">fact_check</span>
                </div>
                <h3 className="text-lg font-semibold text-[#dce3f1] mb-2 group-hover:text-[#6ffbbe] transition-colors">Get Result</h3>
                <p className="text-xs text-[#bbcabf] leading-relaxed">
                  Receive an Authentic, Invalid, or Revoked confirmation along with institutional issuer signature metadata.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#3c4a42]/20 font-mono text-xs text-[#bbcabf]/70 flex items-center justify-between">
                <span>Instant verdict & timestamps</span>
                <span className="material-symbols-outlined text-[14px] text-[#4edea3] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Verification Pipeline Animated Stream */}
          <div className="mt-12 bg-[#19202a] p-4 md:p-6 rounded-xl border border-[#3c4a42]/30 pipeline-container shadow-inner">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-center relative z-10">
              <div className="flex items-center gap-2 text-[#dce3f1] group cursor-default">
                <span className="px-2.5 py-1.5 bg-[#232a35] rounded border border-[#3c4a42]/50 group-hover:border-[#4edea3]/60 transition-colors shadow-sm">ORIGINAL PDF</span>
              </div>
              <span className="material-symbols-outlined text-[#4edea3] rotate-90 md:rotate-0 pipeline-arrow">arrow_forward</span>
              <div className="flex items-center gap-2 text-[#dce3f1] group cursor-default">
                <span className="px-2.5 py-1.5 bg-[#232a35] rounded border border-[#3c4a42]/50 group-hover:border-[#4edea3]/60 transition-colors shadow-sm">SHA-256 ENGINE</span>
              </div>
              <span className="material-symbols-outlined text-[#4edea3] rotate-90 md:rotate-0 pipeline-arrow" style={{ animationDelay: "0.5s" }}>arrow_forward</span>
              <div className="flex items-center gap-2 text-[#4edea3] group cursor-default">
                <span className="px-3 py-1.5 bg-[#4edea3]/10 rounded border border-[#4edea3]/40 group-hover:bg-[#4edea3]/20 transition-colors shadow-[0_0_12px_rgba(78,222,163,0.15)] font-semibold">DOCUMENT HASH</span>
              </div>
              <span className="material-symbols-outlined text-[#4edea3] rotate-90 md:rotate-0 pipeline-arrow" style={{ animationDelay: "1s" }}>arrow_forward</span>
              <div className="flex items-center gap-2 text-[#dce3f1] group cursor-default">
                <span className="px-2.5 py-1.5 bg-[#232a35] rounded border border-[#3c4a42]/50 group-hover:border-[#4edea3]/60 transition-colors shadow-sm">ETHEREUM REGISTRY</span>
              </div>
              <span className="material-symbols-outlined text-[#4edea3] rotate-90 md:rotate-0 pipeline-arrow" style={{ animationDelay: "1.5s" }}>arrow_forward</span>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/50 rounded font-semibold shadow-[0_0_16px_rgba(16,185,129,0.2)]">VERDICT REACHED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PUBLIC VERIFICATION CONSOLE ================= */}
      <section className="py-20 border-b border-[#3c4a42]/20 relative" id="verify">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40 mb-3 hover:border-[#4edea3]/40 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-[#4edea3]">verified_user</span>
              <span className="text-xs font-semibold text-[#4edea3] tracking-wider uppercase">PUBLIC VERIFICATION CONSOLE</span>
            </div>
            <h2 className="text-3xl font-semibold text-[#dce3f1] tracking-tight">
              Verify a Certificate
            </h2>
            <p className="text-sm text-[#bbcabf] mt-2">
              Strict cryptographic compliance: verification is triggered exclusively by original document byte verification. No ID or name inputs are required or accepted.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: PDF Drag-and-Drop Area (6 cols) */}
            <div className="lg:col-span-6 bg-[#151c26] p-8 rounded-xl border border-[#3c4a42]/40 shadow-sm transition-all hover:border-[#3c4a42]/70">
              <div className="text-left mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#dce3f1]">Document Ingestion</h3>
                  <span className="px-2.5 py-0.5 rounded bg-[#19202a] border border-[#3c4a42]/40 font-mono text-xs text-[#4edea3] flex items-center gap-1.5 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
                    </span>
                    Client-Side Engine
                  </span>
                </div>
                <p className="text-xs text-[#bbcabf] mt-1">Upload the official conferred PDF certificate file directly from your device.</p>
              </div>

              {/* Dropzone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("landingPdfInput").click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center bg-[#0d141e]/50 cursor-pointer dropzone-pulse ${
                  isDragOver
                    ? "border-[#4edea3] bg-[#10b981]/10"
                    : selectedFile
                    ? "border-[#4edea3]/80 bg-[#10b981]/5"
                    : "border-[#3c4a42]/60 hover:border-[#4edea3]/70"
                }`}
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-[#232a35] border border-[#3c4a42]/50 flex items-center justify-center text-[#4edea3] dropzone-icon transition-transform duration-200 shadow-sm">
                  <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-[#dce3f1] hover:text-[#4edea3] transition-colors">
                    {selectedFile ? selectedFile.name : "Drag & drop your certificate here or click to browse"}
                  </p>
                  <p className="text-xs text-[#bbcabf] mt-1">
                    Local SHA-256 checksum is computed instantly in browser memory
                  </p>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#19202a] border border-[#3c4a42]/50 text-[#bbcabf] font-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                  <span>PDF • Maximum 10 MB</span>
                </div>
                <input
                  id="landingPdfInput"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Active Loaded File Banner */}
              {selectedFile && (
                <div className="mt-4 p-3.5 rounded-lg bg-[#19202a] border border-[#4edea3]/30 flex items-center justify-between gap-3 shadow-sm transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-[#4edea3] text-[22px] shrink-0">description</span>
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-[#dce3f1] truncate">
                        {selectedFile.name}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#bbcabf] mt-0.5">
                        <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span className="text-[#4edea3]">PDF Ready</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearLoadedFile}
                    className="px-2.5 py-1 rounded hover:bg-[#2e3540] text-[#bbcabf] hover:text-[#ffb4ab] font-mono text-xs border border-[#3c4a42]/30 flex items-center gap-1 transition-all shrink-0 active:scale-95"
                    title="Clear loaded file"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    <span>Clear</span>
                  </button>
                </div>
              )}

              {/* Try Sample Test Certificates Pills */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#bbcabf] uppercase tracking-wider font-semibold">Try Sample Test Certificates</span>
                  <span className="font-mono text-[11px] text-[#4edea3] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                    Interactive Testbed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => loadSampleFile("authentic")}
                    className={`p-2.5 rounded-lg bg-[#19202a] border text-left transition-all group flex flex-col justify-between active:scale-95 ${
                      activeTab === "authentic" && !selectedFile
                        ? "border-[#4edea3] ring-1 ring-[#4edea3]"
                        : "border-[#3c4a42]/40 hover:border-[#4edea3]/70"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3] group-hover:scale-125 transition-transform"></span>
                      <span className="text-xs font-semibold text-[#4edea3] truncate">Stanford Degree</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#bbcabf]/80 truncate">Valid • Authentic</span>
                  </button>

                  <button
                    onClick={() => loadSampleFile("invalid")}
                    className={`p-2.5 rounded-lg bg-[#19202a] border text-left transition-all group flex flex-col justify-between active:scale-95 ${
                      activeTab === "invalid" && !selectedFile
                        ? "border-[#ffb4ab] ring-1 ring-[#ffb4ab]"
                        : "border-[#3c4a42]/40 hover:border-[#ffb4ab]/70"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#ffb4ab] group-hover:scale-125 transition-transform"></span>
                      <span className="text-xs font-semibold text-[#ffb4ab] truncate">Tampered Diploma</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#bbcabf]/80 truncate">Invalid Hash</span>
                  </button>

                  <button
                    onClick={() => loadSampleFile("revoked")}
                    className={`p-2.5 rounded-lg bg-[#19202a] border text-left transition-all group flex flex-col justify-between active:scale-95 ${
                      activeTab === "revoked" && !selectedFile
                        ? "border-yellow-400 ring-1 ring-yellow-400"
                        : "border-[#3c4a42]/40 hover:border-yellow-500/70"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 group-hover:scale-125 transition-transform"></span>
                      <span className="text-xs font-semibold text-yellow-400 truncate">Revoked Credential</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#bbcabf]/80 truncate">Revoked on-chain</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={executeVerification}
                  disabled={loading}
                  className="w-full py-3 bg-[#10b981] hover:bg-[#45dfa4] transition-all duration-200 text-[#00422b] text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.4)] active:scale-95 btn-shine cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {loading ? "hourglass_empty" : "fact_check"}
                  </span>
                  <span>{loading ? "Calculating SHA-256 & Querying Blockchain..." : "Verify Certificate"}</span>
                </button>
                <div className="flex items-center justify-center gap-2 text-[#bbcabf] font-mono text-xs">
                  <span className="material-symbols-outlined text-[14px] text-[#4edea3]">lock</span>
                  <span>Zero Knowledge: PDF content is never transmitted across the network</span>
                </div>
              </div>
            </div>

            {/* Right: Ledger Resolution Panel (6 cols) */}
            <div className="lg:col-span-6 bg-[#151c26] p-8 rounded-xl border border-[#3c4a42]/40 flex flex-col justify-between shadow-sm transition-all hover:border-[#3c4a42]/70">
              <div>
                {/* Header with State Switcher Tabs */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3c4a42]/30">
                  <div>
                    <h3 className="text-lg font-semibold text-[#dce3f1]">Ledger Resolution</h3>
                    <p className="text-xs text-[#bbcabf]">Real-time cryptographic execution pipeline</p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#19202a] p-1 rounded-lg border border-[#3c4a42]/50">
                    <button
                      onClick={() => setActiveTab("authentic")}
                      className={`px-2.5 py-1 text-xs rounded transition-all duration-150 font-medium ${
                        activeTab === "authentic"
                          ? "bg-[#10b981] text-[#00422b] shadow-sm"
                          : "text-[#bbcabf] hover:text-[#dce3f1]"
                      }`}
                    >
                      Authentic
                    </button>
                    <button
                      onClick={() => setActiveTab("invalid")}
                      className={`px-2.5 py-1 text-xs rounded transition-all duration-150 font-medium ${
                        activeTab === "invalid"
                          ? "bg-[#93000a] text-[#ffb4ab] shadow-sm"
                          : "text-[#bbcabf] hover:text-[#dce3f1]"
                      }`}
                    >
                      Invalid
                    </button>
                    <button
                      onClick={() => setActiveTab("revoked")}
                      className={`px-2.5 py-1 text-xs rounded transition-all duration-150 font-medium ${
                        activeTab === "revoked"
                          ? "bg-yellow-500/20 text-yellow-400 shadow-sm"
                          : "text-[#bbcabf] hover:text-[#dce3f1]"
                      }`}
                    >
                      Revoked
                    </button>
                  </div>
                </div>

                {/* Execution Status Timeline */}
                <div className="space-y-3 mb-6 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#0d141e] border border-[#3c4a42]/30">
                    <div className="flex items-center gap-2 text-[#dce3f1]">
                      <span className="material-symbols-outlined text-[16px] text-[#4edea3]">check_circle</span>
                      <span>1. Document Binary Digest</span>
                    </div>
                    <span className="text-[#4edea3] font-medium">[100% COMPLETE]</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-[#0d141e] border border-[#3c4a42]/30">
                    <div className="flex items-center gap-2 text-[#dce3f1]">
                      <span className="material-symbols-outlined text-[16px] text-[#4edea3]">check_circle</span>
                      <span>2. Calculated SHA-256</span>
                    </div>
                    <span className="text-[#bbcabf]">
                      {verificationResult?.uploadedDocumentHash
                        ? `${verificationResult.uploadedDocumentHash.substring(0, 10)}...`
                        : activeTab === "invalid"
                        ? "0xee21b8a...d19349"
                        : "0x9f83...4c1a"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-[#0d141e] border border-[#3c4a42]/30">
                    <div className="flex items-center gap-2 text-[#dce3f1]">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          activeTab === "authentic"
                            ? "text-[#4edea3]"
                            : activeTab === "revoked"
                            ? "text-yellow-400"
                            : "text-[#ffb4ab]"
                        }`}
                      >
                        {activeTab === "authentic" ? "check_circle" : activeTab === "revoked" ? "warning" : "cancel"}
                      </span>
                      <span>3. Ethereum Contract State</span>
                    </div>
                    <span
                      className={`font-medium ${
                        activeTab === "authentic"
                          ? "text-[#4edea3]"
                          : activeTab === "revoked"
                          ? "text-yellow-400"
                          : "text-[#ffb4ab]"
                      }`}
                    >
                      {activeTab === "authentic"
                        ? "MATCH CONFIRMED"
                        : activeTab === "revoked"
                        ? "REVOKED ON-CHAIN"
                        : "UNREGISTERED HASH"}
                    </span>
                  </div>
                </div>

                {/* DYNAMIC RESULT PREVIEWS */}
                {/* Authentic State */}
                {activeTab === "authentic" && (
                  <div className="p-5 rounded-xl bg-[#0d141e] border border-[#4edea3]/40 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30 text-xs font-semibold">
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
                        </span>
                        <span>✓ Certificate Authentic & Verified</span>
                      </div>
                      <span className="font-mono text-xs text-[#bbcabf]">Block #19,482,910</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between border-b border-[#3c4a42]/20 pb-1.5">
                        <span className="text-[#bbcabf]">Issuing Institution:</span>
                        <span className="text-[#dce3f1] font-semibold">
                          {verificationResult?.certificate?.institution || "Stanford Institute of Technology"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#3c4a42]/20 pb-1.5">
                        <span className="text-[#bbcabf]">Conferred Recipient:</span>
                        <span className="text-[#dce3f1] font-semibold">
                          {verificationResult?.certificate?.studentName || "Elena Rostova"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#3c4a42]/20 pb-1.5">
                        <span className="text-[#bbcabf]">Conferred Degree:</span>
                        <span className="text-[#dce3f1] font-semibold">
                          {verificationResult?.certificate?.course || "Bachelor of Science in Mathematics"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 font-mono">
                        <span className="text-[#bbcabf]">Ledger Tx:</span>
                        <button
                          onClick={() =>
                            copyTxHash(
                              verificationResult?.blockchainProof?.transactionHash || "0x71c8293fa8e0114f9b"
                            )
                          }
                          className="text-[#4edea3] flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#19202a] transition-colors group cursor-pointer"
                        >
                          <span>
                            {verificationResult?.blockchainProof?.transactionHash
                              ? `${verificationResult.blockchainProof.transactionHash.substring(0, 12)}...`
                              : "0x71c8...4f9b"}
                          </span>
                          <span className="material-symbols-outlined text-[15px] text-[#bbcabf] group-hover:text-[#4edea3]">
                            {copiedTx ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invalid State */}
                {activeTab === "invalid" && (
                  <div className="p-5 rounded-xl bg-[#0d141e] border border-[#ffb4ab]/50 shadow-[0_0_20px_rgba(255,180,171,0.08)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">gpp_bad</span>
                        <span>Hash Mismatch • Invalid Certificate</span>
                      </div>
                      <span className="font-mono text-xs text-[#ffb4ab]">Zero State Match</span>
                    </div>
                    <p className="text-xs text-[#bbcabf] mb-4 leading-relaxed">
                      Calculated SHA-256 does not match any anchored digest on Ethereum Mainnet or Sepolia testnets. The document may have been altered, re-exported, or never formally issued.
                    </p>
                    <div className="p-3 bg-[#19202a] rounded border border-[#3c4a42]/30 font-mono text-xs space-y-1">
                      <div className="text-[#ffb4ab] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>COMPUTED HASH: 0xee21b8a...d19349 (UNREGISTERED)</span>
                      </div>
                      <div className="text-[#bbcabf]/70 text-[11px]">Anchor verification attempted at contract: 0x8a92...3b1f</div>
                    </div>
                  </div>
                )}

                {/* Revoked State */}
                {activeTab === "revoked" && (
                  <div className="p-5 rounded-xl bg-[#0d141e] border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.08)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        <span>Revoked On-Chain by Authority</span>
                      </div>
                      <span className="font-mono text-xs text-yellow-400">Block #18,102,400</span>
                    </div>
                    <p className="text-xs text-[#bbcabf] mb-4 leading-relaxed">
                      Credential hash found on-chain at block #18,102,400 but was flagged REVOKED by Registrar on Nov 12, 2024. Status immutably written to Ethereum smart contract.
                    </p>
                    <div className="p-3 bg-[#19202a] rounded border border-[#3c4a42]/30 font-mono text-xs space-y-1 text-yellow-400">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">error_outline</span>
                        <span>REVOCATION STATUS: 0x04 (INSTITUTIONAL_ADMIN_OVERRIDE)</span>
                      </div>
                      <div className="text-[#bbcabf]/70 text-[11px]">Reason recorded: Degree conferral superseded by graduate re-issuance</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Spec Notice */}
              <div className="mt-6 pt-4 border-t border-[#3c4a42]/20 flex items-center justify-between font-mono text-xs text-[#bbcabf]">
                <span>Standard: ERC-7529 Verification</span>
                <span className="text-[#4edea3]">Ethereum Mainnet / Hardhat Local</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STUDENT LOCKER SECTION ================= */}
      <section className="py-20 bg-[#080f18] border-b border-[#3c4a42]/20" id="student-locker">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40">
                <span className="material-symbols-outlined text-[16px] text-[#4edea3]">lock</span>
                <span className="text-xs font-semibold text-[#4edea3] tracking-wider uppercase">Student Locker</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#dce3f1]">
                Your Academic Credentials, Accessible Anywhere.
              </h2>
              <p className="text-sm text-[#bbcabf] leading-relaxed">
                Log in as a student to access your personal digital locker containing all conferred certificates. Download authentic PDF files, view on-chain verification proofs, and share verifiable links with prospective employers.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/certificates"
                  className="px-6 py-3 bg-[#10b981] hover:bg-[#45dfa4] text-[#00422b] font-semibold text-sm rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 btn-shine"
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Access Student Locker</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-2xl bg-[#151c26] border border-[#3c4a42]/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#3c4a42]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] font-bold text-sm">
                      ER
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#dce3f1]">Elena Rostova</h4>
                      <p className="text-xs text-[#bbcabf] font-mono">Student ID: STU-2026-9041</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#10b981]/20 text-[#4edea3] text-xs font-mono font-semibold">
                    2 Certificates
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[#0d141e] border border-[#3c4a42]/30 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-[#dce3f1]">Bachelor of Science in Mathematics</h5>
                      <p className="text-[11px] text-[#bbcabf]">Stanford Institute of Technology • Conferred 2026</p>
                    </div>
                    <span className="material-symbols-outlined text-[#4edea3] text-[20px]">verified</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0d141e] border border-[#3c4a42]/30 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-[#dce3f1]">Advanced Cryptography Specialization</h5>
                      <p className="text-[11px] text-[#bbcabf]">MIT Computer Science Lab • Conferred 2025</p>
                    </div>
                    <span className="material-symbols-outlined text-[#4edea3] text-[20px]">verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY BLOCKCHAIN SECTION ================= */}
      <section className="py-20 border-b border-[#3c4a42]/20" id="why-blockchain">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40 mb-3 hover:border-[#4edea3]/40 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-[#4edea3]">hub</span>
              <span className="text-xs font-semibold text-[#4edea3] tracking-wider uppercase">DECENTRALIZED ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl font-semibold text-[#dce3f1] tracking-tight">
              Why Blockchain Verification?
            </h2>
            <p className="text-sm text-[#bbcabf] mt-3">
              Traditional paper diplomas and centralized database entries are vulnerable to forgery, backdating, and single-point-of-failure server outages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Advantage 1 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <h3 className="text-base font-semibold text-[#dce3f1]">Immutable Ledger</h3>
              <p className="text-xs text-[#bbcabf] leading-relaxed">
                Once a certificate hash is recorded in an Ethereum smart contract transaction, it cannot be edited, deleted, or backdated by anyone.
              </p>
            </div>

            {/* Advantage 2 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
                <span className="material-symbols-outlined text-2xl">visibility_off</span>
              </div>
              <h3 className="text-base font-semibold text-[#dce3f1]">Zero-Knowledge Privacy</h3>
              <p className="text-xs text-[#bbcabf] leading-relaxed">
                Only standard SHA-256 binary digests are anchored on-chain. Private student records and grades stay 100% confidential.
              </p>
            </div>

            {/* Advantage 3 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
                <span className="material-symbols-outlined text-2xl">bolt</span>
              </div>
              <h3 className="text-base font-semibold text-[#dce3f1]">Instant Verification</h3>
              <p className="text-xs text-[#bbcabf] leading-relaxed">
                Employers and third parties verify diploma authenticity in sub-seconds using runtime PDF byte matching—no manual background checks required.
              </p>
            </div>

            {/* Advantage 4 */}
            <div className="interactive-card bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/30 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
                <span className="material-symbols-outlined text-2xl">history_edu</span>
              </div>
              <h3 className="text-base font-semibold text-[#dce3f1]">On-Chain Revocation</h3>
              <p className="text-xs text-[#bbcabf] leading-relaxed">
                Institutions retain cryptographic control to flag revoked credentials on-chain, complete with block height and official reason logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 border-t border-[#3c4a42]/30 bg-[#080f18] text-xs text-[#bbcabf]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-[#dce3f1]">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">verified_user</span>
            <span>VARUTHA VeritasLedger Protocol</span>
          </div>
          <p>© 2026 VeritasLedger. Decentralized Academic Certificate Verification on Ethereum.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
