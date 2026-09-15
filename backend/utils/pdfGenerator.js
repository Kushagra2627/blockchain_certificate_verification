const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

/**
 * Generate a PDF document stream for a given certificate record
 */
const generateCertificatePDFStream = async (cert, verificationUrl) => {
  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margin: 40,
  });

  // Generate QR Code buffer
  const qrBuffer = await QRCode.toBuffer(verificationUrl || `https://blockchain-cert.verify/${cert.certificateId}`, {
    margin: 1,
    width: 120,
  });

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Outer Border & Decorative background
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(3).stroke("#1e3a8a");
  doc.rect(28, 28, pageWidth - 56, pageHeight - 56).lineWidth(1).stroke("#3b82f6");

  // Title
  doc.fillColor("#0f172a").fontSize(26).font("Helvetica-Bold").text(cert.institution || "OFFICIAL ACADEMIC CERTIFICATE", 0, 65, { align: "center" });
  doc.fillColor("#2563eb").fontSize(13).font("Helvetica-Bold").text("BLOCKCHAIN VERIFIED CREDENTIAL", 0, 102, { align: "center" });

  // Subtitle
  doc.fillColor("#64748b").fontSize(11).font("Helvetica").text("This is to certify that", 0, 138, { align: "center" });

  // Student Name
  doc.fillColor("#0f172a").fontSize(30).font("Helvetica-Bold").text(cert.studentName, 0, 160, { align: "center" });

  // Course Description
  doc.fillColor("#64748b").fontSize(11).font("Helvetica").text("has successfully completed the prescribed requirements for", 0, 208, { align: "center" });
  doc.fillColor("#1d4ed8").fontSize(20).font("Helvetica-Bold").text(cert.course, 0, 230, { align: "center" });

  if (cert.grade) {
    doc.fillColor("#475569").fontSize(12).font("Helvetica").text(`Grade / Classification: ${cert.grade}`, 0, 268, { align: "center" });
  }

  // Issue Date & Certificate ID
  doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`Issued Date: ${cert.issueDate}   |   Certificate ID: ${cert.certificateId}`, 0, 302, { align: "center" });

  // Footer section: QR Code on left, Signatures/Blockchain details on right
  const yPos = 360;

  // QR Code Image
  doc.image(qrBuffer, 55, yPos, { width: 95 });
  doc.fillColor("#475569").fontSize(7.5).font("Helvetica").text("Scan to Verify On-Chain", 42, yPos + 100, { width: 120, align: "center" });

  // Blockchain Info Box
  const infoX = 175;
  doc.rect(infoX, yPos, 380, 85).fillAndStroke("#f8fafc", "#cbd5e1");
  doc.fillColor("#0f172a").fontSize(8.5).font("Helvetica-Bold").text("ETHEREUM SMART CONTRACT VERIFICATION", infoX + 12, yPos + 10);
  doc.fillColor("#334155").fontSize(7.5).font("Helvetica");
  doc.text(`Tx Hash: ${cert.transactionHash || "On-chain Anchored"}`, infoX + 12, yPos + 26, { width: 355, height: 14, ellipsis: true });
  doc.text(`Issuer Wallet: ${cert.walletAddress || "Verified Institution"}`, infoX + 12, yPos + 42, { width: 355, height: 14, ellipsis: true });
  doc.text(`Status: ${cert.blockchainStatus || "Confirmed"} (Immutable Ledger Record)`, infoX + 12, yPos + 58);

  // Authorized Signature Line
  const sigX = pageWidth - 170;
  doc.moveTo(sigX, yPos + 55).lineTo(sigX + 120, yPos + 55).stroke("#64748b");
  doc.fillColor("#0f172a").fontSize(9.5).font("Helvetica-Bold").text("Authorized Signature", sigX, yPos + 63, { width: 120, align: "center" });

  doc.end();
  return doc;
};

module.exports = { generateCertificatePDFStream };
