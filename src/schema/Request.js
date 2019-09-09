export default class ExpressRequest {
  constructor(method = 'GET', url = '/', cookies = {}, query = {}, headers = {}, body={}) {
    this.method = method;
    this.host = 'localhost';
    this.url = url;
    this.cookies = cookies;
    this.query = query;
    this.headers = headers;
    this.connection = {};
    this.body = body;
  }
}
