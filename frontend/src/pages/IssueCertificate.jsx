import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { certificateService } from "../services/certificateService";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { PlusCircle, Cpu, CheckCircle2, UploadCloud, FileText } from "lucide-react";

const IssueCertificate = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [txResult, setTxResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        toast.error("Please upload a valid PDF document");
      }
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error("Original Certificate PDF document is required for issuance");
      return;
    }

    try {
      setSubmitting(true);
      setTxResult(null);

      const formData = new FormData();
      formData.append("certificatePdf", selectedFile);
      if (data.certificateId && data.certificateId.trim()) {
        formData.append("certificateId", data.certificateId.trim());
      }
      formData.append("studentName", data.studentName.trim());
      formData.append("course", data.course.trim());
      formData.append("institution", data.institution || user?.institution || "Stanford University");
      formData.append("grade", data.grade || "Pass");
      formData.append("issueDate", data.issueDate);

      const res = await certificateService.issueCertificate(formData);
      if (res.success) {
        setTxResult(res);
        toast.success("Certificate issued & PDF hash anchored on Ethereum blockchain!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error issuing certificate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <PlusCircle className="w-7 h-7 text-indigo-400" /> Issue Certificate on Blockchain
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload the original PDF certificate to compute its SHA-256 hash and anchor proof permanently on Solidity Smart Contract.
          </p>
        </div>

        {txResult && (
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-emerald-400 font-bold">
              <CheckCircle2 className="w-6 h-6" /> Certificate PDF Anchored Successfully!
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
              <div>
                <span className="text-slate-400 block">SHA-256 Document Hash:</span>
                <span className="text-emerald-400 font-bold break-all">{txResult.documentHash}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Blockchain Transaction Hash:</span>
                <span className="text-indigo-400 truncate block">{txResult.transactionHash}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/verify")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              Go to Public PDF Verification Page
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-2xl p-8 border border-slate-800 space-y-6">
          {/* PDF Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Original Certificate PDF Document <span className="text-red-400">*</span>
            </label>
            <div
              onClick={() => document.getElementById("issuePdfInput").click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile ? "border-emerald-500/60 bg-emerald-950/10" : "border-slate-700 hover:border-slate-500 bg-slate-900/40"
              }`}
            >
              <input
                id="issuePdfInput"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-slate-100 font-semibold text-sm truncate">{selectedFile.name}</p>
                    <p className="text-slate-400 text-xs font-mono">{(selectedFile.size / 1024).toFixed(1)} KB • Valid PDF Attached</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto opacity-80" />
                  <p className="text-slate-200 text-sm font-medium">Click to select original PDF certificate</p>
                  <p className="text-slate-500 text-xs">PDF will be hashed using SHA-256 on the backend (Max 10 MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Student Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Johnathan Doe"
                {...register("studentName", { required: "Student Name is required" })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
              {errors.studentName && <span className="text-xs text-red-400 mt-1 block">{errors.studentName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Course / Program <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="B.Sc. Computer Science & Blockchain"
                {...register("course", { required: "Course Name is required" })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
              {errors.course && <span className="text-xs text-red-400 mt-1 block">{errors.course.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Institution Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                defaultValue={user?.institution || "Stanford University"}
                {...register("institution", { required: "Institution is required" })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
              {errors.institution && <span className="text-xs text-red-400 mt-1 block">{errors.institution.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Issue Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                {...register("issueDate", { required: "Issue date is required" })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
              {errors.issueDate && <span className="text-xs text-red-400 mt-1 block">{errors.issueDate.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Grade / Performance</label>
              <input
                type="text"
                placeholder="First Class Honors / Distinction"
                defaultValue="First Class Honors"
                {...register("grade")}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Certificate ID <span className="text-slate-500">(Optional Reference)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CERT-2026-889900"
                {...register("certificateId")}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-sm font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> SHA-256 PDF hash will be anchored to Smart Contract
            </span>
            <span className="font-mono text-emerald-400">0.00 ETH Gas Fee (Local Node)</span>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedFile}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40"
          >
            {submitting ? "Hashing PDF & Mining Transaction..." : "Submit PDF & Anchor on Blockchain"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default IssueCertificate;
