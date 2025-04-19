require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const redis = require('ioredis');
const logger = require('./utils/logger');
const mediaRoutes = require('./routes/media-routes');
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req,res,next)=>{
    logger.info(`${req.method} ${req.url}`);
    next();
})
app.use('/api/media', mediaRoutes);
app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        logger.info('Connected to MongoDB');
        logger.info(`Server is running on port ${process.env.PORT}`);
    })
    .catch((error) => {
        logger.error('Error connecting to MongoDB:', error);
    });
});