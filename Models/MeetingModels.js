const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    meetingCode: { type: String, require: true, Unique: true },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended"],
      default: "Scheduled",
    },
    summry: { type: String, default: "" },
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
