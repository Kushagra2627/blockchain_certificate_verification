import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { certificateService } from "../services/certificateService";
import toast from "react-hot-toast";

const IssueCertificate = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        toast.error("Please upload a valid PDF file");
      }
    }
  };

  const onSubmit = async (data) => {
    if (!pdfFile) {
      toast.error("Please attach the original certificate PDF file!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("studentName", data.studentName);
      formData.append("studentEmail", data.studentEmail || "");
      formData.append("course", data.course);
      formData.append("institution", data.institution);
      formData.append("issueDate", data.issueDate);
      if (data.certificateId && data.certificateId.trim()) {
        formData.append("certificateId", data.certificateId.trim());
      }
      formData.append("certificatePdf", pdfFile);

      const res = await certificateService.issueCertificate(formData);
      if (res.success) {
        toast.success("✓ Certificate issued and anchored on Ethereum blockchain!");
        navigate("/certificates");
      } else {
        toast.error(res.message || "Failed to issue certificate.");
      }
    } catch (error) {
      console.error("Issuance error:", error);
      toast.error(error.response?.data?.message || "Error communicating with blockchain contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div className="border-b border-[#3c4a42]/30 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40 mb-2">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">add_circle</span>
            <span className="font-mono text-xs text-[#4edea3]">ADMIN CREDENTIAL ISSUANCE</span>
          </div>
          <h1 className="text-3xl font-bold text-[#dce3f1]">Issue New Certificate</h1>
          <p className="text-xs text-[#bbcabf] mt-1">
            Confer academic degree and anchor the unique SHA-256 PDF hash directly to Ethereum smart contract registry.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#151c26] p-8 rounded-xl border border-[#3c4a42]/40 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="Elena Rostova"
                {...register("studentName", { required: "Student name is required" })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none"
              />
              {errors.studentName && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.studentName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Student Email (For Locker Access)</label>
              <input
                type="email"
                placeholder="elena.rostova@stanford.edu"
                {...register("studentEmail", { required: "Student email is required" })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none font-mono"
              />
              {errors.studentEmail && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.studentEmail.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Degree / Course Name</label>
              <input
                type="text"
                placeholder="Bachelor of Science in Mathematics"
                {...register("course", { required: "Course is required" })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none"
              />
              {errors.course && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.course.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Issuing Institution</label>
              <input
                type="text"
                placeholder="Stanford Institute of Technology"
                {...register("institution", { required: "Institution name is required" })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none"
              />
              {errors.institution && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.institution.message}</span>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">
                Certificate ID{" "}
                <span className="text-[#bbcabf] font-normal">(optional — auto-generated if left blank)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. CERT-2026-CS001 (leave blank to auto-generate)"
                {...register("certificateId")}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Issue Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                {...register("issueDate", { required: "Issue date is required" })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none font-mono"
              />
              {errors.issueDate && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.issueDate.message}</span>}
            </div>
          </div>

          {/* PDF File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-[#dce3f1] mb-2">Original Conferred PDF Certificate</label>
            <div className="border-2 border-dashed border-[#3c4a42]/60 rounded-xl p-6 text-center bg-[#0d141e]/50 cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="issuePdfInput"
              />
              <label htmlFor="issuePdfInput" className="cursor-pointer space-y-2 block">
                <span className="material-symbols-outlined text-3xl text-[#4edea3]">picture_as_pdf</span>
                <p className="text-xs font-medium text-[#dce3f1]">
                  {pdfFile ? pdfFile.name : "Click to select or drop original certificate PDF"}
                </p>
                <p className="text-[11px] text-[#bbcabf] font-mono">
                  SHA-256 hash will be generated & anchored to Ethereum contract
                </p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-[#10b981] hover:bg-[#45dfa4] text-[#00422b] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 btn-shine cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {loading ? "hourglass_empty" : "verified"}
            </span>
            <span>{loading ? "Anchoring on Ethereum Smart Contract..." : "Issue & Anchor Certificate"}</span>
          </button>
        </form>
      </main>
    </div>
  );
};

export default IssueCertificate;
