const Meeting = require("../Models/MeetingModels");
const { v4: uuidv4 } = require('uuid')

// Create Meeting
const createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.create({
      title: req.body.title,
      host: req.user._id,
      meetingCode: uuidv4().slice(0, 8).toUpperCase(),
    });

    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get My Meetings
const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      host: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Single Meeting
const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.status(200).json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createMeeting, getMyMeetings, getMeetingById, };
