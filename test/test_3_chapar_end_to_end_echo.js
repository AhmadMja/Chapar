import 'colors';
import amqp from 'amqplib';
import { describe, it, before, after } from 'mocha';
import chai from 'chai';
import chaiSubset from 'chai-subset';
import RPC from '../src';

const { expect } = chai;
chai.use(chaiSubset);

describe(`${
  '[TEST] Chapar: Testing if Chapar client server end to end connection works properly.'.blue
}`, async () => {
  let clientConfig;
  let clientConnection;
  let channel;
  let queue;

  before(done => {
    console.log(
      '[INFO] Chapar: running an example server to test the chapar-client functionality.'
    );

    // eslint-disable-next-line global-require
    require('../src/example/server/index');

    // eslint-disable-next-line import/no-dynamic-require,global-require,prefer-destructuring
    clientConfig = require(`${__dirname}/.chaparconf.js`).clientConfig;
    done();
  });

  after(done => {
    done();
  });

  it('A client should be able to initiate all setup on rabbitMQ needed for Chapar operation', async () => {
    clientConnection = await amqp.connect(
      clientConfig.rabbitMQ.username == null
        ? `amqp://${clientConfig.rabbitMQ.host}:${clientConfig.rabbitMQ.port}`
        : `amqp://${clientConfig.rabbitMQ.username}:${clientConfig.rabbitMQ.password}@${clientConfig.rabbitMQ.host}:${clientConfig.rabbitMQ.port}`
    );
    expect(clientConnection).not.to.be.a('null');
    expect(clientConnection).not.to.be.an('undefined');
    channel = await clientConnection.createChannel();
    expect(channel).not.to.be.a('null');
    expect(channel).not.to.be.an('undefined');
    channel.assertExchange('CHAPAR_TEST_EXCHANGE', 'direct');
    queue = await channel.assertQueue('HTTP_OVER_AMQP_REPLY_QUEUE', {
      exclusive: true
    });
    expect(queue).not.to.be.a('null');
    expect(queue).not.to.be.an('undefined');
    channel.prefetch(0);
    expect(queue).not.to.be.a('null');
    expect(queue).not.to.be.an('undefined');
  });

  it('Testing end-to-end connection on Chapar, a Chapar client sends an http-over-amqp message to echo server and should receive the contents in response.', async () => {
    const RPCClient = await RPC.RPCClient(clientConfig);
    const { status, body, headers } = await RPCClient(
      'POST',
      '/echo',
      {},
      {},
      { 'header-name-1': 'header-value-1', 'header-name-2': 'header-value-2' },
      { 'body-name-1': 'body-value-1', 'body-name-2': 'body-value-2' }
    );
    expect(status).to.be.deep.equal(200);
    expect(body).to.be.deep.equal({ 'body-name-1': 'body-value-1', 'body-name-2': 'body-value-2' });
    expect(headers).to.containSubset({
      'x-powered-by': 'Express',
      'header-name-1': 'header-value-1',
      'header-name-2': 'header-value-2'
    });
  });

  it('Testing end-to-end connection on Chapar, a Chapar client sends an http-over-amqp message to an non-existing route', async () => {
    const RPCClient = await RPC.RPCClient(clientConfig);
    const { status } = await RPCClient(
      'GET',
      '/an-invalid-route',
      {},
      {},
      { 'header-name-1': 'header-value-1', 'header-name-2': 'header-value-2' },
      { 'body-name-1': 'body-value-1', 'body-name-2': 'body-value-2' }
    );
    expect(status).to.be.deep.equal(404);
  });

  it('Testing end-to-end connection on Chapar, an invalid http-over-amqp should not be sent to the queue.', async () => {
    const RPCClient = await RPC.RPCClient(clientConfig);
    try {
      await RPCClient(
        'AN_INVALID_METHOD',
        '/echo',
        {},
        {},
        { 'header-name-1': 'header-value-1', 'header-name-2': 'header-value-2' },
        { 'body-name-1': 'body-value-1', 'body-name-2': 'body-value-2' }
      );
    } catch (err) {
      expect(err.message).to.be.deep.equal(
        '[ERROR] Chapar: Invalid http request is not allowed to be sent to the queue'
      );
      return;
    }
    expect(false).to.be.equal(true);
  });

  it('Testing end-to-end connection on Chapar, an invalid http-over-amqp should not be sent to the queue.', async () => {
    const RPCClient = await RPC.RPCClient(clientConfig);

    const { status } = await RPCClient(
      'GET',
      '/corrupted-response',
      {},
      {},
      { 'header-name-1': 'header-value-1', 'header-name-2': 'header-value-2' },
      { 'body-name-1': 'body-value-1', 'body-name-2': 'body-value-2' }
    );
    expect(status).to.be.deep.equal(500);
  });
});
