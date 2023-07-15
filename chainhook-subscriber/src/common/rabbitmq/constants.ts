import { Transport } from "@nestjs/microservices";

export const RabbitMQService = 'RABBITMQ_SERVICE';

export const rabbitMQServiceOptions = {
    name: RabbitMQService,
    transport: Transport.RMQ,
    options: {
        urls: ['amqp://admin:supersecretpassword@localhost:5672'],
        queue: 'chainhook_queue',
        queues: [
            {
                name: 'chainhook_queue',
                queueOptions: {
                durable: false
                },
                bindings: [
                {
                    exchange: 'amq.direct', // default exchange
                    routingKeys: [ 'auction_event' ],
                },
                ],
            },
        ],
        queueOptions: {
            durable: false, noAck: true //TODO(doru): Make sure to set this to true in production so rabbitmq doesn't lose messages
        },
    },
};