export default class ValidationException extends Error {
  constructor(message, errors) {
    super(message);
    this.errors = {};
    this.name = 'ValidationException';
    errors.forEach((error) => {
      if (this.errors[error.field]) {
        this.errors[error.field].push(error.message);
      } else {
        this.errors[error.field] = [error.message];
      }
    });
  }
}
