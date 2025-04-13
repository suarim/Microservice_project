const logger = require("../utils/logger");
const Post = require("../models/Post");

const invalidateCache = async (req) => {
  const keys = await req.redisclient.keys("posts:*");
  if (keys.length > 0){
    await req.redisclient.del(keys);
  } 
}

const CreatePost = async (req, res) => {
  try {
    console.log("Creating post");
    const {content,mediaIds} = req.body;
    const newlycreatedPost = await Post.create({
        user: req.user.userId,
        content,
        mediaIds: mediaIds || [] ,
    })
    await newlycreatedPost.save();
    logger.info("Post created successfully");
    await invalidateCache(req);
    logger.info("Cache invalidated");
    return res.status(201).json({
      message: "Post created successfully",
      post: newlycreatedPost,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error creating post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisclient.get(cacheKey);
    if (cachedPosts) {
      logger.info("Cache hit");
      return res.status(200).json(JSON.parse(cachedPosts));
    }
    logger.info("Cache miss");
    const result = await Post.find().sort({ createdAt: -1 }).limit(limit).skip(skip);
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    const posts = {
      posts: result,
      totalPosts,
      totalPages,
      currentPage: page,
    };
    await req.redisclient.setex(cacheKey,300,JSON.stringify(posts));
    logger.info("Posts fetched successfully");
    res.status(200).json({success:true,posts});
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error creating post" });
  }
};

const getPost = async (req, res) => {
  try {
    const {id} = req.params;
    const cacheKey = `posts:${id}`;
    const cachedPost = await req.redisclient.get(cacheKey);
    if (cachedPost) {
      logger.info("Cache hit");
      return res.status(200).json({success:true,post:JSON.parse(cachedPost)});
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    logger.info("Cache miss");
    await req.redisclient.setex(cacheKey,300,JSON.stringify(post));
    logger.info("Post fetched successfully");
    return res.status(200).json({ success: true, post }); 

  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: "Error getting post with the provided id" });
  }
};

const deletePost = async (req, res) => {
  try {
    const {id} = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    logger.info("Post deleted successfully");
    await invalidateCache(req);
    logger.info("Cache invalidated");
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: "Error getting post with the provided id" });
  }
};

module.exports = {
  CreatePost,
  getAllPosts,
  getPost,
  deletePost,
};