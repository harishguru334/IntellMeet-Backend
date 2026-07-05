const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAnalytics } = require("../Controllers/AnalyticsController");

router.get("/", protect, getAnalytics);
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;