"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  type: 'object',
  properties: {
    status: {
      type: 'integer'
    },
    body: {},
    headers: {
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    }
  },
  required: ['status'],
  additionalProperties: false
};
exports["default"] = _default;