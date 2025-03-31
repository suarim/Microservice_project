const mongoose = require('mongoose');
const argon2 = require('argon2');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    userid:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,   
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
}, {timestamps: true});

userSchema.pre('save',async function(next){
    try{
        if(this.isModified){
            this.password = await argon2.hash(this.password);
        }
    }
    catch(err){
        console.log(err);
        next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        return await argon2.verify(this.password, candidatePassword);
    }
    catch(err){
        console.log(err);
        throw new Error(err);
    }
}

userSchema.index({username: 'text', email: 'text'});
const usermodel = mongoose.model('User', userSchema);
module.exports = usermodel;