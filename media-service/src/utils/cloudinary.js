const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                resource_type: 'auto', 
                folder: 'social-media-app',
            },
            (error, result) => {
                if (error) {
                    logger.error('Error uploading file to Cloudinary', error);
                    return reject(error);
                }
                logger.info('File uploaded to Cloudinary');
                resolve(result); // Resolving the result after upload is complete
            }
        );
        
        // Uploading the buffer directly
        uploadStream.end(file.buffer); // Send buffer to Cloudinary
    });
};

module.exports = {
    uploadMediaToCloudinary,
};
