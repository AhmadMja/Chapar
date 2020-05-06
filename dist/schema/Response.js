"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _ajv = _interopRequireDefault(require("ajv"));

var _lodash = _interopRequireDefault(require("lodash"));

var _httpResponse = _interopRequireDefault(require("../validator/httpResponse"));

var ajv = new _ajv["default"]();
var validateHttpResponse = ajv.compile(_httpResponse["default"]);

var ExpressResponse = function ExpressResponse(cb) {
  var _this = this;

  (0, _classCallCheck2["default"])(this, ExpressResponse);
  this._removedHeader = {};
  this.headers = {};

  this.end = function (data) {
    var responseObj = {
      status: _this.code,
      body: data,
      headers: _this.headers
    };

    if (!validateHttpResponse(responseObj)) {
      throw new Error('[ERROR] Chapar: Invalid http response is not allowed to be sent to the queue');
    }

    cb({
      status: _this.code,
      body: data,
      headers: _this.headers
    });
  };

  this.write = this.end;
  this.json = this.end;
  this.send = this.end;
  this.code = 200;

  this.setHeader = function setHeader(key, value) {
    this.headers[key.toLowerCase()] = value;
    return this;
  };

  this.header = function header(x, y) {
    if (arguments.length === 2) {
      this.setHeader(x, y);
    } else {
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (var key in x) {
        this.setHeader(key, x[key]);
      }
    }

    return this;
  };

  this.set = function set(x, y) {
    if (arguments.length === 2) {
      this.setHeader(x, y);
    } else {
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (var key in x) {
        this.setHeader(key, x[key]);
      }
    }

    return this;
  };

  this.status = function status(number) {
    this.code = number;
    return this;
  };

  this.redirect = function (redirectCode, url) {
    if (!_lodash["default"].isNumber(redirectCode)) {
      this.code = 301;
      this.url = url;
    } else {
      this.code = redirectCode;
    }

    this.setHeader('Location', url);
    ExpressResponse.end();
  };
};

exports["default"] = ExpressResponse;