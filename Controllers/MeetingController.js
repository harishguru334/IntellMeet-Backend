const Meeting = require("../Models/MeetingModels");
const { v4: uuidv4 } = require("uuid");
const redis = require("../Config/redis");

// Create Meeting
const createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.create({
      title: req.body.title,
      host: req.user._id,
      meetingCode: uuidv4().slice(0, 8).toUpperCase(),
    });

    // ✅ Cache invalidate karo — new meeting bani
    await redis.del(`meetings:${req.user._id}`);

    res.status(201).json(meeting);
  } catch (err) {
    console.error("Meeting create error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get My Meetings — Cache ke saath
const getMyMeetings = async (req, res) => {
  try {
    const cacheKey = `meetings:${req.user._id}`;

    // ✅ Pehle Redis check karo
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Cache hit — meetings");
      return res.json(JSON.parse(cached));
    }

    // MongoDB se fetch karo
    const meetings = await Meeting.find({
      host: req.user._id,
    }).sort({ createdAt: -1 });

    // ✅ Redis mein save karo — 5 min ke liye
    await redis.set(cacheKey, JSON.stringify(meetings), "EX", 300);

    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Join Meeting by Code — Zoom jaise "Meeting Code" se join
const getMeetingByCode = async (req, res) => {
  try {
    const code = req.params.code?.trim().toUpperCase();
    if (!code) return res.status(400).json({ message: "Meeting code required" });

    const meeting = await Meeting.findOne({ meetingCode: code });
    if (!meeting) return res.status(404).json({ message: "Invalid meeting code" });

    res.status(200).json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const cacheKey = `meeting:${req.params.id}`;

    
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Cache hit — single meeting");
      return res.json(JSON.parse(cached));
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // ✅ Cache karo — 10 min
    await redis.set(cacheKey, JSON.stringify(meeting), "EX", 600);

    res.status(200).json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save Summary — Cache invalidate karo
const saveMeetingSummary = async (req, res) => {
  try {
    const { summary, keyPoints, actionItems, transcript } = req.body;

    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { summary, transcript, actionItems: actionItems.map(item => ({
        task: item.task,
        assignee: item.assignee,
        done: false
      }))},
      { new: true }
    );

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // ✅ Cache invalidate karo
    await redis.del(`meeting:${req.params.id}`);
    await redis.del(`meetings:${req.user._id}`);

    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createMeeting, getMyMeetings, getMeetingById, getMeetingByCode, saveMeetingSummary };