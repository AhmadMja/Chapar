import Ajv from 'ajv';
import amqp from 'amqplib';
import ExpressRequest from './schema/Request';
import ExpressResponse from './schema/Response';
import httpRequestSchema from './validator/httpRequest';
import httpResponseSchema from './validator/httpResponse';

const rabbitMQError = new Error('RabbitMQ');
const ajv = new Ajv();
const validateHttpRequest = ajv.compile(httpRequestSchema);
const validateHttpResponse = ajv.compile(httpResponseSchema);

export default async function(/* Express App */ app, serverConfig) {
  if (
    !(
      serverConfig != null &&
      serverConfig.rabbitMQ != null &&
      serverConfig.rabbitMQ.host != null &&
      serverConfig.rabbitMQ.port != null &&
      serverConfig.exchange != null &&
      serverConfig.exchange.name != null
    )
  ) {
    throw new Error(
      '[Error] Chapar: Invalid Chapar config. Please specify required options as expected in docs.'
    );
  }

  serverConfig.exchange.type = serverConfig.exchange.type || 'direct';
  serverConfig.exchange.options = serverConfig.exchange.options || { durable: true };
  serverConfig.queueing = serverConfig.queueing || {};
  serverConfig.requestQueue = serverConfig.requestQueue || {};
  serverConfig.requestQueue.name = serverConfig.requestQueue.name || 'HTTP_OVER_AMQP';
  serverConfig.requestQueue.bindKey =
    serverConfig.requestQueue.bindKey || 'HTTP_OVER_AMQP_ROUTING_KEY';
  serverConfig.requestQueue.options = serverConfig.requestQueue.options || { exclusive: false };
  serverConfig.requestQueue.prefetch = serverConfig.requestQueue.prefetch || 0;

  const connection = await amqp.connect(
    serverConfig.rabbitMQ.username == null
      ? `amqp://${serverConfig.rabbitMQ.host}:${serverConfig.rabbitMQ.port}`
      : `amqp://${serverConfig.rabbitMQ.username}:${serverConfig.rabbitMQ.password}@${serverConfig.rabbitMQ.host}:${serverConfig.rabbitMQ.port}`
  );
  connection.on('error', error => {
    console.error(error, '[RabbitMQ] Connection error occured');
    // throw rabbitMQError;
  });

  const channel = await connection.createChannel();
  channel.on('error', error => {
    console.error(error, '[RabbitMQ] Channel error occured');
  });
  channel.assertExchange(
    serverConfig.exchange.name,
    serverConfig.exchange.type,
    serverConfig.exchange.options
  );
  const queue = await channel.assertQueue(
    serverConfig.requestQueue.name,
    serverConfig.requestQueue.options
  );
  channel.prefetch(serverConfig.requestQueue.prefetch);

  console.log(`[INFO] ${serverConfig.exchange.name}.${serverConfig.requestQueue.name} is ready`);

  channel.bindQueue(queue.queue, serverConfig.exchange.name, serverConfig.requestQueue.bindKey);

  channel.consume(queue.queue, async msg => {
    const requestObj = JSON.parse(msg.content.toString());

    if (!validateHttpRequest(requestObj)) {
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(
          JSON.stringify({
            status: 422,
            body: {
              success: false,
              error: 'Unprocessable Entity',
              message: 'Make sure sending a http-over-amqp request in valid schema'
            },
            headers: {}
          })
        ),
        {
          correlationId: msg.properties.correlationId,
          persistent: true
        }
      );
      channel.ack(msg);
      return;
    }

    const { method, url, cookies, query, headers, body } = requestObj;

    const req = new ExpressRequest(method, url, cookies, query, headers, body);
    const res = new ExpressResponse(responseObj => {
      if (!validateHttpResponse(responseObj)) {
        return new Error(
          '[ERROR] Chapar: Invalid http response is not allowed to be sent to the queue'
        );
      }
      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responseObj)), {
        correlationId: msg.properties.correlationId,
        persistent: true
      });
      return channel.ack(msg);
    });
    app(req, res);
  });
}
