require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const{drowsyRoutes} = require("./SRC/routes/DrowsinessLog");
const{authRoutes} = require("./SRC/routes/auth");
const{sessionRoutes} = require("./SRC/routes/Session");
const{userRoutes} = require("./SRC/routes/User");
const {sosRoutes}= require("./SRC/routes/sos");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const app = require("./SRC/app.js");
app.use(cookieParser());
app.use(cors({
  origin:"https://drowsy-app-ratx.vercel.app", // frontend URL
   credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


const PYTHON_VIDEO_FEED = "https://photophilous-maliyah-subinvolute.ngrok-free.dev/video_feed";

// Proxy route
app.get("/api/video_feed", async (req, res) => {
  try {
    const response = await axios({
      method: "get",
      url: PYTHON_VIDEO_FEED,
      responseType: "stream",
    });

    res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");

    response.data.pipe(res);
  } catch (err) {
    console.error("Video feed error:", err.message);
    res.status(500).send("Cannot fetch video feed");
  }
});
// Node server
app.post("/api/start_detection", async (req, res) => {
  try {
    const response = await axios.post("https://photophilous-maliyah-subinvolute.ngrok-free.dev/start_detection", req.body);
    res.json(response.data);
  } catch (err) {
    console.error("Python start_detection error:", err.message);
    res.status(500).send("Cannot start detection");
  }
});


app.use("/api/drowsiness", drowsyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sos", sosRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
