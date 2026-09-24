const crypto = require("crypto");
const mongoose = require("mongoose");
const Certificate = require("../models/Certificate");
const { issueCertificate } = require("../controllers/certificateController");
const BlockchainService = require("../services/blockchainService");

// Mock BlockchainService
jest.mock("../services/blockchainService");

describe("Duplicate File / Hash Prevention Suite (Admin Issuance)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createMockReqRes(fileObj, bodyObj = {}) {
    const req = {
      file: fileObj,
      body: bodyObj,
      user: { _id: new mongoose.Types.ObjectId() },
    };
    let statusCode = 200;
    let jsonBody = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonBody = data;
        return res;
      },
    };
    return { req, res, getResult: () => ({ statusCode, body: jsonBody }) };
  }

  // TEST 1 & 2: Issue PDF & Re-issue exact same PDF -> Duplicate rejected
  test("TEST 1 & 2: Issue PDF & Re-issue exact same PDF -> Duplicate detected and rejected with HTTP 409", async () => {
    const pdfBuf = Buffer.from("%PDF-1.4 test certificate document payload");
    const docHash = crypto.createHash("sha256").update(pdfBuf).digest("hex").toLowerCase();

    // Setup mocks
    Certificate.findOne = jest.fn().mockResolvedValueOnce(null); // First call: Not found in DB
    BlockchainService.getCertificateByDocHash = jest.fn().mockResolvedValueOnce({ existsOnChain: false });
    BlockchainService.issueCertificateOnChain = jest.fn().mockResolvedValueOnce({
      transactionHash: "0x123abc",
      issuerWallet: "0x456def",
    });
    Certificate.create = jest.fn().mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      documentHash: docHash,
      studentName: "John Doe",
      course: "Computer Science",
      institution: "MIT",
    });

    // TEST 1: First issuance
    const { req: req1, res: res1, getResult: getRes1 } = createMockReqRes(
      { buffer: pdfBuf, originalname: "cert.pdf", mimetype: "application/pdf" },
      { studentName: "John Doe", course: "Computer Science", institution: "MIT", issueDate: "2026-09-25" }
    );

    await issueCertificate(req1, res1, jest.fn());
    const r1 = getRes1();

    expect(r1.statusCode).toBe(201);
    expect(r1.body.success).toBe(true);
    expect(BlockchainService.issueCertificateOnChain).toHaveBeenCalledTimes(1);

    // TEST 2: Re-issue exact same PDF bytes
    Certificate.findOne = jest.fn().mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      documentHash: docHash,
    }); // Second call: Found in DB

    const { req: req2, res: res2, getResult: getRes2 } = createMockReqRes(
      { buffer: pdfBuf, originalname: "cert.pdf", mimetype: "application/pdf" },
      { studentName: "John Doe", course: "Computer Science", institution: "MIT", issueDate: "2026-09-25" }
    );

    await issueCertificate(req2, res2, jest.fn());
    const r2 = getRes2();

    expect(r2.statusCode).toBe(409);
    expect(r2.body.success).toBe(false);
    expect(r2.body.code).toBe("DUPLICATE_FILE");
    expect(r2.body.message).toContain("Duplicate file detected");
    // TEST 11: Blockchain transaction was NOT called second time
    expect(BlockchainService.issueCertificateOnChain).toHaveBeenCalledTimes(1);
    // TEST 12: Database create was NOT called second time
    expect(Certificate.create).toHaveBeenCalledTimes(1);
  });

  // TEST 3 & 4: Renamed file with identical bytes -> Duplicate detected
  test("TEST 3 & 4: Renamed file with identical bytes -> Duplicate detected (filename ignored)", async () => {
    const imgBuf = Buffer.from("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR test image payload");
    const docHash = crypto.createHash("sha256").update(imgBuf).digest("hex").toLowerCase();

    // Found in DB under original name "original.png"
    Certificate.findOne = jest.fn().mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      documentHash: docHash,
      originalFileName: "original.png",
    });

    const { req, res, getResult } = createMockReqRes(
      { buffer: imgBuf, originalname: "renamed_copy.png", mimetype: "image/png" },
      { studentName: "Jane Doe", course: "Design", institution: "Stanford", issueDate: "2026-09-25", category: "image" }
    );

    await issueCertificate(req, res, jest.fn());
    const r = getResult();

    expect(r.statusCode).toBe(409);
    expect(r.body.code).toBe("DUPLICATE_FILE");
    expect(r.body.message).toContain("Duplicate file detected");
    expect(BlockchainService.issueCertificateOnChain).not.toHaveBeenCalled();
    expect(Certificate.create).not.toHaveBeenCalled();
  });

  // TEST 8: Try issuing a previously registered but revoked file -> Duplicate detected
  test("TEST 8: Try issuing a previously registered but revoked file -> Duplicate detected", async () => {
    const revokedBuf = Buffer.from("%PDF-1.4 revoked document bytes");
    const docHash = crypto.createHash("sha256").update(revokedBuf).digest("hex").toLowerCase();

    // Exists in DB as Revoked
    Certificate.findOne = jest.fn().mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      documentHash: docHash,
      blockchainStatus: "Revoked",
    });

    const { req, res, getResult } = createMockReqRes(
      { buffer: revokedBuf, originalname: "revoked.pdf", mimetype: "application/pdf" },
      { studentName: "Alex Smith", course: "Law", institution: "Harvard", issueDate: "2026-09-25" }
    );

    await issueCertificate(req, res, jest.fn());
    const r = getResult();

    expect(r.statusCode).toBe(409);
    expect(r.body.code).toBe("DUPLICATE_FILE");
    expect(r.body.message).toContain("Duplicate file detected");
    expect(BlockchainService.issueCertificateOnChain).not.toHaveBeenCalled();
    expect(Certificate.create).not.toHaveBeenCalled();
  });

  // TEST 9: Modify one byte of an existing file -> Hash changes -> Allowed as new file
  test("TEST 9: Modify one byte of an existing file -> Hash changes -> Allowed as new file", async () => {
    const originalBuf = Buffer.from("%PDF-1.4 original file content A");
    const modifiedBuf = Buffer.from("%PDF-1.4 original file content B"); // 1 byte changed

    const hashOrig = crypto.createHash("sha256").update(originalBuf).digest("hex").toLowerCase();
    const hashMod = crypto.createHash("sha256").update(modifiedBuf).digest("hex").toLowerCase();

    expect(hashOrig).not.toEqual(hashMod);

    // Modified hash is not in DB and not on chain
    Certificate.findOne = jest.fn().mockResolvedValueOnce(null);
    BlockchainService.getCertificateByDocHash = jest.fn().mockResolvedValueOnce({ existsOnChain: false });
    BlockchainService.issueCertificateOnChain = jest.fn().mockResolvedValueOnce({
      transactionHash: "0x789xyz",
      issuerWallet: "0x123456",
    });
    Certificate.create = jest.fn().mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      documentHash: hashMod,
    });

    const { req, res, getResult } = createMockReqRes(
      { buffer: modifiedBuf, originalname: "cert_v2.pdf", mimetype: "application/pdf" },
      { studentName: "John Doe", course: "Computer Science", institution: "MIT", issueDate: "2026-09-25" }
    );

    await issueCertificate(req, res, jest.fn());
    const r = getResult();

    expect(r.statusCode).toBe(201);
    expect(r.body.success).toBe(true);
    expect(BlockchainService.issueCertificateOnChain).toHaveBeenCalledWith(
      expect.any(String),
      "John Doe",
      "Computer Science",
      "MIT",
      "2026-09-25",
      hashMod
    );
  });
});
