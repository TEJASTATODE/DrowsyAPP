const express = require("express");
const router = express.Router();
const DrowsyLog = require("../models/DrowsinessLog");
const Session = require("../models/Session");
const auth = require("../middleware/auth");


router.post("/create", auth, async (req, res) => {
  try {
    console.log("📥 Incoming Log:", req.body);

    const {
      sessionId,
      ear,
      mar,
      tilt,
      score,
      isDrowsy,
      alertTriggered,
      alertType,
      status,
      faceLandmarks,
      gps,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.id, 
    });

    if (!session)
      return res.status(404).json({ error: "Session not found or unauthorized" });

    
    const log = await DrowsyLog.create({
      sessionId,
      ear: ear ?? 0,
      mar: mar ?? 0,
      tilt: tilt ?? 0,
      score: score ?? 0,
      isDrowsy: isDrowsy ?? false,
      alertTriggered: alertTriggered ?? false,
      alertType: alertType || null,
      status: status || "Safe",
      faceLandmarks: faceLandmarks || null,
      gps: gps || { lat: 0, lng: 0 },
    });

    return res.status(201).json({ success: true, log });
  } catch (err) {
    console.error("❌ Drowsiness Log Error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/session/:sessionId", auth, async (req, res) => {
  try {
    const logs = await DrowsyLog.find({
      sessionId: req.params.sessionId,
    }).sort({ timestamp: 1 });

    return res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/user/:userId", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).select("_id");
    const sessionIds = sessions.map((s) => s._id);

    const logs = await DrowsyLog.find({
      sessionId: { $in: sessionIds },
    }).sort({ timestamp: 1 });

    return res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/stats/:sessionId", auth, async (req, res) => {
  try {
    const logs = await DrowsyLog.find({
      sessionId: req.params.sessionId,
    });

    if (!logs.length)
      return res.status(404).json({ error: "No logs found" });

    const totalDrowsy = logs.filter((l) => l.isDrowsy).length;
    const totalAlerts = logs.filter((l) => l.alertTriggered).length;

    const avgEAR = logs.reduce((s, l) => s + (l.ear || 0), 0) / logs.length;
    const avgMAR = logs.reduce((s, l) => s + (l.mar || 0), 0) / logs.length;
    const avgTilt = logs.reduce((s, l) => s + (l.tilt || 0), 0) / logs.length;

    return res.json({
      totalLogs: logs.length,
      totalDrowsy,
      totalAlerts,
      avgEAR,
      avgMAR,
      avgTilt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { drowsyRoutes: router };
