const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = 'Not found error';
  }
}

module.exports = NotFoundError;
