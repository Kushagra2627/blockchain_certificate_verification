import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { certificateService } from "../services/certificateService";
import { validateSelectedFile } from "../utils/fileValidator";
import toast from "react-hot-toast";

const IssueCertificate = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [category, setCategory] = useState("document"); // "document" or "image"
  const [attachedFile, setAttachedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateSelectedFile(file, category);
      if (!validation.valid) {
        toast.error(validation.error);
        setAttachedFile(null);
        return;
      }
      setAttachedFile(file);
    }
  };

  const onSubmit = async (data) => {
    if (!attachedFile) {
      toast.error(`Please attach the original ${category} file!`);
      return;
    }

    const validation = validateSelectedFile(attachedFile, category);
    if (!validation.valid) {
      toast.error(validation.error);
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
      formData.append("category", category);
      formData.append("fileCategory", category);
      if (data.certificateId && data.certificateId.trim()) {
        formData.append("certificateId", data.certificateId.trim());
      }
      formData.append("certificatePdf", attachedFile);

      const res = await certificateService.issueCertificate(formData);
      if (res.success) {
        toast.success("✓ Document issued and anchored on Ethereum blockchain!");
        navigate("/certificates");
      } else {
        toast.error(res.message || "Failed to issue document.");
      }
    } catch (error) {
      console.error("Issuance error:", error);
      toast.error(error.response?.data?.message || "Error communicating with blockchain contract.");
    } finally {
      setLoading(false);
    }
  };

  const acceptAttribute =
    category === "image"
      ? ".jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.svg,image/*"
      : ".pdf,.doc,.docx,.txt,.rtf,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

  return (
    <div className="flex bg-[#0d141e] text-[#dce3f1] font-['Inter',sans-serif]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div className="border-b border-[#3c4a42]/30 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#19202a] border border-[#3c4a42]/40 mb-2">
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">add_circle</span>
            <span className="font-mono text-xs text-[#4edea3]">ADMIN CREDENTIAL ISSUANCE</span>
          </div>
          <h1 className="text-3xl font-bold text-[#dce3f1]">Issue & Register Document</h1>
          <p className="text-xs text-[#bbcabf] mt-1">
            Confer credential/document and anchor its unique SHA-256 hash directly to Ethereum smart contract registry.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#151c26] p-8 rounded-xl border border-[#3c4a42]/40 space-y-6 shadow-xl">
          {/* File Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#dce3f1] mb-2">Select Category</label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => {
                  setCategory("document");
                  setAttachedFile(null);
                }}
                className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
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
                  setAttachedFile(null);
                }}
                className={`py-2.5 px-4 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Student / Recipient Name</label>
              <input
                type="text"
                placeholder="Elena Rostova"
                {...register("studentName", { required: "Recipient name is required" })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none"
              />
              {errors.studentName && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.studentName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Recipient Email (For Locker Access)</label>
              <input
                type="email"
                placeholder="elena.rostova@stanford.edu"
                {...register("studentEmail", { required: "Recipient email is required" })}
                className="w-full px-4 py-2.5 rounded-lg bg-[#0d141e] border border-[#3c4a42]/60 text-[#dce3f1] text-sm focus:border-[#4edea3] focus:outline-none font-mono"
              />
              {errors.studentEmail && <span className="text-xs text-[#ffb4ab] mt-1 block">{errors.studentEmail.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dce3f1] mb-1">Degree / Document Name</label>
              <input
                type="text"
                placeholder="Bachelor of Science in Mathematics / Property Deed"
                {...register("course", { required: "Document title is required" })}
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
                Certificate / Document ID{" "}
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

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-[#dce3f1] mb-2">
              Original Conferred {category === "image" ? "Image File" : "Document File"}
            </label>
            <div className="border-2 border-dashed border-[#3c4a42]/60 rounded-xl p-6 text-center bg-[#0d141e]/50 cursor-pointer">
              <input
                type="file"
                accept={acceptAttribute}
                onChange={handleFileChange}
                className="hidden"
                id="issueFileInput"
              />
              <label htmlFor="issueFileInput" className="cursor-pointer space-y-2 block">
                <span className="material-symbols-outlined text-3xl text-[#4edea3]">
                  {category === "image" ? "image" : "description"}
                </span>
                <p className="text-xs font-medium text-[#dce3f1]">
                  {attachedFile ? attachedFile.name : `Click to select or drop original ${category}`}
                </p>
                <p className="text-[11px] text-[#bbcabf] font-mono">
                  Maximum size: 10 MB • SHA-256 hash will be anchored to Ethereum contract
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
            <span>{loading ? "Anchoring on Ethereum Smart Contract..." : "Issue & Anchor Document"}</span>
          </button>
        </form>
      </main>
    </div>
  );
};

export default IssueCertificate;
