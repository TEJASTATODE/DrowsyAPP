// routes/auth.js
const express = require("express");
const passport = require("passport");

require("../config/passport");   

const router = express.Router();

const { generateToken } = require("../utils/jwt");


router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/failure" }),
    (req, res) => {
        const token = generateToken(req.user);

        res.json({
            success: true,
            message: "Login Successful",
            token,
            user: req.user
        });
    }
);


router.get("/failure", (req, res) => {
    res.status(401).json({
        success: false,
        message: "OAuth Login Failed"
    });
});


router.get("/logout", (req, res) => {
    req.logout(() => {
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
});

module.exports = { authRoutes: router };
