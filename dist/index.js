"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _RPCServer = _interopRequireDefault(require("./RPCServer"));

var _RPCClient = _interopRequireDefault(require("./RPCClient"));

var _default = {
  RPCServer: _RPCServer["default"],
  RPCClient: _RPCClient["default"]
};
exports["default"] = _default;