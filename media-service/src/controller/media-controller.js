const logger = require('../utils/logger');
const Media = require('../models/Media');
const { uploadMediaToCloudinary } = require('../utils/cloudinary');
const uploadMedia = async (req,res) =>{
    try{
        logger.info('Uploading media');
        if(!req.file){
            logger.error('No file uploaded');
            return res.status(400).json({success:false,message:'No file uploaded'});
        }
        const {originalname,mimetype,buffer} = req.file;
        const userId = req.user.userId;
        logger.info(`Uploading file: ${originalname}`);
        logger.info(`File type: ${mimetype}`);
        logger.info(`File size: ${buffer.length} bytes`);
        logger.info(`User ID: ${userId}`);  
        logger.info('Uploading file to Cloudinary');
        logger.info('--------------------');
        logger.info(req.file['originalname']);
        logger.info('--------------------');
        const result = await uploadMediaToCloudinary(req.file);
        logger.info(result)
        logger.info(`File uploaded to Cloudinary--> ${result.public_id}`);
        const newmedia =  await Media.create({
            publicId:result.public_id,
            OriginalName:originalname,
            mimetype,
            url:result.secure_url,
            userId,
        });
        await newmedia.save();
        res.status(201).json({
            success:true,
            message:'File uploaded successfully',
            media:newmedia,
            mediaid:newmedia._id,
        });

    }catch(error){
        logger.error(error);
        return res.status(500).json({success:false,message:'Error uploading media'});
    }
}
module.exports = {
    uploadMedia
}