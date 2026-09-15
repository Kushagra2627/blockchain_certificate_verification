const request = require("supertest");
const mongoose = require("mongoose");
const crypto = require("crypto");
const app = require("../app");
const connectDB = require("../config/db");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const BlockchainService = require("../services/blockchainService");

jest.setTimeout(30000);

let adminToken;
let adminUser;

beforeAll(async () => {
  await connectDB();
  await Certificate.deleteMany({});
  await User.deleteMany({});

  // Create admin user for tests
  adminUser = await User.create({
    name: "Admin Tester",
    email: "admin_test@system.com",
    password: "Password123!",
    role: "Admin",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin_test@system.com",
    password: "Password123!",
  });

  adminToken = loginRes.body.data ? loginRes.body.data.token : loginRes.body.token;
});

afterAll(async () => {
  await Certificate.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("PDF Hash Blockchain Certificate API Suite", () => {
  // Sample valid PDF buffer starting with %PDF-
  const validPdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (Original Certificate) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");
  const validPdfHash = crypto.createHash("sha256").update(validPdfBuffer).digest("hex").toLowerCase();

  // Tampered PDF buffer
  const tamperedPdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Title (Tampered Grade 9.8 Certificate) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF");
  const tamperedPdfHash = crypto.createHash("sha256").update(tamperedPdfBuffer).digest("hex").toLowerCase();

  it("Should list certificates (public route)", async () => {
    const res = await request(app).get("/api/certificates");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("Should return 400 when verifying without a PDF file", async () => {
    const res = await request(app).post("/api/certificates/verify").send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it("Should return 400 when uploading non-PDF file", async () => {
    const res = await request(app)
      .post("/api/certificates/verify")
      .attach("certificatePdf", Buffer.from("plain text non pdf content"), "file.txt");
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it("Should return INVALID status for unknown / un-anchored PDF", async () => {
    const res = await request(app)
      .post("/api/certificates/verify")
      .attach("certificatePdf", validPdfBuffer, "sample_cert.pdf");

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verified).toBe(false);
    expect(res.body.status).toEqual("INVALID");
  });

  it("Should return 401 when attempting to issue certificate without token", async () => {
    const res = await request(app)
      .post("/api/certificates")
      .field("studentName", "Kushagra Tomar")
      .field("course", "Computer Science Engineering")
      .field("institution", "IIIT Bhopal")
      .field("issueDate", "2026-09-01")
      .attach("certificatePdf", validPdfBuffer, "cert.pdf");

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it("Should allow Admin to issue certificate with PDF attachment", async () => {
    const spy = jest.spyOn(BlockchainService, "issueCertificateOnChain").mockResolvedValue({
      success: true,
      transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      blockNumber: 1,
      issuerWallet: "0x1111111111111111111111111111111111111111",
    });

    const res = await request(app)
      .post("/api/certificates")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("certificateId", "CERT2026-TEST01")
      .field("studentName", "Kushagra Tomar")
      .field("course", "B.Tech Computer Science")
      .field("institution", "IIIT Bhopal")
      .field("issueDate", "2026-09-01")
      .field("grade", "9.5")
      .attach("certificatePdf", validPdfBuffer, "kushagra_cert.pdf");

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.documentHash).toEqual(validPdfHash);

    spy.mockRestore();
  });

  it("Should verify original PDF as AUTHENTIC", async () => {
    const spy = jest.spyOn(BlockchainService, "getCertificateByDocHash").mockResolvedValue({
      existsOnChain: true,
      isValid: true,
      certificateId: "CERT2026-TEST01",
      studentName: "Kushagra Tomar",
      course: "B.Tech Computer Science",
      institution: "IIIT Bhopal",
      issueDate: "2026-09-01",
      documentHash: validPdfHash,
      timestamp: Date.now(),
      issuerWallet: "0x1111111111111111111111111111111111111111",
      isRevoked: false,
    });

    const res = await request(app)
      .post("/api/certificates/verify")
      .attach("certificatePdf", validPdfBuffer, "kushagra_cert.pdf");

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verified).toBe(true);
    expect(res.body.status).toEqual("AUTHENTIC");
    expect(res.body.certificate.studentName).toEqual("Kushagra Tomar");

    spy.mockRestore();
  });

  it("CRITICAL SECURITY TEST: Should reject tampered PDF as INVALID even if details/ID were unchanged", async () => {
    const spy = jest.spyOn(BlockchainService, "getCertificateByDocHash").mockResolvedValue({
      existsOnChain: false,
      isValid: false,
    });

    const res = await request(app)
      .post("/api/certificates/verify")
      .attach("certificatePdf", tamperedPdfBuffer, "tampered_kushagra_cert.pdf");

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verified).toBe(false);
    expect(res.body.status).toEqual("INVALID");

    spy.mockRestore();
  });
});
