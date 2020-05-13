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

var _v = _interopRequireDefault(require("uuid/v1"));

var _httpRequest = _interopRequireDefault(require("./validator/httpRequest"));

var _httpResponse = _interopRequireDefault(require("./validator/httpResponse"));

var ajv = new _ajv["default"]();
var validateHttpRequest = ajv.compile(_httpRequest["default"]);
var validateHttpResponse = ajv.compile(_httpResponse["default"]);

function _default(_x) {
  return _ref.apply(this, arguments);
}

function _ref() {
  _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(clientConfig) {
    var connection, channel, queue, callbackCorrMap, RPCImpl, _RPCImpl;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _RPCImpl = function _RPCImpl3() {
              _RPCImpl = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(method, url, cookies, query, headers, body) {
                var requestObj, corr, publishOptions;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        requestObj = {
                          method: method,
                          url: url,
                          cookies: cookies,
                          query: query,
                          headers: headers,
                          body: body
                        };

                        if (validateHttpRequest(requestObj)) {
                          _context.next = 3;
                          break;
                        }

                        return _context.abrupt("return", new Promise(function (resolve, reject) {
                          reject(new Error('[ERROR] Chapar: Invalid http request is not allowed to be sent to the queue'));
                        }));

                      case 3:
                        corr = (0, _v["default"])();
                        publishOptions = clientConfig.publish.options;
                        publishOptions.correlationId = corr;
                        publishOptions.replyTo = queue.queue;
                        channel.publish(clientConfig.exchange.name, clientConfig.publish.routingKey || 'HTTP_OVER_AMQP_ROUTING_KEY', Buffer.from(JSON.stringify(requestObj)), publishOptions);
                        return _context.abrupt("return", new Promise(function (resolve) {
                          callbackCorrMap.push({
                            corr: corr,
                            resolve: resolve
                          });
                        }));

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));
              return _RPCImpl.apply(this, arguments);
            };

            RPCImpl = function _RPCImpl2(_x2, _x3, _x4, _x5, _x6, _x7) {
              return _RPCImpl.apply(this, arguments);
            };

            if (clientConfig != null && clientConfig.rabbitMQ != null && clientConfig.rabbitMQ.host != null && clientConfig.rabbitMQ.port != null && clientConfig.exchange != null && clientConfig.exchange.name != null) {
              _context2.next = 4;
              break;
            }

            throw new Error('[Error] Chapar: Invalid Chapar config. Please specify required options as expected in docs.');

          case 4:
            clientConfig.exchange.type = clientConfig.exchange.type || 'direct';
            clientConfig.exchange.options = clientConfig.exchange.options || {
              durable: true
            };
            clientConfig.queueing = clientConfig.queueing || {};
            clientConfig.replyQueue = clientConfig.replyQueue || {};
            clientConfig.replyQueue.name = clientConfig.replyQueue.name || '';
            clientConfig.replyQueue.options = clientConfig.replyQueue.options || {
              exclusive: true
            };
            clientConfig.replyQueue.prefetch = clientConfig.replyQueue.prefetch || 0;
            clientConfig.publish = clientConfig.publish || {};
            clientConfig.publish.routingKey = clientConfig.publish.routingKey || 'HTTP_OVER_AMQP_ROUTING_KEY';
            clientConfig.publish.options = clientConfig.publish.options || {
              persistent: true
            };
            _context2.next = 16;
            return _amqplib["default"].connect(clientConfig.rabbitMQ.username == null ? "amqp://".concat(clientConfig.rabbitMQ.host, ":").concat(clientConfig.rabbitMQ.port) : "amqp://".concat(clientConfig.rabbitMQ.username, ":").concat(clientConfig.rabbitMQ.password, "@").concat(clientConfig.rabbitMQ.host, ":").concat(clientConfig.rabbitMQ.port));

          case 16:
            connection = _context2.sent;
            _context2.next = 19;
            return connection.createChannel();

          case 19:
            channel = _context2.sent;
            channel.assertExchange(clientConfig.exchange.name, clientConfig.exchange.type, clientConfig.exchange.options);
            _context2.next = 23;
            return channel.assertQueue(clientConfig.replyQueue.name, clientConfig.replyQueue.options);

          case 23:
            queue = _context2.sent;
            channel.prefetch(clientConfig.replyQueue.prefetch);
            callbackCorrMap = [];
            channel.consume(queue.queue, function (msg) {
              var responseObj = JSON.parse(msg.content.toString());

              if (!validateHttpResponse(responseObj)) {
                console.log('[WARNING] Chapar: Invalid http response was fetched in the queue. The message is ignored due to preventing unhandled exceptions.');
              }

              var status = responseObj.status,
                  body = responseObj.body,
                  headers = responseObj.headers;
              var callbackObject = callbackCorrMap.find(function (x) {
                return x.corr === msg.properties.correlationId;
              });

              if (callbackObject && callbackObject.resolve && typeof callbackObject.resolve === 'function') {
                callbackObject.resolve({
                  status: status,
                  body: body,
                  headers: headers
                });
                callbackCorrMap.splice(callbackCorrMap.indexOf(callbackObject), 1);
              } else {
                console.log('[WARNING] Chapar: A message received in the queue witch correlated callback was not found in the client.');
              }
            }, {
              noAck: false
            });
            return _context2.abrupt("return", RPCImpl);

          case 28:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _ref.apply(this, arguments);
}