const logger = require('../utils/logger');
const Media = require('../models/Media');
const { deleteMediaFromCloudinary } = require('../utils/cloudinary');
const handlePostDelete = async (event) => {
    console.log("Event received:", event);
    const { postId,mediaIds } = event;
try {
    const mediatodelete = await Media.find({ _id: { $in: mediaIds } });
    if (!mediatodelete) {
        logger.error('No media found to delete');
        return;
    }
    for (const media of mediatodelete) {
        const result = await deleteMediaFromCloudinary(media.publicId);
        if (result) {
            await Media.deleteOne({ _id: media._id });
            logger.info(`Media deleted successfully with public ID: ${media._id} associated with post ID: ${postId}`);

        } else {
            logger.error(`Failed to delete media with public ID: ${media.publicId}`);
        }
    }
} catch (error) {
    logger.error(`Error deleting media: ${error}`);
    throw error;
}
    // Logic to handle media deletion can be added here
}
module.exports = {
    handlePostDelete
}