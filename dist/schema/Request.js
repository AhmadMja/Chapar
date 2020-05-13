"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var ExpressRequest = function ExpressRequest() {
  var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'GET';
  var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
  var cookies = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var query = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var headers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var body = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  (0, _classCallCheck2["default"])(this, ExpressRequest);
  this.method = method;
  this.host = 'localhost';
  this.url = url;
  this.cookies = cookies;
  this.query = query;
  this.headers = headers;
  this.connection = {};
  this.body = body;
};

exports["default"] = ExpressRequest;