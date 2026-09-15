const mongoose = require("mongoose");
let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blockchain_certificate_db";
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[MongoDB Connected]: Host ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Direct Connection Notice]: Local MongoDB connection timed out (${error.message}). Initializing MongoDB Memory Server...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB Memory Server Connected]: ${memUri}`);
    } catch (memErr) {
      console.error(`[MongoDB Memory Server Failed]: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
