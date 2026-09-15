const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    documentHash: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    certificateId: {
      type: String,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, "Student Name is required"],
      trim: true,
    },
    studentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    course: {
      type: String,
      required: [true, "Course Name is required"],
      trim: true,
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
      default: "Pass",
    },
    issueDate: {
      type: String,
      required: [true, "Issue Date is required"],
    },
    walletAddress: {
      type: String,
      default: "0x0000000000000000000000000000000000000000",
    },
    transactionHash: {
      type: String,
      default: "",
    },
    blockchainStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Failed", "Revoked"],
      default: "Confirmed",
    },
    isLegacy: {
      type: Boolean,
      default: false,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Stores the exact original PDF bytes so download returns the SAME file
    // whose SHA-256 hash is registered on the blockchain (enables offline verification)
    originalPdf: {
      type: Buffer,
      select: false, // never returned in list/search — only fetched on explicit .select("+originalPdf")
    },
    originalPdfName: {
      type: String,
      default: "certificate.pdf",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Certificate", certificateSchema);
