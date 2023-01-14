"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const clientError_1 = __importDefault(require("../../config/clientError"));
var Roles;
(function (Roles) {
    Roles["OWNER"] = "owner";
    Roles["SHOPPER"] = "shopper";
    Roles["ADMIN"] = "admin";
})(Roles || (Roles = {}));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minLength: [3, "Name must be at least 3 characters"],
        maxLength: [30, "Name exceeded 30 characters"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        immutable: true,
        trim: true,
        required: [true, "Email is required"],
        validate: [validateEmail, "Not a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        trim: true
    },
    role: {
        type: String,
        trim: true,
        lowercase: true,
        immutable: true,
        enum: {
            values: Object.values(Roles),
            message: "Invalid role"
        },
        required: [true, "Role is required"]
    },
    active: {
        type: Boolean,
        default: false
    }
});
userSchema.pre('save', function (next) {
    let user = this;
    if (!user.isModified("password")) {
        next();
    }
    else {
        bcrypt_1.default.genSalt(10, function (err, salt) {
            if (err)
                return next(err);
            bcrypt_1.default.hash(user.password, salt, function (err, hash) {
                if (err)
                    return next(err);
                user.password = hash;
                next();
            });
        });
    }
});
//will be called inside express asyncHandler in the controller
userSchema.statics.login = function (email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new User({ email }).validate(['email']); //if not valid will throw validation error or cast error
        const user = yield User.findOne({ email }).orFail(() => {
            throw new clientError_1.default(404, `Can't find account with the email of ${email}`);
        });
        const passwordIsValid = yield bcrypt_1.default.compare(password.trim(), user.password);
        if (passwordIsValid === false) { //wrong password
            throw new clientError_1.default(401, "Password is wrong");
        }
        return user;
    });
};
//helper functions
function validateEmail(email) {
    let emailFormat = /^.+@(?:[\w-]+\.)+\w+$/;
    return emailFormat.test(email);
}
const User = (0, mongoose_1.model)('User', userSchema);
exports.User = User;
