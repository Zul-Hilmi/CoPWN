"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClientError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        if (!message) {
            switch (code) {
                case 400:
                    message = "required fields cannot be empty";
                    break;
                case 401:
                    message = "Invalid credential";
                    break;
                case 403:
                    message = "Forbidden access";
                    break;
                case 404:
                    message = "Page doesnt exist";
                    break;
                case 409:
                    message = "Item already exist";
                    break;
                case 502:
                    message = "Cant sent email";
                    break;
                default:
                    message = "Something unexpected happened";
            }
        }
        this.message = message;
    }
}
exports.default = ClientError;
