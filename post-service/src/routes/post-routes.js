const logger = require("../utils/logger");
const Post = require("../models/Post");
const express = require("express");
const {CreatePost,getAllPosts,getPost,deletePost} = require("../controller/post-controller");
const {authenticationuser} = require("../middleware/authmiddleware");
const router = express.Router();
router.use(authenticationuser);
router.post("/create", CreatePost);
module.exports = router;