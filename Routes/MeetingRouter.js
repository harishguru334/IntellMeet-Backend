const express = require("express");
const router = express.Router();


const { protect } = require("../middleware/authMiddleware");

const { createMeeting, getMyMeetings, getMeetingById, getMeetingByCode, saveMeetingSummary, } = require("../Controllers/MeetingController");

// Create Meeting
router.post("/create", protect, createMeeting);

// Get My Meetings
router.get("/my", protect, getMyMeetings);

// Join Meeting by Code
router.get("/code/:code", protect, getMeetingByCode);

// Get Single Meeting

router.get("/:id", protect, getMeetingById);


router.put("/:id/summary", protect, saveMeetingSummary);



module.exports = router;
