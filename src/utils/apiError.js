class ApiError extends Error {
    constructor(statusCode, message, errors = [], stack = "") {
        // Call the parent Error constructor with the message
        super(message);
        
        // Set custom properties for the ApiError
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.success = false;
        
        // If a stack trace is provided, use it; otherwise, capture a new one
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;