module.exports= {
  clientConfig: {
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
  },
  serverConfig :{
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
      options: {
        // optional
        durable: true // optional, default='{ durable: true }'
      }
    },
    // optional
    requestQueue: {
      name: 'HTTP_OVER_AMQP', // optional, default='HTTP_OVER_AMQP'
      // optional
      options: {
        exclusive: false // optional, default={ exclusive: false }
      },
      bindKey: 'HTTP_OVER_AMQP_ROUTING_KEY', // optional, default='HTTP_OVER_AMQP_ROUTING_KEY',
      prefetch: 0 // optional, default=0 witch means unlimited
    }
  }
};