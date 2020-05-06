"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      "enum": ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS', 'CONNECT', 'PATCH']
    },
    url: {
      type: 'string'
    },
    cookies: {
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    },
    query: {
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    },
    headers: {
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    },
    body: {}
  },
  required: ['method', 'url'],
  additionalProperties: false
};
exports["default"] = _default;