const mongoose = require('mongoose');

const RechargeRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mobileNumber: { type: String, required: true },
    simCard: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RechargeRequest', RechargeRequestSchema);