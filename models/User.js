const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    referralCode: { type: String },
    referredBy: { type: String },
    walletBalance: { type: Number, default: 0 },
    activated: { type: Boolean, default: false },
    activationPending: { type: Boolean, default: false },
    utrNumber: { type: String }
});

module.exports = mongoose.model('User', UserSchema);