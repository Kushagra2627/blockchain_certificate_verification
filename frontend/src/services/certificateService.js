import API from "./api";

export const certificateService = {
  issueCertificate: async (formData) => {
    const response = await API.post("/certificates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getCertificates: async (params = {}) => {
    const response = await API.get("/certificates", { params });
    return response.data;
  },

  getCertificateById: async (identifier) => {
    const response = await API.get(`/certificates/${identifier}`);
    return response.data;
  },

  /**
   * Public PDF Document Verification: Accepts ONLY the PDF File object
   */
  verifyCertificate: async (pdfFile) => {
    const formData = new FormData();
    formData.append("certificatePdf", pdfFile);

    const response = await API.post("/certificates/verify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateCertificate: async (id, data) => {
    const response = await API.put(`/certificates/${id}`, data);
    return response.data;
  },

  deleteCertificate: async (id) => {
    const response = await API.delete(`/certificates/${id}`);
    return response.data;
  },

  downloadPDFUrl: (identifier) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
    return `${baseURL}/certificates/${identifier}/pdf`;
  },

  getQRCode: async (identifier) => {
    const response = await API.get(`/certificates/${identifier}/qrcode`);
    return response.data;
  },
};
