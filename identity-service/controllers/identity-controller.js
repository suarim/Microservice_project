const usermodel = require('../models/User');
const logger = require('../utils/Logger');
const {validateUserSchema,validatelogin} = require('../utils/validation');
const generateToken = require('../utils/generateToken');

const userRegistration = async (req,res)=>{
    try{
        console.log(req.body);
        logger.info('User Registration');
        const {error} = validateUserSchema(req.body);
        if(error){
            console.log("--------------------")
            console.log(error);
            console.log("--------------------")
            
            logger.warn('Validation Error');
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }
        const {username, email, password} = req.body;
        let user  = await usermodel.findOne({$or : [{email}, {username}]});
        if(user){
            logger.warn('User Already Exists');
            return res.status(400).json({
                status: false,
                message: 'User Already Exists'
            })
            
        }
        user = new usermodel({
            userid : Math.random().toString(36).substring(2, 12),
            username,
            email,
            password
        })
        await user.save();
        logger.warn('User Registered successfully',user._id); 

        const {accessToken, refreshToken} = await generateToken(user);
        logger.warn('Token Generated Successfully');
        return res.status(200).json({
            status: true,
            message: 'User Registered Successfully',
            accessToken,
            refreshToken
        })
    }
catch(err){
        logger.error('Registration Failed',err);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        })
    }
}

const loginuser = async (req,res)=>{

    try {
        const {error} = validatelogin(req.body);
        if(error){
            logger.warn('Validation Error');
            return res.status(400).json({
                status: false,
                message: error.details[0].message
            })
        }
        const {email, password} = req.body;
        const user = await usermodel.findOne({email});
        if(!user){
            logger.warn('User Not Found');
            return res.status(400).json({
                status: false,
                message: 'User Not Found'
            })
        }
        const match = await user.comparePassword(password);
        if(!match){
            logger.warn('Invalid Password');
            return res.status(400).json({
                status: false,
                message: 'Invalid Password'
            })
        }
        const {accessToken, refreshToken} = await generateToken(user);
        logger.info('Token Generated Successfully');
        return res.status(200).json({
            status: true,
            message: 'Login Successfully',
            user: user._id,
            accessToken,
            refreshToken
        })
    } catch (error) {
        logger.error('Login Failed',error);
        return res.status(500).json({
            status: false,
            message: 'Internal Server Error'
        })
    }
    
}

module.exports = {userRegistration,loginuser};