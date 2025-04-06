const express = require('express');
const mongoose = require('mongoose');
const logger = require('../utils/Logger');
const helmet = require('helmet');
const cors = require('cors');
const {RateLimiterRedis} = require('rate-limiter-flexible')
const Redis = require('ioredis');
const {rateLimit} = require('express-rate-limit')
const {RedisStore} = require('rate-limit-redis')
const  routes = require('../routes/identity-service');
const errorHandler = require('../middleware/errorHandler');

MONGO_URI = "mongodb+srv://suarim:suarim@cluster0.ymjv6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
PORT=3002
JWT_SECRET="JWT_SECRET"
NODE_ENV="development"
REDIS_URI="redis://localhost:6379"


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
const redis = new Redis(REDIS_URI);

app.use((req,res,next)=>{
    logger.info(`${req.method} ${req.url} ${req.ip}`);
    logger.info(`Req body : ${req.body}`);
    next();
})

const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix : "middleware",
    points: 10,
    duration: 1,
})


app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>{
        next();
    }).catch((err)=>{
        logger.warn(`Rate limit exceeded for ${req.ip}`);
        res.status(429).json({
            status: false,
            message: 'Too many requests'
        })
    })
})

const sensitiverateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded for sensitive route by IP:', req.ip);
        res.status(429).json({
            status: false,
            message: 'Too many requests'
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    })
});



app.use('/api/auth/register',sensitiverateLimiter);
app.use('/api/auth',routes)
app.use(errorHandler);


app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  mongoose.connect(MONGO_URI).then(()=>{
    logger.info('Connected to MongoDB');
  }).catch((err)=>{
    logger.error(err);
  });
});

process.on('unhandledRejection', (reason) => {
    console.error("Unhandled Rejection:", reason instanceof Error ? reason.stack : reason);
  });
  