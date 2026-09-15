const validatePdfUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "PDF document file is required" });
  }

  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ success: false, message: "Invalid file type. File must be a PDF document" });
  }

  // Validate magic bytes: PDF files start with %PDF-
  if (!req.file.buffer || req.file.buffer.length < 4 || req.file.buffer.toString("utf8", 0, 4) !== "%PDF") {
    return res.status(400).json({ success: false, message: "Invalid PDF file signature. File is corrupted or not a valid PDF" });
  }

  // Enforce 10MB size limit
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: "PDF file size exceeds maximum limit of 10 MB" });
  }

  next();
};

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

module.exports = { validatePdfUpload, validateCertificateInput, validateAuthInput };
