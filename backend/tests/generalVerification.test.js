const { validateFileUpload } = require("../middleware/validateMiddleware");

function createMockReqRes(fileObj, bodyObj = {}) {
  const req = {
    file: fileObj,
    body: bodyObj,
  };
  let result = {};
  const res = {
    status: (code) => {
      result.statusCode = code;
      return res;
    },
    json: (data) => {
      result.body = data;
      return res;
    },
  };
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };
  return { req, res, next, getResult: () => ({ ...result, nextCalled }) };
}

describe("General Document/Image Verification Suite", () => {
  // TEST 1: Valid PDF <= 10 MB -> accepted
  test("TEST 1: Valid PDF <= 10 MB -> accepted", () => {
    const pdfBuf = Buffer.from("%PDF-1.4 test content");
    const { req, res, next, getResult } = createMockReqRes({
      buffer: pdfBuf,
      size: pdfBuf.length,
      originalname: "certificate.pdf",
      mimetype: "application/pdf",
    }, { category: "document" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(true);
  });

  // TEST 2: Valid image <= 10 MB -> accepted
  test("TEST 2: Valid image (PNG) <= 10 MB -> accepted", () => {
    const pngBuf = Buffer.from("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR");
    const { req, res, next, getResult } = createMockReqRes({
      buffer: pngBuf,
      size: pngBuf.length,
      originalname: "id_card.png",
      mimetype: "image/png",
    }, { category: "image" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(true);
  });

  // TEST 3: Valid DOCX <= 10 MB -> accepted
  test("TEST 3: Valid DOCX <= 10 MB -> accepted", () => {
    const docxBuf = Buffer.from("PK\x03\x04\x14\x00\x06\x00");
    const { req, res, next, getResult } = createMockReqRes({
      buffer: docxBuf,
      size: docxBuf.length,
      originalname: "deed.docx",
      mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }, { category: "document" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(true);
  });

  // TEST 4 & 5: File > 10 MB -> rejected by backend
  test("TEST 5: File > 10 MB sent directly to backend -> rejected", () => {
    const largeBuf = Buffer.alloc(10 * 1024 * 1024 + 100);
    const { req, res, next, getResult } = createMockReqRes({
      buffer: largeBuf,
      size: largeBuf.length,
      originalname: "huge.pdf",
      mimetype: "application/pdf",
    }, { category: "document" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(false);
    expect(r.statusCode).toBe(400);
    expect(r.body.message).toBe("File size must not exceed 10 MB.");
  });

  // TEST 6: Image selected + valid image -> accepted
  test("TEST 6: Image selected + valid image -> accepted", () => {
    const jpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const { req, res, next, getResult } = createMockReqRes({
      buffer: jpgBuf,
      size: jpgBuf.length,
      originalname: "photo.jpg",
      mimetype: "image/jpeg",
    }, { category: "image" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(true);
  });

  // TEST 7: Document selected + valid document -> accepted
  test("TEST 7: Document selected + valid document -> accepted", () => {
    const txtBuf = Buffer.from("Sample text document content");
    const { req, res, next, getResult } = createMockReqRes({
      buffer: txtBuf,
      size: txtBuf.length,
      originalname: "notes.txt",
      mimetype: "text/plain",
    }, { category: "document" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(true);
  });

  // TEST 8: Image selected + document uploaded -> rejected
  test("TEST 8: Image selected + document uploaded -> rejected", () => {
    const pdfBuf = Buffer.from("%PDF-1.4 test pdf");
    const { req, res, next, getResult } = createMockReqRes({
      buffer: pdfBuf,
      size: pdfBuf.length,
      originalname: "document.pdf",
      mimetype: "application/pdf",
    }, { category: "image" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(false);
    expect(r.statusCode).toBe(400);
    expect(r.body.message).toContain("Selected category is 'Image', but uploaded file is a Document.");
  });

  // TEST 9: Document selected + image uploaded -> rejected
  test("TEST 9: Document selected + image uploaded -> rejected", () => {
    const pngBuf = Buffer.from("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR");
    const { req, res, next, getResult } = createMockReqRes({
      buffer: pngBuf,
      size: pngBuf.length,
      originalname: "picture.png",
      mimetype: "image/png",
    }, { category: "document" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(false);
    expect(r.statusCode).toBe(400);
    expect(r.body.message).toContain("Selected category is 'Document', but uploaded file is an Image.");
  });

  // TEST 13: Unsupported file type -> rejected with clear message
  test("TEST 13: Unsupported file type (e.g. .exe) -> rejected with clear message", () => {
    const exeBuf = Buffer.from("MZ\x90\x00\x03\x00\x00\x00");
    const { req, res, next, getResult } = createMockReqRes({
      buffer: exeBuf,
      size: exeBuf.length,
      originalname: "malicious.exe",
      mimetype: "application/x-msdownload",
    }, { category: "document" });

    validateFileUpload(req, res, next);
    const r = getResult();
    expect(r.nextCalled).toBe(false);
    expect(r.statusCode).toBe(400);
    expect(r.body.message).toContain("Invalid document file type.");
  });
});
