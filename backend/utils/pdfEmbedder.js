const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");

/**
 * Embeds a verification QR code and caption on the bottom-right corner of the last page of a PDF.
 *
 * @param {Buffer} pdfBuffer - Original uploaded PDF file buffer
 * @param {string} verificationUrl - Public URL for verification (e.g. https://.../verify/:documentId)
 * @returns {Promise<Buffer>} - Modified PDF buffer containing the embedded QR code
 */
const embedQRCodeInPDF = async (pdfBuffer, verificationUrl) => {
  try {
    // 1. Generate QR Code PNG Buffer
    const qrPngBuffer = await QRCode.toBuffer(verificationUrl, {
      type: "png",
      margin: 1,
      width: 300,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0a101d",
        light: "#ffffff",
      },
    });

    // 2. Load the PDF Document
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const qrImage = await pdfDoc.embedPng(qrPngBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 3. Get the last page of the PDF
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();

    // 4. Dimensions & Layout (PDF coordinates originate at bottom-left)
    const qrSize = 75;
    const padding = 6;
    const badgeWidth = qrSize + padding * 2;
    const badgeHeight = qrSize + padding * 2 + 14; // includes caption area
    const marginRight = 25;
    const marginBottom = 20;

    const badgeX = width - badgeWidth - marginRight;
    const badgeY = marginBottom;

    // Draw white background badge with subtle border to ensure readability on any document background
    lastPage.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeWidth,
      height: badgeHeight,
      color: rgb(1, 1, 1), // white fill
      borderColor: rgb(0.8, 0.85, 0.9), // soft border
      borderWidth: 1,
    });

    // Draw QR code image inside badge
    lastPage.drawImage(qrImage, {
      x: badgeX + padding,
      y: badgeY + 16,
      width: qrSize,
      height: qrSize,
    });

    // Draw "Scan to Verify" caption
    const text = "Scan to Verify";
    const textSize = 7.5;
    const textWidth = font.widthOfTextAtSize(text, textSize);
    const textX = badgeX + (badgeWidth - textWidth) / 2;
    const textY = badgeY + 5;

    lastPage.drawText(text, {
      x: textX,
      y: textY,
      size: textSize,
      font,
      color: rgb(0.1, 0.2, 0.4),
    });

    // 5. Serialize and return final PDF Buffer
    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
  } catch (error) {
    console.error("[embedQRCodeInPDF Error]:", error);
    throw error;
  }
};

module.exports = { embedQRCodeInPDF };
