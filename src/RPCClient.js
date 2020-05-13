import Ajv from 'ajv';
import amqp from 'amqplib';
import uuid from 'uuid/v1';
import httpRequestSchema from './validator/httpRequest';
import httpResponseSchema from './validator/httpResponse';

const ajv = new Ajv();
const validateHttpRequest = ajv.compile(httpRequestSchema);
const validateHttpResponse = ajv.compile(httpResponseSchema);

export default async function(clientConfig) {
  if (
    !(
      clientConfig != null &&
      clientConfig.rabbitMQ != null &&
      clientConfig.rabbitMQ.host != null &&
      clientConfig.rabbitMQ.port != null &&
      clientConfig.exchange != null &&
      clientConfig.exchange.name != null
    )
  ) {
    throw new Error(
      '[Error] Chapar: Invalid Chapar config. Please specify required options as expected in docs.'
    );
  }

  clientConfig.exchange.type = clientConfig.exchange.type || 'direct';
  clientConfig.exchange.options = clientConfig.exchange.options || { durable: true };
  clientConfig.queueing = clientConfig.queueing || {};
  clientConfig.replyQueue = clientConfig.replyQueue || {};
  clientConfig.replyQueue.name = clientConfig.replyQueue.name || '';
  clientConfig.replyQueue.options = clientConfig.replyQueue.options || { exclusive: true };
  clientConfig.replyQueue.prefetch = clientConfig.replyQueue.prefetch || 0;
  clientConfig.publish = clientConfig.publish || {};
  clientConfig.publish.routingKey = clientConfig.publish.routingKey || 'HTTP_OVER_AMQP_ROUTING_KEY';
  clientConfig.publish.options = clientConfig.publish.options || { persistent: true };

  const connection = await amqp.connect(
    clientConfig.rabbitMQ.username == null
      ? `amqp://${clientConfig.rabbitMQ.host}:${clientConfig.rabbitMQ.port}`
      : `amqp://${clientConfig.rabbitMQ.username}:${clientConfig.rabbitMQ.password}@${clientConfig.rabbitMQ.host}:${clientConfig.rabbitMQ.port}`
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
    clientConfig.exchange.name,
    clientConfig.exchange.type,
    clientConfig.exchange.options
  );
  const queue = await channel.assertQueue(
    clientConfig.replyQueue.name,
    clientConfig.replyQueue.options
  );

  channel.prefetch(clientConfig.replyQueue.prefetch);

  const callbackCorrMap = [];

  channel.consume(
    queue.queue,
    msg => {
      const responseObj = JSON.parse(msg.content.toString());

      if (!validateHttpResponse(responseObj)) {
        console.log(
          '[WARNING] Chapar: Invalid http response was fetched in the queue. The message is ignored due to preventing unhandled exceptions.'
        );
      }

      const { status, body, headers } = responseObj;

      const callbackObject = callbackCorrMap.find(x => x.corr === msg.properties.correlationId);
      if (
        callbackObject &&
        callbackObject.resolve &&
        typeof callbackObject.resolve === 'function'
      ) {
        callbackObject.resolve({ status, body, headers });
        callbackCorrMap.splice(callbackCorrMap.indexOf(callbackObject), 1);
      } else {
        console.log(
          '[WARNING] Chapar: A message received in the queue which correlated callback was not found in the client.'
        );
      }
    },
    { noAck: false }
  );

  async function RPCImpl(method, url, cookies, query, headers, body) {
    const requestObj = { method, url, cookies, query, headers, body };

    if (!validateHttpRequest(requestObj)) {
      return new Promise((resolve, reject) => {
        reject(
          new Error('[ERROR] Chapar: Invalid http request is not allowed to be sent to the queue')
        );
      });
    }

    const corr = uuid();

    const publishOptions = clientConfig.publish.options;
    publishOptions.correlationId = corr;
    publishOptions.replyTo = queue.queue;

    channel.publish(
      clientConfig.exchange.name,
      clientConfig.publish.routingKey || 'HTTP_OVER_AMQP_ROUTING_KEY',
      Buffer.from(JSON.stringify(requestObj)),
      publishOptions
    );

    return new Promise(resolve => {
      callbackCorrMap.push({ corr, resolve });
    });
  }

  return RPCImpl;
}
