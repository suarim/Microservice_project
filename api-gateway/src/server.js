require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const helmet = require('helmet');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const {validateToken} = require('./middleware/authMiddleware')
const proxy = require('express-http-proxy');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/Logger');
const app = express();
const redisClient = new Redis(process.env.REDIS_URI);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Use a more compatible approach with the RedisStore
const limiter = rateLimit({
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
            sendCommand: (...args) => redisClient.call(...args),
        })
    
});

app.use(limiter);

app.use((req, res, next) => {
    logger.info('Request:', req.method, req.url);
    logger.info(req.body);
    next();
});

const proxyoptions = {
    proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error('Proxy Error:', err);
        res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: err.message
        });
        next(err);
    }
};
console.log(process.env.IDENTITY_SERVICE_URL);
app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyoptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info('Response Received from Identity Service:', proxyRes.statusCode);
        return proxyResData;
    }
}));

app.use('/v1/posts',validateToken,proxy(process.env.POST_SERVICE_URL, {
    ...proxyoptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info('Response Received from Post Service:', proxyRes.statusCode);
        return proxyResData;
    }
}));

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    logger.info(`API Gateway is running on port:, ${process.env.PORT}`);
    logger.info('Identity Service Running on 3001');
    logger.info('Post Service Running on 3002');
    
    // Log Redis connection status
    redisClient.on('connect', () => {
        logger.info('Redis client connected');
    });
    
    redisClient.on('error', (err) => {
        logger.error('Redis client error:', err);
    });
});