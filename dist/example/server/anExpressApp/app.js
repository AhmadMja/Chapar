"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _httpErrors = _interopRequireDefault(require("http-errors"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _index = _interopRequireDefault(require("../../../index"));

var indexRouter = require('./routes');

var app = (0, _express["default"])();
app.use((0, _morgan["default"])('dev'));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use((0, _cookieParser["default"])());
app.use('/', indexRouter);
var config = {
  // required
  rabbitMQ: {
    host: 'localhost',
    // required
    port: 5672,
    // required
    username: 'AhmadMja',
    // optional, (needed if rabbitMQ server requires authentication)
    password: '125879Mja' // optional, (needed if rabbitMQ server requires authentication)

  },
  // required
  exchange: {
    name: 'MY_APP_EXCHANGE_NAME',
    // required
    type: 'direct',
    // optional, default='direct'
    options: {
      // optional
      durable: true // optional, default='{ durable: true }'

    }
  },
  // optional
  requestQueue: {
    name: 'HTTP_OVER_AMQP',
    // optional, default='HTTP_OVER_AMQP'
    // optional
    options: {
      exclusive: false // optional, default={ exclusive: false }

    },
    bindKey: 'HTTP_OVER_AMQP_ROUTING_KEY',
    // optional, default='HTTP_OVER_AMQP_ROUTING_KEY',
    prefetch: 0 // optional, default=0 witch means unlimited

  }
};

_index["default"].RPCServer(app, config);

app.use(function (req, res, next) {
  next((0, _httpErrors["default"])(404));
}); // eslint-disable-next-line no-unused-vars

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    data: err.toString()
  });
});
module.exports = app;