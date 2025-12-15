require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { drowsyRoutes } = require("./SRC/routes/DrowsinessLog");
const { authRoutes } = require("./SRC/routes/auth");
const { sessionRoutes } = require("./SRC/routes/Session");
const { userRoutes } = require("./SRC/routes/User");
const { sosRoutes } = require("./SRC/routes/sos");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup
app.use(
  cors({
    origin: "https://drowsy-app-ratx.vercel.app", // frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ COOP + COEP headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none"); // safer for dev
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none"); // safer for dev
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Backend API proxying
const PYTHON_URL = "https://photophilous-maliyah-subinvolute.ngrok-free.dev";
const PYTHON_VIDEO_FEED = `${PYTHON_URL}/video_feed`;

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

app.post("/api/start_detection", async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/start_detection`, req.body);
    res.json(response.data);
  } catch (err) {
    console.error("Python start_detection error:", err.message);
    res.status(500).send("Cannot start detection");
  }
});

app.get("/api/status", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/status`);
    res.json(response.data);
  } catch (err) {
    console.error("Python status error:", err.message);
    res.status(500).send("Cannot fetch status");
  }
});

app.post("/api/update_gps", async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/update_gps`, req.body);
    res.json(response.data);
  } catch (err) {
    console.error("Python update_gps error:", err.message);
    res.status(500).send("Cannot update GPS");
  }
});

app.post("/api/stop_detection", async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_URL}/stop`, req.body);
    res.json(response.data);
  } catch (err) {
    console.error("Python stop error:", err.message);
    res.status(500).send("Cannot stop detection");
  }
});

// Routes
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
