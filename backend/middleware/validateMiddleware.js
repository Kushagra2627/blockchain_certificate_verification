const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"];
const DOCUMENT_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf",
  "application/x-rtf",
  "text/rtf",
  "application/vnd.oasis.opendocument.text",
];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".svg"];
const IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
];

const validateFileUpload = (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: "File is required for upload/verification." });
  }

  // 1. Enforce STRICT 10 MB size limit
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: "File size must not exceed 10 MB." });
  }

  const category = (req.body.fileCategory || req.body.category || "document").toLowerCase().trim();
  const filename = (req.file.originalname || "").toLowerCase();
  const ext = filename.lastIndexOf(".") !== -1 ? filename.substring(filename.lastIndexOf(".")) : "";
  const mime = (req.file.mimetype || "").toLowerCase();

  const isDocExtOrMime = DOCUMENT_EXTENSIONS.includes(ext) || DOCUMENT_MIMES.includes(mime);
  const isImgExtOrMime = IMAGE_EXTENSIONS.includes(ext) || IMAGE_MIMES.includes(mime);

  // Helper magic bytes detector
  const buf = req.file.buffer;
  let detectedType = null;
  if (buf.length >= 4) {
    if (buf.toString("utf8", 0, 4) === "%PDF") detectedType = "document"; // PDF
    else if (buf[0] === 0x89 && buf.toString("utf8", 1, 4) === "PNG") detectedType = "image"; // PNG
    else if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) detectedType = "image"; // JPEG
    else if (buf.toString("utf8", 0, 4) === "GIF8") detectedType = "image"; // GIF
    else if (buf.toString("utf8", 0, 2) === "BM") detectedType = "image"; // BMP
    else if (buf.toString("utf8", 0, 4) === "RIFF" && buf.length >= 12 && buf.toString("utf8", 8, 12) === "WEBP") detectedType = "image"; // WEBP
    else if (buf.toString("utf8", 0, 4) === "PK\x03\x04") detectedType = "document"; // DOCX / ZIP
  }

  if (category === "document") {
    if (isImgExtOrMime || detectedType === "image") {
      return res.status(400).json({
        success: false,
        message: "Selected category is 'Document', but uploaded file is an Image.",
      });
    }
    if (!isDocExtOrMime && detectedType !== "document") {
      return res.status(400).json({
        success: false,
        message: "Invalid document file type. Supported formats: PDF, DOC, DOCX, TXT, RTF, ODT.",
      });
    }
  } else if (category === "image") {
    if (isDocExtOrMime || detectedType === "document") {
      return res.status(400).json({
        success: false,
        message: "Selected category is 'Image', but uploaded file is a Document.",
      });
    }
    if (!isImgExtOrMime && detectedType !== "image") {
      return res.status(400).json({
        success: false,
        message: "Invalid image file type. Supported formats: JPG, JPEG, PNG, WEBP, GIF, BMP, TIFF, SVG.",
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid category selected. Category must be 'document' or 'image'.",
    });
  }

  next();
};

const validatePdfUpload = validateFileUpload;

const validateCertificateInput = (req, res, next) => {
  const { studentName, course, institution, issueDate } = req.body;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ success: false, message: "Student Name is required" });
  }

  if (!course || !course.trim()) {
    return res.status(400).json({ success: false, message: "Course Name is required" });
  }

  if (!institution || !institution.trim()) {
    return res.status(400).json({ success: false, message: "Institution Name is required" });
  }

  if (!issueDate) {
    return res.status(400).json({ success: false, message: "Issue Date is required" });
  }

  next();
};

const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, message: "Password is required" });
  }

  next();
};

module.exports = { validateFileUpload, validatePdfUpload, validateCertificateInput, validateAuthInput };
