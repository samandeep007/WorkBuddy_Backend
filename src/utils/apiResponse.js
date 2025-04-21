class ApiResponse {
    constructor(statusCode, message, data){
        this.statusCode = statusCode;  // HTTP status code of the response
        this.message = message;        // Message describing the response
        this.data = data;              // Data payload of the response
        this.success = statusCode < 400;  // Determine if the response is successful (status code < 400)
    }
}

export default ApiResponse;