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
exports.logout = exports.reset = exports.verify = exports.login = exports.remove = exports.update = exports.detail = exports.create = exports.forget = exports.changePassword = exports.email = exports.register = exports.index = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = require("../models/userModel");
const mongoose_1 = require("mongoose");
const couponModel_1 = require("../models/couponModel");
const ratingModel_1 = require("../models/ratingModel");
const mail_1 = require("../../config/services/mail");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const clientError_1 = __importDefault(require("../../config/clientError"));
const resetModel_1 = require("../models/resetModel");
//GET user/
const index = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("user/main.ejs", {
        message: req.flash('message'),
        error: req.flash('error'),
        user: req.user
    });
}));
exports.index = index;
//GET user/register
const register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("user/register", {
        message: req.flash('message'),
        error: req.flash('error')
    });
}));
exports.register = register;
//POST user/register
const email = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const existingUser = yield userModel_1.User.findOne({ email: user.email });
    let userId;
    if (existingUser) {
        if (existingUser.active === false)
            userId = existingUser._id;
        else
            throw new clientError_1.default(409, "Email already exist");
    }
    else {
        if (user.role != "shopper" && user.role != "owner")
            throw new clientError_1.default(403, "Invalid Role");
        const { _id } = yield new userModel_1.User(user).save();
        userId = _id;
    }
    const emailToken = jsonwebtoken_1.default.sign({ userId }, process.env.EMAIL_SECRET, { expiresIn: "3d" });
    const sent = yield (0, mail_1.sendVerificationEmail)(emailToken, user.email, `${req.protocol}://${req.headers.host}`)
        .catch(err => { throw new clientError_1.default(502, "Something went wrong when sending email,please try again later"); });
    res.clearCookie('token');
    res.render('user/register.ejs', { message: "Please check your email for verification" });
}));
exports.email = email;
//GET user/create
const create = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.query.confirm)
        throw new clientError_1.default(403);
    const token = (req.query.confirm);
    const validationToken = jsonwebtoken_1.default.verify(token.slice(0, -1), process.env.EMAIL_SECRET);
    const userId = validationToken.userId;
    if (!userId || !(0, mongoose_1.isValidObjectId)(userId))
        throw new clientError_1.default(401, "Token have been tampered with");
    const user = yield userModel_1.User.findById(userId).orFail(() => { throw new clientError_1.default(404, "User doesnt exist"); });
    if (user.active != false)
        throw new clientError_1.default(409, "User is already active");
    user.active = true;
    if (((_a = user.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "admin")
        throw new clientError_1.default(403, "Invalid Role");
    yield user.save();
    res.clearCookie('token');
    res.render('user/login.ejs', { message: "Successfully created user,you can now login" });
}));
exports.create = create;
//GET user/forget
const changePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("user/forget.ejs", { message: req.flash('message') });
}));
exports.changePassword = changePassword;
//POST user/forget
const forget = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    if (!email)
        throw new clientError_1.default(400, "Email is required");
    const user = yield userModel_1.User.findOne({ email }).orFail(() => { throw new clientError_1.default(400, "Email is not registered"); });
    const reset = new resetModel_1.Reset({ email: user.email, user: user._id });
    reset.save();
    const emailToken = jsonwebtoken_1.default.sign({ resetId: reset._id }, process.env.EMAIL_SECRET, { expiresIn: "3d" });
    const sent = yield (0, mail_1.resetPassword)(emailToken, user.email, `${req.protocol}://${req.headers.host}`)
        .catch((err) => { throw new clientError_1.default(502, "Something went wrong when sending email,please try again later"); });
    res.clearCookie('token');
    res.render('user/forget.ejs', { message: "Please check your email to reset password" });
}));
exports.forget = forget;
//GET user/reset
const reset = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.confirm)
        throw new clientError_1.default(403);
    const token = (req.query.confirm);
    const validationToken = jsonwebtoken_1.default.verify(token.slice(0, -1), process.env.EMAIL_SECRET);
    const resetId = validationToken.resetId;
    if (!resetId || !(0, mongoose_1.isValidObjectId)(resetId))
        throw new clientError_1.default(401, "Token have been tampered with");
    const reset = yield resetModel_1.Reset.findById(resetId).orFail(() => { throw new clientError_1.default(404, "The token may be expired, please request again"); });
    res.clearCookie('token');
    res.cookie('token', generateToken(reset.user));
    res.redirect(`/user/${reset.user}`);
}));
exports.reset = reset;
//GET user/login
const verify = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('user/login', {
        message: req.flash('message'),
        error: req.flash('error')
    });
}));
exports.verify = verify;
//POST user/login
const login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModel_1.User.login(email, password);
    if (!user)
        throw new clientError_1.default(401, "Invalid Credential");
    if (user.active === false)
        throw new clientError_1.default(401, "Please activate this account first");
    res.clearCookie('token');
    res.cookie('token', generateToken(user._id));
    req.flash('message', "Successfully logged in"); //send to GET /
    res.redirect('/user/');
}));
exports.login = login;
//GET user/logout
const logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token');
    req.flash('message', 'Logged Out');
    res.redirect("/");
}));
exports.logout = logout;
//GET user/:id
const detail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.User.findById(req.params.id)
        .orFail(() => { throw new clientError_1.default(404, "User does not exist"); });
    res.render('user/profile.ejs', { user, message: req.flash('message'), error: req.flash('error') });
}));
exports.detail = detail;
//PUT user/:id
const update = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.User.findById(req.params.id)
        .orFail(() => { throw new clientError_1.default(404, "User does not exist"); });
    const { name, password } = req.body;
    user.name = (name === null || name === void 0 ? void 0 : name.length) > 0 ? name : user.name;
    user.password = (password === null || password === void 0 ? void 0 : password.length) > 0 ? password : user.password;
    yield user.save();
    req.user = user; //change the session which is already authorized and authenticate first 
    res.render('user/profile.ejs', { user, message: "Account successfully updated", error: req.flash('error') });
}));
exports.update = update;
//DELETE user/:id
const remove = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield userModel_1.User.deleteOne({ _id: req.params.id }).orFail(() => { throw new clientError_1.default(404, "User does not exist"); });
    yield couponModel_1.Coupon.deleteMany({ owner: req.params.id });
    yield ratingModel_1.Rating.deleteMany({ user: req.params.id });
    next();
}));
exports.remove = remove;
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
