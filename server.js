const dotenv = require("dotenv");
const express = require("express");
const mogoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./Config/db");
const authRoutes = require("./Routes/authRoutes");
const meetingRoutes = require("./Routes/MeetingRouter");
const http = require("http");
const { Server } = require("socket.io");
const aiRoutes = require("./Routes/AIRoutes");
const taskRoutes = require("./Routes/TaskRoutes");
const analyticsRoutes = require("./Routes/AnalyticsRoutes");
const passport = require("./Config/Passport");
const session = require("express-session");


dotenv.config();

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

connectDB();

// In-memory list of who's currently connected to each meeting room —
// used to show the live "Participants" list on the frontend.
const roomUsers = {};

app.use(cors({
  origin: process.env.FRONTEND_URL ||  "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("join-meeting", ({ meetingId, userName, userId }) => {
    socket.join(meetingId);
    socket.data.meetingId = meetingId;
    socket.data.userName = userName;
    socket.data.userId = userId;

    if (!roomUsers[meetingId]) roomUsers[meetingId] = {};
    roomUsers[meetingId][socket.id] = { userName, userId };

    socket.to(meetingId).emit("user-joined", { userName, socketId: socket.id });
    io.to(meetingId).emit("room-users", Object.values(roomUsers[meetingId]));
    console.log(`${userName} joined meeting ${meetingId}`);
  });
  
 socket.on("transcript-line", ({ meetingId, userName, text }) => {
  socket.to(meetingId).emit("transcript-line", { userName, text });
});

socket.on("send-message", ({ meetingId, message, userName }) => {
  socket.to(meetingId).emit("receive-message", {
    message,
    userName,
    time: new Date().toLocaleTimeString(),
  });
});

  
  socket.on("webrtc-offer", ({ offer, to }) => {
    socket.to(to).emit("webrtc-offer", { offer, from: socket.id });
  });
  
  socket.on("webrtc-answer", ({ answer, to }) => {
    socket.to(to).emit("webrtc-answer", { answer, from: socket.id });
  });
  
  socket.on("webrtc-ice-candidate", ({ candidate, to }) => {
    socket.to(to).emit("webrtc-ice-candidate", { candidate, from: socket.id });
  });
  
  socket.on("broadcast-peer-id", ({ meetingId, peerId, userName }) => {
    socket.data.peerId = peerId;
    socket.to(meetingId).emit("user-peer-id", { peerId, userName });
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const { meetingId, peerId, userName } = socket.data;
    // Let everyone else in the room know this participant left, so their
    // video tile can be removed instead of staying stuck on screen.
    if (meetingId && peerId) {
      socket.to(meetingId).emit("user-left", { peerId, userName });
    }
    if (meetingId && roomUsers[meetingId]) {
      delete roomUsers[meetingId][socket.id];
      io.to(meetingId).emit("room-users", Object.values(roomUsers[meetingId]));
      if (Object.keys(roomUsers[meetingId]).length === 0) {
        delete roomUsers[meetingId];
      }
    }
  });
});

app.get("/", (req, res) => res.send("Server Running"));

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));