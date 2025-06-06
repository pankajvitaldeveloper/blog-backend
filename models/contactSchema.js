const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);