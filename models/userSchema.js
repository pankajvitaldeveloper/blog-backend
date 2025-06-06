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
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }], // Array of blog IDs that the user has favorited
  likeBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }], // Array of blog IDs that the user has liked
    
},{timestamps:true})

const User = mongoose.model('User', UserSchema);
module.exports = User;