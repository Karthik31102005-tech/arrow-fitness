const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String,
        required: true // needed to delete the image from Cloudinary later
    },
    category: {
        type: String,
        enum: ['event', 'gallery'], // 'event' = events page, 'gallery' = general gym photos
        default: 'gallery'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);