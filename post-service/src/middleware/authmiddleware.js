const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const authenticationuser = async (req,res,next)=>{
    const userId = req.headers['x-user-id'];
    console.log(userId);
    if(!userId){
        return res.status(401).json({success:false,message: 'Unauthorized user'});
    }
    req.user = {userId}
    next();
    
}
module.exports = {
    authenticationuser
}