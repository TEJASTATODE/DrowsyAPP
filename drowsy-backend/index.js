require("dotenv").config();
const express = require("express");

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
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


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
