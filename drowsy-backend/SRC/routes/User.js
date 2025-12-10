const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateToken(user) {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role || "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

router.post("/oauth/google", async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
            });
        }

        const jwtToken = generateToken(user);

        res.json({
            success: true,
            token: jwtToken,
            user,
        });
    } catch (err) {
        console.error("Google OAuth Error:", err);
        res.status(400).json({
            success: false,
            error: "Invalid Google Token",
        });
    }
});

router.get("/profile", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("-googleId");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-googleId");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

router.put("/update/:id", auth, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                error: "Forbidden: cannot update other users",
            });
        }

        const updates = req.body;

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
        }).select("-googleId");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});


router.delete("/:id", auth, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                error: "Forbidden: cannot delete other users",
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

router.put("/update-contact", auth, async (req, res) => {
  try {
    const { emergencyContact } = req.body;

    if (!emergencyContact) {
      return res.status(400).json({ msg: "Phone number is required" });
    }

   
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { emergencyContact: emergencyContact }, 
      { new: true } 
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
module.exports = { userRoutes: router };
