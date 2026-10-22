const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const { initEthereum } = require("./config/ethereum");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Gracefully connect to MongoDB and Ethereum
  try {
    await connectDB();
  } catch (err) {
    console.error(`[Startup DB Notice]: ${err.message}`);
  }

  try {
    initEthereum();
  } catch (err) {
    console.error(`[Startup Ethereum Notice]: ${err.message}`);
  }

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Certificate Verification Backend Running in [${process.env.NODE_ENV || "development"}] mode`);
    console.log(` Server active on port: http://localhost:${PORT}`);
    console.log(` Health endpoint: http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });

  // Log unhandled rejections without crashing the entire production instance
  process.on("unhandledRejection", (err) => {
    console.error(`[Unhandled Rejection Error]: ${err?.message || err}`);
  });
};

startServer();
