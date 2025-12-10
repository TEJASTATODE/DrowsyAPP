// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Authorization denied."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.userId,        
            email: decoded.email,
            role: decoded.role || "user"
        };

        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please log in again."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token. Authorization denied."
        });
    }
};
