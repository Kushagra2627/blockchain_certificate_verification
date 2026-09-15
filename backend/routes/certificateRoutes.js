const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

const {
  issueCertificate,
  getCertificates,
  getCertificateById,
  verifyCertificate,
  updateCertificate,
  deleteCertificate,
  downloadPDF,
  getQRCode,
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validatePdfUpload, validateCertificateInput } = require("../middleware/validateMiddleware");

// Public routes
router.get("/", getCertificates);
router.post("/verify", upload.single("certificatePdf"), validatePdfUpload, verifyCertificate);
router.get("/:certificateId/pdf", downloadPDF);
router.get("/:certificateId/qrcode", getQRCode);
router.get("/:identifier", getCertificateById);

// Protected Admin routes
router.post(
  "/",
  protect,
  authorize("Admin"),
  upload.single("certificatePdf"),
  validatePdfUpload,
  validateCertificateInput,
  issueCertificate
);
router.put("/:id", protect, authorize("Admin"), updateCertificate);
router.delete("/:id", protect, authorize("Admin"), deleteCertificate);

module.exports = router;
