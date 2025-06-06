const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // unique: true,
        // enum: ['Technology', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food'],
    },
    description: {
        type: String,
        default: ''
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    }
}, { timestamps: true });

// Create slug before saving
CategorySchema.pre('save', function(next) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    next();
});

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;