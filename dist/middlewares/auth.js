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
exports.validCoupon = exports.authorizeRater = exports.authorizeOwner = exports.authorizeUser = exports.authenticate = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../api/models/userModel");
const couponModel_1 = require("../api/models/couponModel");
const clientError_1 = __importDefault(require("../config/clientError"));
const authenticate = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.cookies["token"];
    if (!token)
        throw new clientError_1.default(403, "You have to login first");
    //if token is presence, find the user in db
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    req.user = yield userModel_1.User.findById(decoded.id).orFail(() => { throw new clientError_1.default(400, "Not authorized"); });
    next();
}));
exports.authenticate = authenticate;
//check if id of the page is the same as the user's session id 
const authorizeUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const link = req.params.id;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (link && id && link == id)
        next();
    else
        throw new clientError_1.default(403);
}));
exports.authorizeUser = authorizeUser;
//--------------------------------------------------------------------//
//check if owner of the coupon is the same as id of the user
const authorizeOwner = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const couponId = req.params.id;
    const ownerId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    yield couponModel_1.Coupon.findOne({ id: couponId, owner: ownerId }).orFail(() => { throw new clientError_1.default(403, "Coupon doesn't exist"); });
    next();
}));
exports.authorizeOwner = authorizeOwner;
const validCoupon = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const couponId = req.params.id;
    const ownerId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
    const owner = yield userModel_1.User.findById(ownerId);
    if (!owner) {
        yield couponModel_1.Coupon.deleteMany({ owner: ownerId });
        throw new clientError_1.default(404, "Coupon doesn't exist");
    }
    const coupon = yield couponModel_1.Coupon.findOne({ _id: couponId })
        .orFail(() => { throw new clientError_1.default(404, "Coupon doesn't exist"); });
    next();
}));
exports.validCoupon = validCoupon;
//--------------------------------------------------------------------//
const authorizeRater = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const RatingId = req.params.id;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    yield couponModel_1.Coupon.findOne({ id: RatingId, user: userId }).orFail(() => { throw new clientError_1.default(403, "Rating doesn't exist"); });
    next();
}));
exports.authorizeRater = authorizeRater;
// //create user session and store them in the cookie
// const authenticate = asyncHandler(async(req:SessionRequest,res,next)=>{
//     let token
//     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
//         token = req.headers.authorization.split(' ')[1]
//         const decoded = <JwtPayload>jwt.verify(token,<string>process.env.JWT_SECRET)
//         req.user = await User.findById(decoded.id).select('-password')
//                 .orFail(()=>{throw new ClientError(400,"Not authorized")})
//     }
//     if(!token)throw new ClientError(403,"You have to login first")
//     next()
// })
