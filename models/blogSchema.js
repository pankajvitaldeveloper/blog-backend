const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'],
    },
    image :{
        type: String,
        required: true,
    },
    likes : {
        type: Number,
        default: 0,
    },
    
},{timestamps:true})

const Blog = mongoose.model('Blog', UserSchema);
module.exports = Blog;