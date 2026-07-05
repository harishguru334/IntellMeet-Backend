const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  importFromMeeting,
} = require("../Controllers/TaskController");

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.put("/:id/status", protect, updateTaskStatus);
router.delete("/:id", protect, deleteTask);
router.post("/import/:meetingId", protect, importFromMeeting);

module.exports = router;