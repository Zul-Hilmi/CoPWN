"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const clientError_1 = __importDefault(require("../config/clientError"));
const errorHandler = (err, req, res, next) => {
    let message = "An error has occured";
    if (err instanceof mongoose_1.default.Error.ValidationError) { //native mongoose error
        res.status(400);
        let messages = [];
        for (let property in err.errors)
            messages.push(err.errors[property].message);
        message = messages.length > 0 ? messages : "invalid value given";
    }
    else if (err instanceof mongoose_1.default.Error.CastError) {
        res.status(400);
        message = `${err.value} is not valid for ${err.path} field`;
    }
    else if (err instanceof clientError_1.default) {
        message = err.message;
    }
    else {
        res.status(500);
    }
    console.log(err);
    const previousRoute = req.header('Referer') || '/';
    req.flash('error', message);
    res.redirect(previousRoute);
};
exports.default = errorHandler;
