const winston = require('winston');
NODE_ENV="development"

const logger  = winston.createLogger({
level: NODE_ENV === 'production'? 'info': 'debug',
format: winston.format.combine(
winston.format.timestamp(),
winston.format.splat(),
winston.format.errors({stack: true}),
winston.format.json(),
),
defaultMeta: {service: 'api-gateway'},
transports: [
new winston.transports.Console({
format: winston.format.combine(
winston.format.colorize(),
winston.format.simple()
)}),
new winston.transports.File({filename: 'error.log', level: 'error'}),
new winston.transports.File({filename: 'warn.log', level: 'warn'}), 
new winston.transports.File({filename: 'combined.log'})
]
});

module.exports = logger;