const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "super_secret_jwt_key_certificate_verification_2026",
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );
};

module.exports = generateToken;
