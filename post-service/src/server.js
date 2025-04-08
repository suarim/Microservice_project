require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const cors = require('cors'); 
const mongoose = require('mongoose');
const helmet = require('helmet');
const postRouter = require('./routes/post-routes');
const logger = require('./utils/logger');
const app = express();
const redisclient = new Redis(process.env.REDIS_URL);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req,res,next)=>{
    logger.info(`Request method: ${req.method}, Request URL: ${req.url}`);
    next();
})

app.use((req,res,next)=>{
    req.redisclient = redisclient;
    next();
})

app.listen(process.env.PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT}`);
    mongoose.connect(process.env.MONGO_URI).then(()=>{
      logger.info('Connected to MongoDB');
    }).catch((err)=>{
      logger.error(err);
    });
  });