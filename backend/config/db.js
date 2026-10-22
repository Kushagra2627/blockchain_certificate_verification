const mongoose = require("mongoose");
let mongoMemoryServer = null;

const connectDB = async (retryCount = 0) => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blockchain_certificate_db";
  const isProduction = process.env.NODE_ENV === "production";

  // Use a generous 15-second timeout in production to prevent premature fallback
  const timeoutMs = isProduction ? 15000 : 5000;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
    });
    console.log(`[MongoDB Connected]: Host ${conn.connection.host}`);
  } catch (error) {
    if (isProduction) {
      console.error(`[MongoDB Connection Error]: Failed to connect to MongoDB Atlas (${error.message}).`);
      if (retryCount < 3) {
        console.log(`[MongoDB Retry]: Retrying connection to Atlas in 3s (attempt ${retryCount + 1}/3)...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return connectDB(retryCount + 1);
      }
      console.error("[MongoDB Critical]: Exhausted connection retries. Keeping server alive for subsequent requests.");
      return;
    }

    // Development & local test fallback only (never run in production)
    console.warn(`[MongoDB Direct Connection Notice]: Local MongoDB connection timed out (${error.message}). Initializing MongoDB Memory Server...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongoMemoryServer = await MongoMemoryServer.create({
        binary: { version: "7.0.3" }
      });
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB Memory Server Connected]: ${memUri}`);
    } catch (memErr) {
      console.error(`[MongoDB Memory Server Failed]: ${memErr.message}`);
    }
  }
};

module.exports = connectDB;
