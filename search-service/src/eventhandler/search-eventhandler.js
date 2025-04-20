const logger = require('../utils/logger');
const Search = require('../models/Search'); 
const { publishEventRAbbit } = require('../utils/rabbitmq');
async function CreateSearchPostHandler(event) {
    logger.info('Post Deleted Event Received');
   try {
    const newSearchPost = await Search({
        postId: event.postId,
        userId: event.userId,
        content: event.content,
        createdAt: event.createdAt,
    })
    await newSearchPost.save();
    logger.info(`Search Post Created Successfully -> ${newSearchPost._id}`);
   } catch (error) {
    logger.error('Error in CreateSearchPostHandler:', error);
   }
}

async function DeleteSearchPostHandler(event){
    logger.info('Post Deleted Event Received');
    try {
        const deletedSearchPost = await Search.findOneAndDelete({postId: event.postId});
        if(!deletedSearchPost){
            logger.error('Post Not Found');
            return;
        }
        logger.info(`Search Post Deleted Successfully -> ${deletedSearchPost._id}`);
    } catch (error) {
        logger.error('Error in DeleteSearchPostHandler:', error);
    }
}

module.exports = { CreateSearchPostHandler ,DeleteSearchPostHandler};