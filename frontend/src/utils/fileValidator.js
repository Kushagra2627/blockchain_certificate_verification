/**
 * Utility to validate file size (<= 10 MB) and category compatibility
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"];
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".svg"];

export function validateSelectedFile(file, category = "document") {
  if (!file) {
    return { valid: false, error: "Please select a file." };
  }

  // 1. MAXIMUM FILE SIZE — 10 MB
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File size must not exceed 10 MB." };
  }

  const filename = (file.name || "").toLowerCase();
  const ext = filename.lastIndexOf(".") !== -1 ? filename.substring(filename.lastIndexOf(".")) : "";
  const mime = (file.type || "").toLowerCase();

  const isImgMime = mime.startsWith("image/");
  const isImgExt = IMAGE_EXTENSIONS.includes(ext);
  const isImg = isImgMime || isImgExt;

  const isDocMime = mime.startsWith("application/pdf") || mime.includes("word") || mime.includes("text") || mime.includes("rtf") || mime.includes("opendocument");
  const isDocExt = DOCUMENT_EXTENSIONS.includes(ext);
  const isDoc = isDocMime || isDocExt;

  const targetCategory = (category || "document").toLowerCase();

  if (targetCategory === "document") {
    if (isImg && !isDoc) {
      return { valid: false, error: "Selected category is 'Document', but uploaded file is an Image." };
    }
    if (!isDoc && !DOCUMENT_EXTENSIONS.includes(ext)) {
      return { valid: false, error: "Unsupported document format. Allowed: PDF, DOC, DOCX, TXT, RTF, ODT." };
    }
  } else if (targetCategory === "image") {
    if (isDoc && !isImg) {
      return { valid: false, error: "Selected category is 'Image', but uploaded file is a Document." };
    }
    if (!isImg && !IMAGE_EXTENSIONS.includes(ext)) {
      return { valid: false, error: "Unsupported image format. Allowed: JPG, JPEG, PNG, WEBP, GIF, BMP, TIFF, SVG." };
    }
  }

  return { valid: true, error: null };
}
