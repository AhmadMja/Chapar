"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _src = _interopRequireDefault(require("../../../src"));

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var RPCClient;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _src["default"].RPCClient({
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
                // optional
                options: {
                  durable: true // optional, default='{ durable: true }'

                }
              },
              // optional
              replyQueue: {
                name: '',
                // optional, default=''
                // optional
                options: {
                  exclusive: true // optional, default={ exclusive: true }

                },
                prefetch: 0 // optional, default=0 witch means unlimited

              },
              // optional
              publish: {
                routingKey: 'HTTP_OVER_AMQP_ROUTING_KEY',
                // optional, default='HTTP_OVER_AMQP_ROUTING_KEY',
                // optional
                options: {
                  persistent: true // optional, default=true

                }
              }
            });

          case 2:
            RPCClient = _context2.sent;
            setInterval( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
              var _yield$RPCClient, status, body, headers;

              return _regenerator["default"].wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return RPCClient('GET', '/2', {}, {}, {}, {});

                    case 2:
                      _yield$RPCClient = _context.sent;
                      status = _yield$RPCClient.status;
                      body = _yield$RPCClient.body;
                      headers = _yield$RPCClient.headers;
                      console.log("".concat(status, ", ").concat(body, ", ").concat(headers));

                    case 7:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            })), 1000);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _main.apply(this, arguments);
}

main();