const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    avatar: {
    url: String,
    publicId: String
  },
    
},{timestamps:true})

const User = mongoose.model('User', UserSchema);
module.exports = User;