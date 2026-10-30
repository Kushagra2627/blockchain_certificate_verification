# 🛡️ VARUTHA — Blockchain-Based General Document & Certificate Verification System

VARUTHA is an enterprise-grade, decentralized document and certificate verification platform. It enables institutions to issue tamper-proof academic credentials and precious documents anchored directly on the **Ethereum Blockchain (Sepolia Testnet)** using cryptographic **SHA-256 binary hashing**, backed off-chain by **MongoDB Atlas**.

Verifiers and the public can upload any supported document or image to verify its authenticity in real-time against the Ethereum blockchain — **without requiring any Certificate ID, tracking number, or user login**.

---

## 🌐 Live Deployments

| Component | Platform | URL / Address | Status |
|---|---|---|---|
| **Frontend Web App** | Vercel | [https://blockchain-certificate-verification-five.vercel.app](https://blockchain-certificate-verification-five.vercel.app) | 🟢 Live |
| **Backend REST API** | Render | [https://blockchain-certificate-verification-oq97.onrender.com](https://blockchain-certificate-verification-oq97.onrender.com) | 🟢 Live |
| **API Health Check** | Render | [https://blockchain-certificate-verification-oq97.onrender.com/health](https://blockchain-certificate-verification-oq97.onrender.com/health) | 🟢 Live |
| **Solidity Smart Contract** | Ethereum Sepolia | [`0x32D809EE16D20f00Bb2996A89586fc7879823054`](https://sepolia.etherscan.io/address/0x32D809EE16D20f00Bb2996A89586fc7879823054) | 🟢 Verified |

---

## 🚀 Key Features & Architectural Highlights

### 1. General Document & Image Verification (Beyond PDF)
- **Supported Documents**: PDF, DOC, DOCX, TXT.
- **Supported Images**: JPG, JPEG, PNG, WEBP, GIF, BMP.
- **Strict 10 MB Size Limit**: Enforced both client-side (instant browser rejection) and server-side via Multer and validation middleware.
- **Category & MIME Type Matching**: Users choose `[ Document ]` or `[ Image ]`. The backend cryptographically validates the MIME type against the declared category to block mismatch attacks.

### 2. Cryptographic Byte-Level SHA-256 Hashing
- Verification is based entirely on the **exact uploaded file bytes**, not filenames, file paths, or text conversions.
- The 32-byte hash (`bytes32 documentHash`) is stored on the Ethereum smart contract (`mapping(bytes32 => Certificate)`).
- Any single-byte modification (e.g., modifying a grade, name, or metadata timestamp) produces an entirely different hash, causing on-chain lookup to fail with **`INVALID / TAMPERED DOCUMENT`**.

### 3. SHA-256 Duplicate Issuance Prevention
- **Dual-Layer Pre-Check**: Before issuing, the backend checks both MongoDB and the Ethereum Smart Contract for existing hashes.
- **Immediate Rejection**: If the SHA-256 hash already exists in either layer, issuance halts immediately with `HTTP 409 Conflict`.
- Prevents redundant gas costs, duplicate records, or re-issuance of registered files.

### 4. Zero-Knowledge Public Verification
- Anyone can verify any registered document or image on the public `/verify` portal without logging in or knowing the document ID.
- Verification checks the Ethereum blockchain as the single source of truth, with off-chain metadata enrichment from MongoDB Atlas.

### 5. Role-Based Access Control (RBAC) & Security
- **Admin**: Document issuance, certificate catalog management, duplicate protection oversight, revocation.
- **Student**: Personal student locker to view and download registered authentic documents.
- **Public**: Instant verification portal and login.
- **Security**: JWT authentication, bcrypt password hashing, Helmet HTTP headers, CORS whitelisting, Express Rate Limiting (300 req / 15 min window).

### 6. Resilient Cloud Architecture
- **Vercel Reverse Proxy**: Transparent `/api/*` rewrites in `vercel.json` forward traffic to the Render backend, eliminating cross-origin and cookie/header issues.
- **Dynamic MongoDB Auto-Reconnect**: Middleware automatically recovers Atlas connections on incoming requests if cloud clusters undergo sleep/restart cycles.
- **Alchemy RPC Infrastructure**: High-availability connection to Ethereum Sepolia with gas estimation and block confirmation listeners.

---

## 🛠 Tech Stack

- **Smart Contract & Blockchain**: Solidity (`^0.8.20`), Hardhat, Ethers.js (`v6`), Ethereum Sepolia Testnet, Alchemy RPC, MetaMask
- **Backend API**: Node.js, Express.js, MongoDB Atlas, Mongoose, Multer, Crypto (SHA-256), JWT, Helmet, Express-Rate-Limit
- **Frontend SPA**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6, React Hook Form, React Hot Toast
- **UI Design System**: VeritasLedger VARUTHA (3D rotating blockchain cube, interactive verification console, modern glassmorphism dark theme)
- **Deployment**: Vercel (Frontend), Render (Backend Web Service), MongoDB Atlas (Cloud Database), Alchemy (Ethereum Node Provider)

---

## 📁 Repository Structure

```
blockchain_verification_system/
├── contracts/
│   └── CertificateVerification.sol     # Core Solidity Smart Contract (bytes32 hash-keyed)
├── scripts/
│   └── deploy.js                       # Hardhat Sepolia / Localhost deployment script
├── test/
│   ├── CertificateVerification.test.js # Smart contract Chai test suite
│   ├── generalVerification.test.js     # Multi-format document verification tests
│   └── duplicatePrevention.test.js     # Duplicate SHA-256 hash prevention tests
├── hardhat.config.js                   # Hardhat network config (Localhost, Ganache, Sepolia)
├── vercel.json                         # Vercel SPA build config & reverse-proxy routing
├── render.yaml                         # Render.com Web Service infrastructure-as-code
├── package.json                        # Root workspace scripts & dependencies
├── README.md                           # Project documentation & live links
├── backend/
│   ├── app.js                          # Express app, middleware, routes, auto-reconnect
│   ├── server.js                       # Server initialization & graceful rejection handling
│   ├── createAdmin.js                  # CLI utility for seeding and recovering admin credentials
│   ├── config/
│   │   ├── db.js                       # Mongoose connection with retry & timeout logic
│   │   ├── ethereum.js                 # Ethers.js provider, wallet, and contract setup
│   │   └── contractDetails.json        # Deployed contract address & full ABI
│   ├── controllers/
│   │   ├── authController.js           # Register, Login, Me endpoints
│   │   └── certificateController.js    # Issue, Verify, Download, Revoke, Duplicate checks
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification & Admin RBAC protection
│   │   ├── errorMiddleware.js          # Global error handler with 409 conflict handling
│   │   └── validateMiddleware.js       # File category & 10MB size validation
│   ├── models/
│   │   ├── User.js                     # User schema (Admin / Student / Verifier)
│   │   └── Certificate.js              # Certificate & document metadata with binary storage
│   ├── routes/
│   │   ├── authRoutes.js               # /api/auth endpoints
│   │   └── certificateRoutes.js        # /api/certificates endpoints
│   ├── services/
│   │   └── blockchainService.js        # Ethers.js wrapper for Solidity transactions & lookups
│   └── utils/
│       ├── fileValidator.js            # MIME type and format validators
│       ├── pdfGenerator.js             # PDF stream builder
│       ├── qrGenerator.js              # Verification QR code generator
│       └── generateToken.js            # JWT signature helper
└── frontend/
    ├── index.html                      # HTML5 entry with meta tags and typography
    ├── vite.config.js                  # Vite configuration & dev proxy
    ├── vercel.json                     # Frontend SPA routing configuration
    └── src/
        ├── App.jsx                     # Route definitions & global layout
        ├── main.jsx                    # Application bootstrapping
        ├── index.css                   # Tailwind styling & VARUTHA theme tokens
        ├── components/                 # Navbar, Cube3D, Footer, ProtectedRoute, UI components
        ├── pages/
        │   ├── VerifyCertificate.jsx   # Public multi-format upload & verification page
        │   ├── IssueCertificate.jsx    # Admin document issuance with duplicate detection
        │   ├── CertificateList.jsx     # Institutional catalog & student locker
        │   ├── Dashboard.jsx           # Analytics & admin metrics console
        │   ├── Login.jsx               # Authentication portal
        │   └── Register.jsx            # Account registration
        └── services/
            ├── api.js                  # Axios HTTP client with interceptors
            ├── authService.js          # Authentication API service
            └── certificateService.js   # Document issuance, search, & verification API
```

---

## ⚙️ Running Locally

### 1. Prerequisites
- Node.js (v18 or v20 recommended)
- Git
- MongoDB (local instance or free MongoDB Atlas URI)

### 2. Smart Contract (Hardhat)
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run local node (optional for local testing)
npx hardhat node

# Deploy locally
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Backend Setup
```bash
cd backend
npm install

# Configure backend/.env with your MONGO_URI, JWT_SECRET, RPC_URL, CONTRACT_ADDRESS
npm run dev
```

### 4. Seed Admin User
```bash
cd backend
node createAdmin.js "admin@certverify.com" "Admin@123456" "System Admin" "Global Tech University"
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173/verify`** in your browser to verify documents!

---

## 🧪 Automated Testing

```bash
# Run Solidity smart contract test suite
npm test

# Run backend integration tests
cd backend
npm test
```

---

## 🔒 Security Best Practices Implemented

1. **Immutable Anchoring**: Documents cannot be secretly edited or replaced; hashes on Ethereum are cryptographically immutable.
2. **Binary Integrity**: Hash computation operates directly on file binary buffers rather than derived text.
3. **No Private Keys Exposed**: Smart contract writing is secured on the backend via environment variables; keys are never transmitted to client browsers.
4. **Rate Limiting & Headers**: Protection against DDoS and API abuse using `express-rate-limit` and `helmet`.

---

## 📄 License
This project is licensed under the **MIT License**.
