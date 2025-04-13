const crypto = require('crypto');   
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');

const generateToken = async (user) =>{
    const JWT_SECRET = 'JWT_SECRET'
    const accessToken = jwt.sign({
        id:user._id,
        name: user.username,   
    },
    JWT_SECRET,{expiresIn: '3005m'});

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt
    })
    return {accessToken, refreshToken};
}

module.exports = generateToken;
