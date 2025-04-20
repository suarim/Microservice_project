const amqp = require('amqplib');
const logger = require('./logger');

let channel = null;
let connection = null;
const EXCHANGE_NAME = 'media_exchange';
const connecttoRabbitMQ = async () =>{
    try{
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
        logger.info('Connected to RabbitMQ');
    }
    catch (error) {
        logger.error('Error connecting to RabbitMQ:', error);
    }
}
async function publishEventRAbbit(routingKey, message) {
    if(!channel){
        logger.error('RabbitMQ channel is not initialized');
        return;
    }
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info(`Message published to RabbitMQ with routing key: ${routingKey}`);
    
}

async function consumeEvent(routingKey, callback) {
    if(!channel){
        logger.error('RabbitMQ channel is not initialized');
        return;
    }
    const queue = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(queue.queue, EXCHANGE_NAME, routingKey);
    channel.consume(queue.queue, (msg) => {
        if (msg !== null) {
            callback(JSON.parse(msg.content.toString()));
            channel.ack(msg);
        }
    });
    
}
module.exports = {connecttoRabbitMQ,publishEventRAbbit,consumeEvent}