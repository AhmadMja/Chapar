import express from 'express';
import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import chapar from '../../../index';

const indexRouter = require('./routes');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

const config = {
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
    prefetch: 0 // optional, default=0 which means unlimited
  }
};

chapar.RPCServer(app, config);

app.use((req, res, next) => {
  next(createError(404));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message, data: err.toString() });
});

module.exports = app;
