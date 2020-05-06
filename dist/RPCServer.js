"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ajv = _interopRequireDefault(require("ajv"));

var _amqplib = _interopRequireDefault(require("amqplib"));

var _Request = _interopRequireDefault(require("./schema/Request"));

var _Response = _interopRequireDefault(require("./schema/Response"));

var _httpRequest = _interopRequireDefault(require("./validator/httpRequest"));

var _httpResponse = _interopRequireDefault(require("./validator/httpResponse"));

var ajv = new _ajv["default"]();
var validateHttpRequest = ajv.compile(_httpRequest["default"]);
var validateHttpResponse = ajv.compile(_httpResponse["default"]);

function _default(_x, _x2) {
  return _ref.apply(this, arguments);
}

function _ref() {
  _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(
  /* Express App */
  app, serverConfig) {
    var connection, channel, queue;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (serverConfig != null && serverConfig.rabbitMQ != null && serverConfig.rabbitMQ.host != null && serverConfig.rabbitMQ.port != null && serverConfig.exchange != null && serverConfig.exchange.name != null) {
              _context2.next = 2;
              break;
            }

            throw new Error('[Error] Chapar: Invalid Chapar config. Please specify required options as expected in docs.');

          case 2:
            serverConfig.exchange.type = serverConfig.exchange.type || 'direct';
            serverConfig.exchange.options = serverConfig.exchange.options || {
              durable: true
            };
            serverConfig.queueing = serverConfig.queueing || {};
            serverConfig.requestQueue = serverConfig.requestQueue || {};
            serverConfig.requestQueue.name = serverConfig.requestQueue.name || 'HTTP_OVER_AMQP';
            serverConfig.requestQueue.bindKey = serverConfig.requestQueue.bindKey || 'HTTP_OVER_AMQP_ROUTING_KEY';
            serverConfig.requestQueue.options = serverConfig.requestQueue.options || {
              exclusive: false
            };
            serverConfig.requestQueue.prefetch = serverConfig.requestQueue.prefetch || 0;
            _context2.next = 12;
            return _amqplib["default"].connect(serverConfig.rabbitMQ.username == null ? "amqp://".concat(serverConfig.rabbitMQ.host, ":").concat(serverConfig.rabbitMQ.port) : "amqp://".concat(serverConfig.rabbitMQ.username, ":").concat(serverConfig.rabbitMQ.password, "@").concat(serverConfig.rabbitMQ.host, ":").concat(serverConfig.rabbitMQ.port));

          case 12:
            connection = _context2.sent;
            _context2.next = 15;
            return connection.createChannel();

          case 15:
            channel = _context2.sent;
            channel.assertExchange(serverConfig.exchange.name, serverConfig.exchange.type, serverConfig.exchange.options);
            _context2.next = 19;
            return channel.assertQueue(serverConfig.requestQueue.name, serverConfig.requestQueue.options);

          case 19:
            queue = _context2.sent;
            channel.prefetch(serverConfig.requestQueue.prefetch);
            console.log("[INFO] ".concat(serverConfig.exchange.name, ".").concat(serverConfig.requestQueue.name, " is ready"));
            channel.bindQueue(queue.queue, serverConfig.exchange.name, serverConfig.requestQueue.bindKey);
            channel.consume(queue.queue, /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(msg) {
                var requestObj, method, url, cookies, query, headers, body, req, res;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        requestObj = JSON.parse(msg.content.toString());

                        if (validateHttpRequest(requestObj)) {
                          _context.next = 5;
                          break;
                        }

                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({
                          status: 422,
                          body: {
                            success: false,
                            error: 'Unprocessable Entity',
                            message: 'Make sure sending a http-over-amqp request in valid schema'
                          },
                          headers: {}
                        })), {
                          correlationId: msg.properties.correlationId,
                          persistent: true
                        });
                        channel.ack(msg);
                        return _context.abrupt("return");

                      case 5:
                        method = requestObj.method, url = requestObj.url, cookies = requestObj.cookies, query = requestObj.query, headers = requestObj.headers, body = requestObj.body;
                        req = new _Request["default"](method, url, cookies, query, headers, body);
                        res = new _Response["default"](function (responseObj) {
                          if (!validateHttpResponse(responseObj)) {
                            return new Error('[ERROR] Chapar: Invalid http response is not allowed to be sent to the queue');
                          }

                          channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responseObj)), {
                            correlationId: msg.properties.correlationId,
                            persistent: true
                          });
                          return channel.ack(msg);
                        });
                        app(req, res);

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x3) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 24:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _ref.apply(this, arguments);
}