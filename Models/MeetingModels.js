const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    meetingCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended"],
      default: "scheduled",
    },
    summary: { type: String, default: "" },
    keyPoints: [{ type: String }],
    actionItems: [
      {
        task: String,
        assignee: String,
        done: { type: Boolean, default: false },
      },
    ],
    transcript: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Meeting", meetingSchema);
