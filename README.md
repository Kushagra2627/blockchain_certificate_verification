# Blockchain-Based PDF Certificate Verification System

A production-ready full-stack application that enables educational institutions to issue tamper-proof academic certificates. The exact original certificate PDF is hashed using **SHA-256** and anchored directly on the **Ethereum blockchain** via a **Solidity Smart Contract**, while metadata is indexed off-chain in **MongoDB**.

Public verifiers can upload any certificate PDF file to verify its authenticity directly against the Ethereum blockchain in real-time — **without requiring any Certificate ID or user login**.

---

## 🚀 Architecture & Core Principles

1. **Authoritative PDF Document Integrity Verification**:
   - The original certificate PDF bytes are hashed using SHA-256 on the backend.
   - The 32-byte hash (`bytes32 documentHash`) is stored on the Ethereum smart contract (`mapping(bytes32 => Certificate)`).
   - Any single-byte modification (e.g. changing grade 7.8 → 9.8) alters the SHA-256 hash, causing Ethereum lookup to fail → **`INVALID / TAMPERED CERTIFICATE`**.

2. **Public Verification (Zero Certificate ID Requirement)**:
   - Verifiers upload the PDF file **ONLY** on the public `/verify` page.
   - No login, Certificate ID, or text search is required to verify document authenticity.

3. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full portal access (`/dashboard`, `/certificates`, `/issue`, `/verify`).
   - **Student**: Access to `/certificates` to find and download their own official PDF certificate. Direct access to `/dashboard`, `/issue`, or `/verify` automatically redirects to `/certificates`.
   - **Public**: Unauthenticated access to `/verify` (PDF-only upload verification) and `/login`.

---

## 🛠 Tech Stack

- **Blockchain & Smart Contract**: Solidity (`0.8.20`), Hardhat, Ethers.js (`v6`), Ganache / Localhost Node, MetaMask
- **Backend API**: Node.js, Express.js, MongoDB, Mongoose, Multer (PDF File Upload), Crypto (SHA-256), JWT Auth, Helmet, Rate Limiter
- **Frontend SPA**: React (Vite), Vanilla / Tailwind CSS, React Router v6, React Hook Form, React Hot Toast, Lucide Icons
- **Testing**: Hardhat Test (Chai), Supertest, Jest, MongoDB Memory Server

---

## 📁 Directory Structure

```
blockchain-certificate-verification/
├── contracts/
│   └── CertificateVerification.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── CertificateVerification.test.js
├── hardhat.config.js
├── package.json
├── README.md
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── ethereum.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── certificateController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validateMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Certificate.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── certificateRoutes.js
│   ├── services/
│   │   └── blockchainService.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── VerifyCertificate.jsx
    │   │   ├── IssueCertificate.jsx
    │   │   ├── CertificateList.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── services/
    │   └── App.jsx
    └── vite.config.js
```

---

## ⚙️ How to Run Locally

### 1. Hardhat Blockchain Node
```bash
npx hardhat compile
npx hardhat node
# In a second terminal window:
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Express Backend
```bash
cd backend
npm install
npm run dev
```

### 3. React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173/verify`** to test public PDF upload verification!
