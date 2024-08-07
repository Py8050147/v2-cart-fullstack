class ApiResponse extends Response {
    constructor(statusCode, data, message = "Success") {
        super(message),
            this.statusCode = statusCode,
            this.data = data,
            this.message = message,
            this.success = statusCode < 400
    }
}

export {ApiResponse}