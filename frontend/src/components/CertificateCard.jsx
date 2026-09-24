import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatters";

const CertificateCard = ({ certificate, isStudentView = false }) => {
  return (
    <div className="bg-[#151c26] p-6 rounded-xl border border-[#3c4a42]/40 shadow-sm space-y-4 hover:border-[#4edea3]/50 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#10b981]/20 text-[#4edea3] text-[11px] font-mono font-semibold border border-[#4edea3]/30">
              {certificate.status === "REVOKED" ? "REVOKED" : "ON-CHAIN CONFIRMED"}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0d141e] text-[#bbcabf] text-[10px] font-mono border border-[#3c4a42]/60 uppercase">
              Type: {certificate.fileCategory || "document"}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#dce3f1] mt-2 group-hover:text-[#6ffbbe] transition-colors">
            {certificate.course}
          </h3>
          <p className="text-xs text-[#bbcabf] font-medium">{certificate.institution}</p>
        </div>
        <span className="material-symbols-outlined text-[#4edea3] text-3xl">
          {certificate.fileCategory === "image" ? "image" : "workspace_premium"}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-[#bbcabf]">
        <div className="flex justify-between border-b border-[#3c4a42]/20 pb-1">
          <span>Student / Recipient:</span>
          <span className="text-[#dce3f1] font-semibold">{certificate.studentName}</span>
        </div>
        <div className="flex justify-between border-b border-[#3c4a42]/20 pb-1">
          <span>Issue Date:</span>
          <span className="font-mono text-[#dce3f1]">{formatDate(certificate.issueDate)}</span>
        </div>
        {(certificate.originalFileName || certificate.originalPdfName) && (
          <div className="flex justify-between border-b border-[#3c4a42]/20 pb-1">
            <span>File Name:</span>
            <span className="font-mono text-[#dce3f1] truncate max-w-[140px]">
              {certificate.originalFileName || certificate.originalPdfName}
            </span>
          </div>
        )}
        {certificate.documentHash && (
          <div className="flex justify-between pt-0.5 font-mono">
            <span>SHA-256 Digest:</span>
            <span className="text-[#4edea3] truncate max-w-[140px]">{certificate.documentHash}</span>
          </div>
        )}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-[#3c4a42]/30">
        <Link
          to={`/certificates/${certificate._id}`}
          className="text-xs font-semibold text-[#4edea3] hover:underline flex items-center gap-1"
        >
          <span>View Details & Download File</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default CertificateCard;
