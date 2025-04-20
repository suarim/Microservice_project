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
        if (proxyRes.statusCode !== 200) {
            try {
                const responseString = proxyResData.toString('utf8');
                logger.error('Error response from Media Service:', proxyRes.statusCode, responseString);
            } catch (err) {
                logger.error('Error parsing proxyResData:', err.message);
            }
        }
        logger.info('Response Received from Media Service:', proxyRes.statusCode);
        return proxyResData;
    }
    
}));

app.use('/v1/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyoptions,
    // Fix multipart handling for file uploads
    parseReqBody: false, // Don't parse request body for media endpoints
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        
        // Preserve original content-type header
        if (srcReq.headers['content-type']) {
            proxyReqOpts.headers['content-type'] = srcReq.headers['content-type'];
        }
        
        // Preserve content-length header if present
        if (srcReq.headers['content-length']) {
            proxyReqOpts.headers['content-length'] = srcReq.headers['content-length'];
        }
        
        return proxyReqOpts;
    },
    userResDecorator: async (proxyRes, proxyResData, userReq, userRes) => {
        const contentType = proxyRes.headers['content-type'] || '';
        logger.info('Media Service Response Content-Type:', contentType);
        
        // Transfer all headers from the service response
        Object.keys(proxyRes.headers).forEach(key => {
            userRes.setHeader(key, proxyRes.headers[key]);
        });

        // If response is JSON, parse it safely
        if (contentType.includes('application/json')) {
            try {
                const jsonData = JSON.parse(proxyResData.toString('utf8'));
                logger.info('Media Service Response:', jsonData);
                return jsonData;
            } catch (err) {
                logger.error('Failed to parse JSON from Media Service:', err.message);
                return {
                    status: false,
                    message: 'Failed to parse response from Media Service',
                    error: err.message
                };
            }
        }

        logger.info('Returning raw data from Media Service');
        // Otherwise, return raw data (e.g., for file downloads)
        return proxyResData;
    }
}));

app.use('/v1/search',validateToken,proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyoptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        if (proxyRes.statusCode !== 200) {
            try {
                const responseString = proxyResData.toString('utf8');
                logger.error('Error response from Media Service:', proxyRes.statusCode, responseString);
            } catch (err) {
                logger.error('Error parsing proxyResData:', err.message);
            }
        }
        logger.info('Response Received from Media Service:', proxyRes.statusCode);
        return proxyResData;
    }
    
}));



app.use(errorHandler);

app.listen(process.env.PORT, () => {
    logger.info(`API Gateway is running on port:, ${process.env.PORT}`);
    logger.info('Identity Service Running on 3001');
    logger.info('Post Service Running on 3002');
    logger.info('Media Service Running on 3003');
    logger.info('Search Service Running on 3004');

    
    // Log Redis connection status
    redisClient.on('connect', () => {
        logger.info('Redis client connected');
    });
    
    redisClient.on('error', (err) => {
        logger.error('Redis client error:', err);
    });
});