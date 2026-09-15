const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateAuthInput } = require("../middleware/validateMiddleware");

router.post("/register", registerUser);
router.post("/login", validateAuthInput, loginUser);
router.get("/me", protect, getMe);

module.exports = router;
