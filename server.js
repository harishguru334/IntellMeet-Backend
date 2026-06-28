const express = require("express");
const mogoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./Routes/authRoutes");
const meetingRoutes = require("./Routes/MeetingRouter");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

connectDB();

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-meeting", ({ meetingId, userName }) => {
    socket.join(meetingId);
    socket.to(meetingId).emit("user-joined", { userName, socketId: socket.id });
    console.log(`${userName} joined meeting ${meetingId}`);
  });

  socket.on("send-message", ({ meetingId, message, userName }) => {
    io.to(meetingId).emit("receive-message", {
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
    
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => res.send("Server Running"));

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
