const mongoose = require('mongoose');
require('dotenv').config();
const readline = require('readline');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB से कनेक्ट हो गया'))
    .catch(err => console.error('MongoDB कनेक्शन में त्रुटि:', err));

// User Schema
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

const User = mongoose.model('User', UserSchema);

// Readline Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function manageUsers() {
    console.log('\n1. सभी रजिस्टर्ड नंबर देखें');
    console.log('2. नंबर हटाएँ');
    console.log('3. बाहर निकलें\n');

    rl.question('क्या करना चाहते हैं? (1/2/3): ', async (choice) => {
        if (choice === '1') {
            const users = await User.find({}, 'phone');
            console.log('\nरजिस्टर्ड नंबर:');
            users.forEach(user => console.log(user.phone));
            manageUsers();
        } else if (choice === '2') {
            rl.question('हटाने के लिए फोन नंबर डालें: ', async (phone) => {
                const result = await User.deleteOne({ phone });
                if (result.deletedCount > 0) {
                    console.log(`${phone} हटा दिया गया`);
                } else {
                    console.log('यह नंबर नहीं मिला');
                }
                manageUsers();
            });
        } else if (choice === '3') {
            console.log('बाहर निकल रहे हैं...');
            rl.close();
            mongoose.connection.close();
        } else {
            console.log('गलत विकल्प, 1, 2 या 3 चुनें');
            manageUsers();
        }
    });
}

manageUsers();