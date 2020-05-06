import Ajv from 'ajv';
import _ from 'lodash';
import httpResponseSchema from '../validator/httpResponse';

const ajv = new Ajv();
const validateHttpResponse = ajv.compile(httpResponseSchema);

export default class ExpressResponse {
  constructor(cb) {
    this._removedHeader = {};
    this.headers = {};
    this.end = data => {
      const responseObj = { status: this.code, body: data, headers: this.headers };
      if (!validateHttpResponse(responseObj)) {
        throw new Error('[ERROR] Chapar: Invalid http response is not allowed to be sent to the queue');
      }
      cb({ status: this.code, body: data, headers: this.headers });
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
        for (const key in x) {
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
        for (const key in x) {
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
      if (!_.isNumber(redirectCode)) {
        this.code = 301;
        this.url = url;
      } else {
        this.code = redirectCode;
      }
      this.setHeader('Location', url);
      ExpressResponse.end();
    };
  }
}