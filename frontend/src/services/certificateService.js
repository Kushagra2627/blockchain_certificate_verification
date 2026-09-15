import api from "./api";

export const certificateService = {
  /**
   * Verify a certificate by uploading its original PDF.
   * Backend: POST /api/certificates/verify
   * Returns: { success, verified, status, certificate, blockchainProof, uploadedDocumentHash }
   */
  async verifyCertificate(file) {
    const formData = new FormData();
    formData.append("certificatePdf", file);
    // Do NOT set Content-Type header manually — axios sets multipart/form-data with boundary automatically
    const response = await api.post("/certificates/verify", formData);
    return response.data;
  },

  /**
   * Issue a new certificate (Admin only).
   * Backend: POST /api/certificates  (NOT /certificates/issue)
   * Requires: Authorization Bearer token
   */
  async issueCertificate(formData) {
    // formData is already a FormData object from caller
    const response = await api.post("/certificates", formData);
    return response.data;
  },

  /**
   * Get all certificates with optional search/pagination.
   * Backend: GET /api/certificates?page=&limit=&search=
   * Returns: { success, data: [...], pagination: { total, page, pages, limit } }
   */
  async getCertificates(params = {}) {
    const response = await api.get("/certificates", { params });
    return response.data;
  },

  /**
   * Get single certificate by MongoDB _id or certificateId or documentHash.
   * Backend: GET /api/certificates/:identifier
   * Returns: { success, data: {...}, blockchainVerification: {...} }
   */
  async getCertificateById(identifier) {
    const response = await api.get(`/certificates/${identifier}`);
    return response.data;
  },

  /**
   * Update certificate metadata (Admin only).
   * Backend: PUT /api/certificates/:id
   */
  async updateCertificate(id, updateData) {
    const response = await api.put(`/certificates/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete a certificate record (Admin only).
   * Backend: DELETE /api/certificates/:id
   */
  async deleteCertificate(id) {
    const response = await api.delete(`/certificates/${id}`);
    return response.data;
  },

  /**
   * Get download PDF URL for a certificate.
   * Backend: GET /api/certificates/:certificateId/pdf
   */
  getPdfDownloadUrl(certificateId) {
    return `/api/certificates/${certificateId}/pdf`;
  },

  /**
   * Get QR code data URL for a certificate.
   * Backend: GET /api/certificates/:certificateId/qrcode
   */
  async getQRCode(certificateId) {
    const response = await api.get(`/certificates/${certificateId}/qrcode`);
    return response.data;
  },
};
