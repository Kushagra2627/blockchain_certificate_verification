const QRCode = require("qrcode");

/**
 * Generate a Base64 Data URL for a QR code string
 */
const generateQRCodeDataURL = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 300,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
};

module.exports = { generateQRCodeDataURL };
