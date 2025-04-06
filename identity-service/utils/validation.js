const JOI = require('joi');
const logger = require('../utils/Logger');
logger.info('Validation Schema Loaded');

const validateUserSchema = (data)=>{
    console.log(data);  
    const schema = JOI.object({
        username: JOI.string().required().min(3).max(30),
        email: JOI.string().email().required(),
        password: JOI.string().required().min(6).max(30),
    })
    return schema.validate(data);
}

const validatelogin = (data)=>{
    const schema = JOI.object({
        email: JOI.string().email().required(),
        password: JOI.string().required().min(6).max(30),
    })
    return schema.validate(data);
}

module.exports = {validateUserSchema, validatelogin};