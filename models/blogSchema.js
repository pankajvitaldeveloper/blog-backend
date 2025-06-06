const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likeBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

const Blog = mongoose.model('Blog', BlogSchema);
module.exports = Blog;

