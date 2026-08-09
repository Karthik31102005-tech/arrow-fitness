const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');
const authCheck = require('../middleware/authCheck');

// Configure multer to hold files in memory temporarily before uploading to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB max, enough for UHD photos
});

// POST /api/media/upload - PROTECTED, admin only
router.post('/upload', authCheck, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { title, description, category } = req.body;

        if (!title || !category) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        // Upload to Cloudinary using a stream (works well with memory-stored files)
        const uploadFromBuffer = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'arrow-fitness', quality: 'auto:best' }, // auto-optimizes without visible quality loss
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadFromBuffer();

        const newEvent = new Event({
            title,
            description: description || '',
            imageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            category
        });

        const saved = await newEvent.save();

        res.status(201).json({ message: 'Uploaded successfully', item: saved });

    } catch (err) {
        console.error('Media upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// GET /api/media - PUBLIC, anyone can view gallery/events
router.get('/', async (req, res) => {
    try {
        const { category } = req.query; // optional filter: ?category=event or ?category=gallery
        const filter = category ? { category } : {};
        const items = await Event.find(filter).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error('Fetch media error:', err);
        res.status(500).json({ error: 'Could not fetch media' });
    }
});

// DELETE /api/media/:id - PROTECTED, admin only
router.delete('/:id', authCheck, async (req, res) => {
    try {
        const item = await Event.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        await cloudinary.uploader.destroy(item.cloudinaryPublicId);
        await Event.findByIdAndDelete(req.params.id);

        res.json({ message: 'Deleted successfully' });

    } catch (err) {
        console.error('Delete media error:', err);
        res.status(500).json({ error: 'Delete failed' });
    }
});

module.exports = router;