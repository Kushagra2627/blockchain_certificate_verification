const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const { initEthereum } = require("./config/ethereum");

const PORT = process.env.PORT || 5000;

// Initialize MongoDB & Ethereum Provider
connectDB();
initEthereum();

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Certificate Verification Backend Running in [${process.env.NODE_ENV || "development"}] mode`);
  console.log(` Server active on port: http://localhost:${PORT}`);
  console.log(` Health endpoint: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
  server.close(() => process.exit(1));
});
