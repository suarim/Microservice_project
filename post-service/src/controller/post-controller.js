const logger = require("../utils/logger");
const Post = require("../models/Post");

const CreatePost = async (req, res) => {
  try {
    const {content,mediaIds} = req.body;
    const newlycreatedPost = await Post.create({
        user: req.user.userId,
        content,
        mediaIds: mediaIds || [] ,
    })
    await newlycreatedPost.save();
    logger.info("Post created successfully");
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
    const {} = req.body;
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Error creating post" });
  }
};

const getPost = async (req, res) => {
  try {
    const {} = req.body;
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: "Error getting post with the provided id" });
  }
};

const deletePost = async (req, res) => {
  try {
    const {} = req.body;
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