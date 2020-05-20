import 'colors';
import amqp from 'amqplib';
import { describe, it, before, after } from 'mocha';
import chai from 'chai';

const { expect } = chai;
describe(`${'[TEST] Chapar: Testing if Chapar-Client can connect to RabbitMQ server'.blue}`, async () => {
  let clientConfig;
  let clientConnection;
  let channel;
  let queue;

  before(done => {
    // eslint-disable-next-line import/no-dynamic-require,global-require,prefer-destructuring
    clientConfig = require(`${__dirname}/.chaparconf.js`).clientConfig;
    done();
  });

  after(async () => {
    return true;
  });

  it('A client should be able to initiate a connection to RabbitMQ broker.', async () => {
    clientConnection = await amqp.connect(
      clientConfig.rabbitMQ.username == null
        ? `amqp://${clientConfig.rabbitMQ.host}:${clientConfig.rabbitMQ.port}`
        : `amqp://${clientConfig.rabbitMQ.username}:${clientConfig.rabbitMQ.password}@${clientConfig.rabbitMQ.host}:${clientConfig.rabbitMQ.port}`
    );
    expect(clientConnection).not.to.be.a('null');
    expect(clientConnection).not.to.be.an('undefined');
  });

  it('A client should be able to create a channel through the connection.', async () => {
    channel = await clientConnection.createChannel();
    expect(channel).not.to.be.a('null');
    expect(channel).not.to.be.an('undefined');
  });

  it('A client should be able to assert an exchange from the channel.', async () => {
    channel.assertExchange(clientConfig.exchange.name, clientConfig.exchange.type, clientConfig.exchange.options);
  });

  it('A client should be able to assert a queue from the channel.', async () => {
    queue = await channel.assertQueue(clientConfig.replyQueue.name, clientConfig.replyQueue.options);
    expect(queue).not.to.be.a('null');
    expect(queue).not.to.be.an('undefined');
  });

  it('A client should be able to set the prefetch of the channel.', async () => {
    channel.prefetch(clientConfig.replyQueue.prefetch);
    expect(queue).not.to.be.a('null');
    expect(queue).not.to.be.an('undefined');
  });
});
