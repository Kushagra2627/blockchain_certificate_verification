// Vercel Serverless Entry Point
// This file adapts the Express app for Vercel's serverless function runtime.

require("dotenv").config({ path: require("path").join(__dirname, "../backend/.env") });

const app = require("../backend/app");
const connectDB = require("../backend/config/db");
const { initEthereum } = require("../backend/config/ethereum");

// Initialize connections once (Vercel reuses warm instances)
let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await connectDB();
    initEthereum();
    initialized = true;
  }
}

module.exports = async (req, res) => {
  await ensureInit();
  return app(req, res);
};
