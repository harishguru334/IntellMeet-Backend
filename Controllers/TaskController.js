const Task = require("../Models/TaskModels");
const Meeting = require("../Models/MeetingModels");

// Sabhi tasks lo (agar meetingId diya hai to us meeting ke sabhi participants ke
// tasks dikhao, warna sirf apne khud ke banaye hue tasks — jaisa Kanban board me hota hai)
const getTasks = async (req, res) => {
  try {
    const { meetingId } = req.query;
    const filter = meetingId ? { meetingId } : { createdBy: req.user._id };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Task banao
const createTask = async (req, res) => {
  try {
    const { title, assignee, meetingId } = req.body;
    const task = await Task.create({
      title,
      assignee: assignee || "Unassigned",
      meetingId: meetingId || null,
      createdBy: req.user._id,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Task status update (drag-drop)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Task delete
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Meeting ke action items se tasks import karo
const importFromMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    const tasks = await Promise.all(
      meeting.actionItems.map(item =>
        Task.create({
          title: item.task,
          assignee: item.assignee || "Unassigned",
          meetingId: meeting._id,
          createdBy: req.user._id,
        })
      )
    );

    res.status(201).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, createTask, updateTaskStatus, deleteTask, importFromMeeting };