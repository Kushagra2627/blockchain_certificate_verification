import React, { useState } from "react";
import { ShieldCheck, Award, ExternalLink, Calendar, CheckCircle2, User, Building, FileText, QrCode } from "lucide-react";
import { formatDate, shortenAddress } from "../utils/formatters";
import { certificateService } from "../services/certificateService";

const CertificateCard = ({ certificate, onVerify, isStudentView = false }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  if (!certificate) return null;

  const handleShowQr = async () => {
    try {
      const identifier = certificate.certificateId || certificate.documentHash;
      const data = await certificateService.getQRCode(identifier);
      setQrUrl(data.qrCodeDataUrl);
      setQrModalOpen(true);
    } catch (err) {
      console.error("Failed to load QR code:", err);
    }
  };

  const identifier = certificate.certificateId || certificate.documentHash;
  const pdfUrl = certificateService.downloadPDFUrl(identifier);

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden border border-slate-700/60 shadow-xl">
      {/* Background Decorative Emblem */}
      <div className="absolute -right-8 -bottom-8 opacity-5 text-indigo-400 pointer-events-none">
        <Award className="w-64 h-64" />
      </div>

      <div className="flex items-start justify-between border-b border-slate-700/50 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            {certificate.certificateId && (
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold font-mono">
                {certificate.certificateId}
              </span>
            )}
            <h3 className="text-lg font-bold text-slate-100">{certificate.course}</h3>
          </div>
        </div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {certificate.blockchainStatus || "Verified"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <User className="w-3.5 h-3.5" /> Student Name
          </span>
          <p className="font-semibold text-slate-200 mt-0.5">{certificate.studentName}</p>
        </div>

        <div>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Building className="w-3.5 h-3.5" /> Institution
          </span>
          <p className="font-semibold text-slate-200 mt-0.5">{certificate.institution}</p>
        </div>

        <div>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" /> Issue Date
          </span>
          <p className="font-medium text-slate-300 mt-0.5">{formatDate(certificate.issueDate)}</p>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">Grade / Honor</span>
          <p className="font-semibold text-indigo-400 mt-0.5">{certificate.grade || "Pass"}</p>
        </div>
      </div>

      {/* Transaction Hash */}
      {certificate.transactionHash && (
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
          <span>Tx: {shortenAddress(certificate.transactionHash, 8)}</span>
          <a
            href={`https://etherscan.io/tx/${certificate.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Verify Hash <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Action buttons: PDF Download and QR Code */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <FileText className="w-4 h-4 text-white" /> Download PDF
        </a>

        <button
          onClick={handleShowQr}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
        >
          <QrCode className="w-4 h-4 text-emerald-400" /> View QR Code
        </button>
      </div>

      {!isStudentView && onVerify && (
        <button
          onClick={() => onVerify(certificate.certificateId || certificate.documentHash)}
          className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-sm transition-all"
        >
          Check Live Blockchain Proof
        </button>
      )}

      {/* QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="text-slate-100 font-bold text-sm">Certificate QR Code</h4>
            {qrUrl ? (
              <img src={qrUrl} alt="Certificate QR Code" className="mx-auto rounded-lg border border-slate-800 shadow-md w-48 h-48" />
            ) : (
              <p className="text-slate-400 text-xs">Loading QR Code...</p>
            )}
            <p className="text-xs font-mono text-indigo-400">{certificate.certificateId || "Verified Certificate"}</p>
            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateCard;
