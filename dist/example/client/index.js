import RPC from '../../../src';

async function main() {
  const RPCClient = await RPC.RPCClient({
    // required
    rabbitMQ: {
      host: 'localhost', // required
      port: 5672, // required
      username: 'AhmadMja', // optional, (needed if rabbitMQ server requires authentication)
      password: '125879Mja' // optional, (needed if rabbitMQ server requires authentication)
    },
    // required
    exchange: {
      name: 'MY_APP_EXCHANGE_NAME', // required
      type: 'direct', // optional, default='direct'
      // optional
      options: {
        durable: true // optional, default='{ durable: true }'
      }
    },
    // optional
    replyQueue: {
      name: '', // optional, default=''
      // optional
      options: {
        exclusive: true // optional, default={ exclusive: true }
      },
      prefetch: 0 // optional, default=0 witch means unlimited
    },
    // optional
    publish: {
      routingKey: 'HTTP_OVER_AMQP_ROUTING_KEY', // optional, default='HTTP_OVER_AMQP_ROUTING_KEY',
      // optional
      options: {
        persistent: true // optional, default=true
      }
    }
  });

  setInterval(async () => {
    const { status, body, headers } = await RPCClient('GET', '/2', {}, {}, {}, {});
    console.log(`${status}, ${body}, ${headers}`);
  }, 1000);
}

main();