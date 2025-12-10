const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emergencyContact: {
        type: String,
        required: false
    },
    avatar: {  
        type: String,
        required: false
    },
    DOB: {
        type: Date,
        required: false
    },  

    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;