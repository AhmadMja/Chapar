export default {
  type: 'object',
  properties: {
    status: {
      type: 'integer'
    },
    body: {},
    headers: { type: 'object', additionalProperties: { type: ['string', 'number', 'boolean'] } }
  },
  required: ['status'],
  additionalProperties: false
};
