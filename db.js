const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB से कनेक्ट हो गया'))
    .catch(err => console.error('MongoDB कनेक्शन में त्रुटि:', err));

module.exports = mongoose;