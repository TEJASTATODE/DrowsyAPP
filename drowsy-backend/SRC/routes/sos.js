const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

require('dotenv').config();

router.post('/send', async (req, res) => {
    try {
        const { userId, location, reason } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.emergencyContact) return res.status(400).json({ success: false, message: 'No emergency contact set' });

        const cleanNumber = user.emergencyContact.replace(/\D/g, '').slice(-10);

        console.log(`📞 Attempting SMS to: ${cleanNumber}`);

        
        let mapLink = "Location Unavailable";
        if (location && location.lat) {
            mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
        }

        // 3. Send SMS
        const messageBody = `SOS ALERT! ${user.name} needs help. Reason: ${reason}. Location: ${mapLink}`;

        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            "route": "q",
            "message": messageBody,
            "language": "english",
            "flash": 0,
            "numbers": cleanNumber
        }, {
            headers: {
                "authorization": process.env.FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            }
        });

    
        if (response.data.return) {
            console.log("✅ SMS Sent Successfully:", response.data.message);
            res.json({ success: true, message: 'SOS sent successfully via Fast2SMS' });
        } else {
            console.error("❌ Fast2SMS API Error:", response.data);
            res.status(500).json({ success: false, message: response.data.message });
        }

    } catch (error) {
        
        if (error.response) {
            console.error("❌ Fast2SMS 400 Error Data:", error.response.data);
        } else {
            console.error("❌ Network Error:", error.message);
        }
        res.status(500).json({ success: false, message: 'Failed to send SMS' });
    }
});

module.exports = {sosRoutes: router};