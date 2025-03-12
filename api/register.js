const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('../db'); // MongoDB कनेक्शन
const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const { phone, password, referralCode } = req.body;
        console.log('रजिस्ट्रेशन शुरू:', { phone, password, referralCode });

        if (!phone || !password || !referralCode) {
            console.log('फील्ड्स अधूरी हैं');
            return res.status(400).json({ message: 'सभी फील्ड्स भरें' });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            console.log('यह फोन नंबर पहले से मौजूद है:', phone);
            return res.status(400).json({ message: 'यह फोन नंबर पहले से रजिस्टर्ड है' });
        }

        let referrer = null;
        if (referralCode !== 'REFSTART') {
            referrer = await User.findOne({ referralCode });
            if (!referrer) {
                console.log('गलत रेफर कोड:', referralCode);
                return res.status(400).json({ message: 'गलत रेफर कोड' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            phone,
            password: hashedPassword,
            referredBy: referralCode
        });
        const savedUser = await newUser.save();
        console.log('यूज़र सफलतापूर्वक सेव हुआ:', savedUser);

        if (referrer) {
            const commissionLevels = [25, 15, 10, 5, 4, 3, 2, 1];
            let currentReferrer = referrer;
            let level = 0;

            while (currentReferrer && level < commissionLevels.length) {
                const commission = commissionLevels[level];
                currentReferrer.walletBalance += commission;
                await currentReferrer.save();
                console.log(`लेवल ${level + 1} कमीशन ${commission} रुपये दिया गया: ${currentReferrer.phone}`);

                if (currentReferrer.referredBy && currentReferrer.referredBy !== 'REFSTART') {
                    currentReferrer = await User.findOne({ referralCode: currentReferrer.referredBy });
                } else {
                    currentReferrer = null;
                }
                level++;
            }
        }

        res.status(201).json({ message: 'रजिस्ट्रेशन सफल', userId: savedUser._id });
    } catch (error) {
        console.error('रजिस्ट्रेशन में त्रुटि:', error.message, error.stack);
        res.status(500).json({ message: 'सर्वर में त्रुटि' });
    }
};