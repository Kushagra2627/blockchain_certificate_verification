const crypto = require("crypto");
const mongoose = require("mongoose");
const Certificate = require("../models/Certificate");
const BlockchainService = require("../services/blockchainService");
const { generateQRCodeDataURL } = require("../utils/qrGenerator");
const { generateCertificatePDFStream } = require("../utils/pdfGenerator");
const { embedQRCodeInPDF } = require("../utils/pdfEmbedder");

/**
 * @desc    Issue a new certificate or document
 *          1. Validate file (size <= 10MB, category/MIME match)
 *          2. If PDF, embed QR code (pointing to public /verify/:documentId)
 *          3. Compute SHA-256 hash from the FINAL file bytes
 *          4. Verify duplicate prevention (MongoDB + Blockchain)
 *          5. Anchor SHA-256 hash on Ethereum Sepolia smart contract
 *          6. Save final file bytes and metadata to MongoDB
 * @route   POST /api/certificates
 * @access  Private (Admin only)
 */
const issueCertificate = async (req, res, next) => {
  try {
    const { certificateId, studentName, studentEmail, course, institution, grade, issueDate, walletAddress } = req.body;

    // Validate uploaded file exists
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Original document or image file is required for issuance.",
      });
    }

    const fileCategory = (req.body.fileCategory || req.body.category || "document").toLowerCase();
    const mimeType = req.file.mimetype || "application/pdf";
    const originalFileName = req.file.originalname || `document-${Date.now()}`;

    // Auto-generate unique certificate reference ID if not provided
    const generateCertId = () => {
      const year = new Date().getFullYear();
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `CERT-${year}-${rand}`;
    };
    const formattedCertId = certificateId && certificateId.trim()
      ? certificateId.trim().toUpperCase()
      : generateCertId();

    // Construct public QR verification redirect URL
    const frontendBase = process.env.FRONTEND_URL || "https://blockchain-certificate-verification-five.vercel.app";
    const verificationUrl = `${frontendBase.replace(/\/+$/, "")}/verify/${formattedCertId}`;

    // Check if uploaded file is a PDF
    const isPdf =
      mimeType === "application/pdf" ||
      originalFileName.toLowerCase().endsWith(".pdf") ||
      (req.file.buffer.length >= 4 && req.file.buffer.toString("utf8", 0, 4) === "%PDF");

    let finalBuffer = req.file.buffer;
    let qrEmbedded = false;

    // Critical sequence: Embed QR code into the PDF before calculating final hash
    if (isPdf) {
      try {
        finalBuffer = await embedQRCodeInPDF(req.file.buffer, verificationUrl);
        qrEmbedded = true;
      } catch (embedErr) {
        console.warn("[QR Embedding Notice]: Could not embed QR, keeping original buffer:", embedErr.message);
        finalBuffer = req.file.buffer;
      }
    }

    // 1. Calculate SHA-256 hash from the FINAL file buffer (including embedded QR)
    const documentHash = crypto
      .createHash("sha256")
      .update(finalBuffer)
      .digest("hex")
      .toLowerCase();

    // 2. DUPLICATE CHECK: Check MongoDB database
    const existingDBCert = await Certificate.findOne({ documentHash });
    if (existingDBCert) {
      return res.status(409).json({
        success: false,
        message: "Duplicate file detected. This document has already been registered using the same SHA-256 hash and cannot be issued again.",
        code: "DUPLICATE_FILE",
        existingDocumentHash: documentHash,
      });
    }

    // 3. DUPLICATE CHECK: Check Ethereum Smart Contract
    try {
      const chainRecord = await BlockchainService.getCertificateByDocHash(documentHash);
      if (chainRecord && chainRecord.existsOnChain) {
        return res.status(409).json({
          success: false,
          message: "Duplicate file detected. This document has already been registered using the same SHA-256 hash and cannot be issued again.",
          code: "DUPLICATE_FILE",
          existingDocumentHash: documentHash,
        });
      }
    } catch (bcCheckErr) {
      console.warn("[Issue Duplicate Check] Blockchain lookup warning:", bcCheckErr.message);
    }

    // 4. Register on Ethereum Smart Contract via Ethers.js
    let txReceipt = { transactionHash: "0x_mock_tx_hash_" + Date.now(), issuerWallet: walletAddress || "0x00" };
    let blockchainStatus = "Confirmed";

    try {
      txReceipt = await BlockchainService.issueCertificateOnChain(
        formattedCertId,
        studentName,
        course,
        institution,
        issueDate,
        documentHash
      );
    } catch (bcError) {
      console.error("[Blockchain Error]:", bcError.message);
      // In automated test mode without live Sepolia node, allow simulated confirmation
      if (process.env.NODE_ENV === "test") {
        txReceipt.transactionHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        blockchainStatus = "Pending";
      } else {
        throw bcError;
      }
    }

    // 5. Save in MongoDB (stores the exact final buffer so download serves the same hash)
    const newCertificate = await Certificate.create({
      documentHash,
      certificateId: formattedCertId,
      studentName,
      studentEmail: studentEmail || "",
      course,
      institution,
      grade: grade || "Pass",
      issueDate,
      walletAddress: walletAddress || txReceipt.issuerWallet || "0x0000000000000000000000000000000000000000",
      transactionHash: txReceipt.transactionHash,
      blockchainStatus,
      issuedBy: req.user ? req.user._id : undefined,
      fileCategory,
      mimeType,
      originalPdf: finalBuffer,
      originalPdfName: originalFileName,
      originalFileName,
      verificationUrl,
      qrEmbedded,
    });

    return res.status(201).json({
      success: true,
      message: qrEmbedded
        ? "Document issued, verification QR code embedded, and SHA-256 hash anchored on Ethereum blockchain successfully!"
        : "Document/image issued and SHA-256 hash anchored on Ethereum blockchain successfully!",
      data: newCertificate,
      documentHash,
      transactionHash: txReceipt.transactionHash,
      verificationUrl,
      qrEmbedded,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all certificates with pagination & search
 * @route   GET /api/certificates
 * @access  Private/Public
 */
const getCertificates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { certificateId: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
        { studentEmail: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
        { institution: { $regex: search, $options: "i" } },
        { documentHash: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
      .select("-originalPdf")
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: certificates.length,
      data: certificates,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single certificate by certificateId, documentHash, or _id
 * @route   GET /api/certificates/:identifier
 * @access  Public
 */
const getCertificateById = async (req, res, next) => {
  try {
    const identifier = req.params.identifier.trim();
    let certificate;

    // 1. MongoDB ObjectId lookup (24-char hex)
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      certificate = await Certificate.findById(identifier).select("-originalPdf").populate("issuedBy", "name email");
    }
    // 2. SHA-256 document hash lookup (64-char hex)
    else if (identifier.length === 64 && /^[0-9a-fA-F]{64}$/.test(identifier)) {
      certificate = await Certificate.findOne({ documentHash: identifier.toLowerCase() }).select("-originalPdf").populate("issuedBy", "name email");
    }
    // 3. Human-readable certificateId (e.g. "CERT-2026-CS001")
    else {
      certificate = await Certificate.findOne({ certificateId: identifier.toUpperCase() }).select("-originalPdf").populate("issuedBy", "name email");
    }

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: `Certificate identifier '${identifier}' not found in database.`,
      });
    }

    // Fetch live blockchain metadata
    let blockchainData = { existsOnChain: false };
    if (certificate.documentHash) {
      blockchainData = await BlockchainService.getCertificateByDocHash(certificate.documentHash);
    }

    // Redact private email if public unauthenticated viewer
    const isAuthorized = req.user && (req.user.role === "Admin" || req.user.email === certificate.studentEmail);
    const sanitizedCert = certificate.toObject();
    if (!isAuthorized) {
      delete sanitizedCert.studentEmail;
      delete sanitizedCert.issuedBy;
    }

    res.json({
      success: true,
      data: sanitizedCert,
      blockchainVerification: blockchainData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    STRICT PUBLIC VERIFICATION:
 *          Supports both General Upload verification and QR-targeted reference verification
 * @route   POST /api/certificates/verify
 * @access  Public
 */
const verifyCertificate = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Document file is required for verification.",
      });
    }

    const documentId = (req.body.documentId || req.body.certificateId || req.body.reference || "").trim();

    // 1. Compute SHA-256 hash from exact uploaded file bytes
    const uploadedHash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex")
      .toLowerCase();

    // 2. If verification is targeted via QR documentId reference:
    if (documentId) {
      let expectedCert = null;
      if (mongoose.Types.ObjectId.isValid(documentId)) {
        expectedCert = await Certificate.findById(documentId).select("-originalPdf");
      }
      if (!expectedCert) {
        expectedCert = await Certificate.findOne({ certificateId: documentId.toUpperCase() }).select("-originalPdf");
      }

      let expectedHash = expectedCert?.documentHash;
      if (!expectedHash) {
        try {
          const contract = require("../config/ethereum").getContract();
          if (contract) {
            const onChainHash = await contract.getHashByCertId(documentId.toUpperCase());
            if (onChainHash && onChainHash !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
              expectedHash = onChainHash.toLowerCase().replace("0x", "");
            }
          }
        } catch (lookupErr) {
          console.warn("[Verify] On-chain certId lookup notice:", lookupErr.message);
        }
      }

      if (!expectedHash) {
        return res.status(200).json({
          success: true,
          verified: false,
          status: "NOT FOUND",
          message: `No registered document found matching verification reference '${documentId}'.`,
          uploadedDocumentHash: uploadedHash,
          certificateId: documentId,
        });
      }

      // Check if uploaded hash matches the reference hash
      if (uploadedHash !== expectedHash) {
        return res.status(200).json({
          success: true,
          verified: false,
          status: "INVALID / TAMPERED",
          message: "The uploaded file does not match the certificate reference from the scanned QR code. The document has been modified or is not the authentic file.",
          uploadedDocumentHash: uploadedHash,
          expectedDocumentHash: expectedHash,
          certificateId: documentId,
        });
      }
    }

    // 3. Query the Ethereum Sepolia Smart Contract
    let chainRecord = null;
    let blockchainOnline = false;

    try {
      chainRecord = await BlockchainService.getCertificateByDocHash(uploadedHash);
      blockchainOnline = !chainRecord.error;
    } catch (bcError) {
      console.warn("[Verify] Blockchain unreachable:", bcError.message);
      blockchainOnline = false;
      chainRecord = { existsOnChain: false, error: bcError.message };
    }

    // 4. Return appropriate result states based on on-chain status
    if (!blockchainOnline) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: "UNAVAILABLE",
        message: "Blockchain network is currently unreachable. Unable to determine on-chain status at this time.",
        uploadedDocumentHash: uploadedHash,
      });
    }

    if (!chainRecord.existsOnChain) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: "NOT FOUND",
        message: "Document hash was not found on the Ethereum blockchain smart contract.",
        uploadedDocumentHash: uploadedHash,
      });
    }

    const dbCert = await Certificate.findOne({ documentHash: uploadedHash }).select("-originalPdf");

    if (chainRecord.isRevoked) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: "REVOKED",
        verificationSource: "BLOCKCHAIN",
        message: "This document exists on-chain but has been officially REVOKED by the issuing institution.",
        uploadedDocumentHash: uploadedHash,
        blockchainProof: {
          issuerWallet: chainRecord.issuerWallet,
          timestamp: chainRecord.timestamp,
          transactionHash: dbCert?.transactionHash || null,
        },
        certificate: {
          studentName: dbCert?.studentName || chainRecord.studentName,
          course: dbCert?.course || chainRecord.course,
          institution: dbCert?.institution || chainRecord.institution,
          issueDate: dbCert?.issueDate || chainRecord.issueDate,
          certificateId: dbCert?.certificateId || chainRecord.certificateId || null,
          fileCategory: dbCert?.fileCategory || "document",
          fileName: dbCert?.originalFileName || dbCert?.originalPdfName || null,
        },
      });
    }

    // Status: AUTHENTIC
    return res.status(200).json({
      success: true,
      verified: true,
      status: "AUTHENTIC",
      verificationSource: "BLOCKCHAIN",
      message: "Document is authentic and verified directly against the Ethereum blockchain smart contract.",
      uploadedDocumentHash: uploadedHash,
      blockchainDocumentHash: chainRecord.documentHash,
      certificate: {
        studentName: dbCert?.studentName || chainRecord.studentName,
        course: dbCert?.course || chainRecord.course,
        institution: dbCert?.institution || chainRecord.institution,
        issueDate: dbCert?.issueDate || chainRecord.issueDate,
        grade: dbCert?.grade || "Pass",
        certificateId: dbCert?.certificateId || chainRecord.certificateId || null,
        fileCategory: dbCert?.fileCategory || "document",
        mimeType: dbCert?.mimeType || "application/pdf",
        fileName: dbCert?.originalFileName || dbCert?.originalPdfName || null,
      },
      blockchainProof: {
        issuerWallet: chainRecord.issuerWallet,
        timestamp: chainRecord.timestamp,
        transactionHash: dbCert?.transactionHash || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke document on Ethereum Smart Contract and update MongoDB status
 * @route   POST /api/certificates/:id/revoke
 * @access  Private (Admin only)
 */
const revokeCertificate = async (req, res, next) => {
  try {
    const param = req.params.id ? req.params.id.trim() : "";
    if (!param) {
      return res.status(400).json({ success: false, message: "Certificate ID is required for revocation." });
    }

    let certificate;
    if (mongoose.Types.ObjectId.isValid(param)) {
      certificate = await Certificate.findById(param);
    } else {
      certificate = await Certificate.findOne({ certificateId: param.toUpperCase() });
    }

    if (!certificate) {
      return res.status(404).json({ success: false, message: `Certificate '${param}' not found in database.` });
    }

    if (certificate.blockchainStatus === "Revoked") {
      return res.status(400).json({
        success: false,
        message: "This document is already revoked on the blockchain.",
        data: certificate,
      });
    }

    if (!certificate.documentHash) {
      return res.status(400).json({
        success: false,
        message: "Certificate has no registered document hash for blockchain revocation.",
      });
    }

    // Submit transaction to Ethereum Sepolia Smart Contract via Ethers.js
    console.log(`[Revoke] Revoking certificate '${certificate.certificateId}' with hash ${certificate.documentHash}...`);
    const txResult = await BlockchainService.revokeCertificateByHash(certificate.documentHash);
    console.log(`[Revoke] Confirmed on chain in tx: ${txResult.transactionHash}`);

    // Update MongoDB status only AFTER successful blockchain confirmation
    certificate.blockchainStatus = "Revoked";
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user ? req.user._id : null;
    certificate.revocationTxHash = txResult.transactionHash;
    await certificate.save();

    return res.status(200).json({
      success: true,
      message: "Certificate has been successfully REVOKED on the Ethereum blockchain.",
      data: certificate,
      transactionHash: txResult.transactionHash,
      blockNumber: txResult.blockNumber,
    });
  } catch (error) {
    console.error("[revokeCertificate Error]:", error);
    next(error);
  }
};

/**
 * @desc    Update certificate metadata (Admin only)
 * @route   PUT /api/certificates/:id
 * @access  Private (Admin only)
 */
const updateCertificate = async (req, res, next) => {
  try {
    let certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    const { studentName, course, institution, grade } = req.body;

    certificate.studentName = studentName || certificate.studentName;
    certificate.course = course || certificate.course;
    certificate.institution = institution || certificate.institution;
    certificate.grade = grade || certificate.grade;

    const updatedCert = await certificate.save();

    res.json({
      success: true,
      message: "Certificate metadata updated in database successfully.",
      data: updatedCert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete certificate record
 * @route   DELETE /api/certificates/:id
 * @access  Private (Admin only)
 */
const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    await Certificate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Certificate record deleted from database",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate & stream PDF Certificate
 * @route   GET /api/certificates/:certificateId/pdf
 * @access  Public
 */
const downloadPDF = async (req, res, next) => {
  try {
    const param = req.params.certificateId.trim();
    let certificate;

    if (mongoose.Types.ObjectId.isValid(param)) {
      certificate = await Certificate.findById(param).select("+originalPdf +originalPdfName +originalFileName +mimeType");
    } else {
      certificate = await Certificate.findOne({ certificateId: param.toUpperCase() }).select("+originalPdf +originalPdfName +originalFileName +mimeType");
    }

    if (!certificate) {
      return res.status(404).json({ success: false, message: `Certificate '${param}' not found.` });
    }

    const contentType = certificate.mimeType || "application/pdf";
    const downloadFilename = certificate.originalFileName || certificate.originalPdfName || `Certificate-${certificate.certificateId || param}.pdf`;

    // Serve the EXACT stored file bytes (same hash as on blockchain)
    if (certificate.originalPdf && certificate.originalPdf.length > 0) {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${downloadFilename}"`);
      res.setHeader("Content-Length", certificate.originalPdf.length);
      return res.end(certificate.originalPdf);
    }

    // Fallback: Legacy certificate
    console.warn(`[downloadPDF] No original PDF stored for '${param}' — generating fallback PDF.`);
    const verificationUrl = certificate.verificationUrl || `${req.protocol}://${req.get("host")}/verify/${certificate.certificateId}`;
    const pdfDoc = await generateCertificatePDFStream(certificate, verificationUrl);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Certificate-${certificate.certificateId || 'document'}.pdf"`);

    pdfDoc.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get QR Code Data URL for Certificate
 * @route   GET /api/certificates/:certificateId/qrcode
 * @access  Public
 */
const getQRCode = async (req, res, next) => {
  try {
    const param = req.params.certificateId.trim();
    let certificate;

    if (mongoose.Types.ObjectId.isValid(param)) {
      certificate = await Certificate.findById(param);
    } else {
      certificate = await Certificate.findOne({ certificateId: param.toUpperCase() });
    }

    if (!certificate) {
      return res.status(404).json({ success: false, message: `Certificate '${param}' not found.` });
    }

    const frontendBase = process.env.FRONTEND_URL || "https://blockchain-certificate-verification-five.vercel.app";
    const verificationUrl = certificate.verificationUrl || `${frontendBase.replace(/\/+$/, "")}/verify/${certificate.certificateId}`;
    const qrDataUrl = await generateQRCodeDataURL(verificationUrl);

    res.json({
      success: true,
      certificateId: certificate.certificateId || certificate._id,
      qrCodeDataUrl: qrDataUrl,
      verificationUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueCertificate,
  getCertificates,
  getCertificateById,
  verifyCertificate,
  revokeCertificate,
  updateCertificate,
  deleteCertificate,
  downloadPDF,
  getQRCode,
};
