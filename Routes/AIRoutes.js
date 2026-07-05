const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateSummary } = require("../Controllers/AiController");

router.post("/summarize", protect, generateSummary);

module.exports = router;