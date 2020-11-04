export default {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'TRACE', 'OPTIONS', 'CONNECT', 'PATCH']
    },
    url: {
      type: 'string'
    },
    cookies: {
      type: 'object',
      additionalProperties: { type: 'string' }
    },
    query: {
      type: 'string'
    },
    headers: { type: 'object', additionalProperties: { type: ['string', 'number', 'boolean'] } },
    body: {}
  },
  required: ['method', 'url'],
  additionalProperties: false
};
