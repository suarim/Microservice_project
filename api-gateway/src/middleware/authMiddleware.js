const jwt = require('jsonwebtoken')
const logger = require('../utils/Logger')
const validateToken = (req,res,next)=>{
    const authtoken = req.headers['authorization']
    const token = authtoken && authtoken.split(" ")[1]
    if(!token){
        logger.warn('authentication is required')
        res.status(401).json({
            success:false,
            message:'Authentication required'
        })
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            logger.warn('invalid token!')
            return res.status(429).json({
                message:'invalid token',
                success: false
            })
        }
        req.user=user
    console.log('user:',user)   
    next()
    })
    
}
module.exports = {validateToken}