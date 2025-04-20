require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const redis = require('ioredis');
const logger = require('./utils/logger');
const mediaRoutes = require('./routes/media-routes');
const { connecttoRabbitMQ, consumeEvent } = require('./utils/rabbitmq');
const { handlePostDelete } = require('./eventhandler/media-event-handler');
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req,res,next)=>{
    logger.info(`${req.method} ${req.url}`);
    next();
})
app.use('/api/media', mediaRoutes);
async function startServer() {
    try {
      await connecttoRabbitMQ();
      logger.info('Connected to RabbitMQ');
      await consumeEvent('post.deleted',handlePostDelete)
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