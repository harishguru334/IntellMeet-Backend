const Meeting = require("../Models/MeetingModels");
const Task = require("../Models/TaskModels");
const redis = require("../Config/redis");

const getAnalytics = async (req, res) => {
  try {
    const CacheKey = `analytics:${req.user._id}`;

    const Cached = await redis.get(CacheKey);
    if (Cached)
    {
      console.log("Cache hit - analytics");
      return res.json(JSON.parse(Cached));
    }
    const meetings = await Meeting.find({ host: req.user._id });
    const tasks = await Task.find({ createdBy: req.user._id }); 
    const totalMeetings = meetings.length;
    const totalActionItems = meetings.reduce(
      (acc, m) => acc + (m.actionItems?.length || 0),
      0
    );
    const meetingsWithSummary = meetings.filter((m) => m.summary).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "inprogress").length; 
    const todoTasks = tasks.filter((t) => t.status === "todo").length;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const meetingsByDay = last7Days.map((day) => ({
      date: day,
      count: meetings.filter(
        (m) => m.createdAt.toISOString().split("T")[0] === day
      ).length,
    }));

    const result = {
      totalMeetings,
      totalActionItems,
      meetingsWithSummary,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      meetingsByDay,
    };

    await redis.set(CacheKey, JSON.stringify(result), "EX", 120);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics }; 