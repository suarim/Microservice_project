const mongoose = require('mongoose');
const logger = require('../utils/logger');
const MediaSchema = new mongoose.Schema({
    publicId:{
        type:String,
        required:true,
    },
    OriginalName:{
        type:String,
        required:true,
    },
    mimetype:{
        type:String,
        required:true,
    },
    url:{
        type:String,
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    }
},{timestamps:true});
const MediaModel = mongoose.model('Media',MediaSchema);
module.exports = MediaModel;    