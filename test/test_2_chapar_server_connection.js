import 'colors';
import amqp from 'amqplib';
import { describe, it, before, after } from 'mocha';
import chai from 'chai';
import RPC from '../src';

const { expect } = chai;
describe(`${
  '[TEST] Chapar: Testing if Chapar-Server can connect to RabbitMQ server'.blue
}`, async () => {
  let serverConfig;
  let serverConnection;
  let channel;
  let queue;

  before(done => {
    // eslint-disable-next-line import/no-dynamic-require,global-require,prefer-destructuring
    serverConfig = require(`${__dirname}/.chaparconf.js`).serverConfig;
    done();
  });

  after(done => {
    done();
  });

  it('A server should be able to initiate a connection to RabbitMQ broker.', async () => {
    serverConnection = await amqp.connect(
      serverConfig.rabbitMQ.username == null
        ? `amqp://${serverConfig.rabbitMQ.host}:${serverConfig.rabbitMQ.port}`
        : `amqp://${serverConfig.rabbitMQ.username}:${serverConfig.rabbitMQ.password}@${serverConfig.rabbitMQ.host}:${serverConfig.rabbitMQ.port}`
    );
    expect(serverConnection).not.to.be.a('null');
    expect(serverConnection).not.to.be.an('undefined');
  });

  it('A server should be able to create a channel through the connection.', async () => {
    channel = await serverConnection.createChannel();
    expect(channel).not.to.be.a('null');
    expect(channel).not.to.be.an('undefined');
  });

  it('A server should be able to assert an exchange from the channel.', async () => {
    channel.assertExchange(
      serverConfig.exchange.name,
      serverConfig.exchange.type,
      serverConfig.exchange.options
    );
  });

  it('A server should be able to assert a queue from the channel.', async () => {
    queue = await channel.assertQueue(
      serverConfig.requestQueue.name,
      serverConfig.requestQueue.options
    );
    expect(queue).not.to.be.a('null');
    expect(queue).not.to.be.an('undefined');
  });

  it('A server should be able to set the prefetch of the channel.', async () => {
    channel.prefetch(serverConfig.requestQueue.prefetch);
    expect(queue).not.to.be.a('null');
    expect(queue).not.to.be.an('undefined');
  });
});
