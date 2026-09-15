# Blockchain Based Certificate Verification System

A complete, production-ready full stack web application that allows educational institutions (Admins) to issue tamper-proof certificates anchored on the Ethereum blockchain via Solidity Smart Contracts while keeping off-chain records indexed in MongoDB. Students and third-party auditors can publicly verify any certificate's authenticity in real-time.

---

## Tech Stack

- **Smart Contract & Blockchain**: Solidity (`0.8.20`), Hardhat, Ethers.js (v6), Ganache, MetaMask
- **Backend API**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcryptjs, Helmet, Rate Limiter
- **Frontend SPA**: React (Vite), Tailwind CSS, React Router v6, React Hook Form, React Hot Toast, Lucide Icons
- **Testing**: Hardhat Test (Chai), Supertest, Jest

---

## Directory Structure

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
│   ├── utils/
│   │   └── generateToken.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── certificate.test.js
│   ├── app.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Installation & Setup Instructions

### 1. Root Smart Contract & Hardhat Setup
```bash
# In project root:
npm install
npx hardhat compile
```

### 2. Run Local Hardhat Blockchain Node
```bash
npx hardhat node
```

### 3. Deploy Smart Contract to Local Node
Open a new terminal window:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*Note: This generates `backend/config/contractDetails.json` containing the deployed contract address and ABI.*

### 4. Setup Backend
```bash
cd backend
npm install
```
Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/blockchain_certificate_db
JWT_SECRET=super_secret_jwt_key_certificate_verification_2026
JWT_EXPIRE=30d
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
ISSUER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
Start backend:
```bash
npm run dev
```

### 5. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open browser at `http://localhost:3000`.

---

## Testing Commands

- **Smart Contract Tests**: `npx hardhat test`
- **Backend API Tests**: `cd backend && npm test`

---

## End-to-End Workflow

1. **Admin Registration**: Register account with role `Admin`.
2. **Issue Certificate**: Navigate to `/issue`, enter Certificate ID and student details. Submit to trigger both MongoDB creation & Solidity contract execution.
3. **Public Verification**: Navigate to `/verify`, enter Certificate ID, click "Verify". The engine queries both MongoDB and Ethereum Smart Contract to confirm validity.
