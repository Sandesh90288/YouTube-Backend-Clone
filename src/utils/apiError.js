// api-error.js (ESM)
class ApiError extends Error {
    constructor(
      statusCode,
      message = "Something went wrong",
      errors = [],       // details array (e.g., validation issues)
      stack = ""         // optional custom stack
    ) {
      super(message);
      this.name = "ApiError";
      this.statusCode = statusCode;
      this.success = false;
      this.errors = errors;
      this.data = null;
  
      if (stack) {
        this.stack = stack;
      } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export { ApiError };
  