const express = require('express');
const { authenticationuser } = require('../middleware/authmiddleware');
const { uploadMedia } = require('../controller/media-controller');
const multer = require('multer');
const router = express.Router();

// Setup multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
}).single('file');

// Wrap multer in a promise-based middleware
const uploadMiddleware = async (req, res, next) => {
    try {
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) {
                    console.error('Multer error:', err);
                    return reject(err);
                }
                resolve();
            });
        });

        if (!req.file) {
            console.warn('No file attached in form-data');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        next();
    } catch (err) {
        console.error('Upload Middleware Error:', err);
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
    }
};

// Route
router.post('/upload',authenticationuser, uploadMiddleware, uploadMedia);

module.exports = router;
