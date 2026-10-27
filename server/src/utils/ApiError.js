// Error with an HTTP status code; thrown from controllers/middleware and
// formatted by the central error handler.
export default class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
  }
}
