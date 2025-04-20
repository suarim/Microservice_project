require('dotenv').config();
const express = require('express');
const Redis = require('ioredis');
const cors = require('cors'); 
const mongoose = require('mongoose');
const helmet = require('helmet');
const logger = require('./utils/logger');
const {connecttoRabbitMQ,consumeEvent} = require('./utils/rabbitmq');
const searchRoutes = require('./routes/search-routes');
const { CreateSearchPostHandler,DeleteSearchPostHandler } = require('./eventhandler/search-eventhandler');
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req,res,next)=>{
    logger.info(`${req.method} ${req.url}`);
    next();
})
app.use('/api/search',searchRoutes);
async function startServer() {
    try {
      await connecttoRabbitMQ();
      logger.info('Connected to RabbitMQ');
      await consumeEvent('post.created',CreateSearchPostHandler)
      await consumeEvent('post.deleted',DeleteSearchPostHandler)

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
  