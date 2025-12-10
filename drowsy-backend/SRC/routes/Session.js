const express = require("express");
const router = express.Router();
const Session = require("../models/Session");


router.post("/start", async (req, res) => {
  try {
    const { userId } = req.body;
    const customSessionId = `${Date.now()}`;


    const active = await Session.findOne({ userId, endTime: null });
    if (active) {
      active.endTime = new Date();
      await active.save();
    }

    const session = await Session.create({
      userId,
      sessionId: customSessionId,
      gpsHistory: [],
      drowsyCount: 0,
      alerts: [],
      duration: 0,
      avgEar: 0,
      avgMar: 0,
      maxScore: 0,
      status: "Safe",
      metrics: { avgEAR: 0, avgMAR: 0, sunglassesOnCount: 0 }
    });

    res.status(201).json({ 
        success: true, 
        sessionId: session.sessionId, 
        mongoId: session._id 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.post("/stop", async (req, res) => {
  try {
    const { sessionId, summary } = req.body; 
    
    
    const session = await Session.findOne({ sessionId: sessionId });
    
    if (!session) {
        console.log("❌ Stop Failed: Session ID not found:", sessionId);
        return res.status(404).json({ error: "Session not found" });
    }

    session.endTime = new Date();

    if (summary) {
        session.duration = summary.duration || 0;
        session.avgEar = summary.avgEar || 0;
        session.avgMar = summary.avgMar || 0;
        session.drowsyCount = summary.drowsyCount || 0;
        session.maxScore = summary.maxScore || 0;

        if (session.drowsyCount > 5 || session.maxScore > 8) {
            session.status = "Danger";
        } else if (session.drowsyCount > 0) {
            session.status = "Warning";
        } else {
            session.status = "Safe";
        }
    }

    await session.save();
    console.log("✅ Session Stopped & Saved:", sessionId);
    res.json({ success: true, message: "Session saved", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/update", async (req, res) => {
  try {
    const { sessionId, latitude, longitude, ear, mar, alert } = req.body;

    const session = await Session.findOne({ sessionId: sessionId });
    
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.endTime) return res.status(400).json({ error: "Session already ended" });

    if (latitude && longitude) {
      session.gpsHistory.push({ latitude, longitude });
    }

    if (!session.updatesCount) session.updatesCount = 0;

    if (ear !== undefined) {
      session.metrics.avgEAR = (session.metrics.avgEAR * session.updatesCount + ear) / (session.updatesCount + 1);
    }
    if (mar !== undefined) {
      session.metrics.avgMAR = (session.metrics.avgMAR * session.updatesCount + mar) / (session.updatesCount + 1);
    }

    if (alert === true) {
      session.alerts.push(new Date());
      session.drowsyCount += 1;
    }

    session.updatesCount += 1;
    await session.save();
    res.json({ success: true, message: "Session updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:sessionId/gps", async (req, res) => {
  try {

    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json(session.gpsHistory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:sessionId", async (req, res) => {
  try {

    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/user/:userId", async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { sessionRoutes: router };