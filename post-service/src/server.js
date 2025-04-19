require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const cors = require('cors'); 
const mongoose = require('mongoose');
const helmet = require('helmet');
const postRouter = require('./routes/post-routes');
const logger = require('./utils/logger');
const {authenticationuser} =require('./middleware/authmiddleware');
const {connecttoRabbitMQ} = require('./utils/rabbitmq');
const app = express();
const redisclient = new Redis(process.env.REDIS_URL);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req,res,next)=>{
    logger.info(`Request method: ${req.method}, Request URL: ${req.url}`);
    next();
},postRouter)

app.use('/api/posts',(req,res,next)=>{
    req.redisclient = redisclient;
    next();
},postRouter)

async function startServer() {
  try {
    await connecttoRabbitMQ();
    logger.info('Connected to RabbitMQ');
    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
      mongoose.connect(process.env.MONGO_URI).then(()=>{
        logger.info('Connected to MongoDB');
      }).catch((err)=>{
        logger.error(err);
      });
    });
  } catch (err) {
    logger.error('Error starting server:', err);
  }
  
}
startServer()
