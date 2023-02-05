"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reset = void 0;
const mongoose_1 = require("mongoose");
const resetSchema = new mongoose_1.Schema({
    email: {
        type: String,
        lowercase: true,
        immutable: true,
        trim: true,
        required: [true, "Email is required"]
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        expires: 60,
        default: Date.now
    }
});
const Reset = (0, mongoose_1.model)('Reset', resetSchema);
exports.Reset = Reset;
