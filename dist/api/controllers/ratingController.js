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
exports.remove = exports.update = exports.detail = exports.create = exports.list = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const couponModel_1 = require("../models/couponModel");
const ratingModel_1 = require("../models/ratingModel");
const clientError_1 = __importDefault(require("../../config/clientError"));
//for shopper only 
//GET rating/
const list = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user && req.user.role.toLowerCase() != "shopper")
        throw new clientError_1.default(403, "Only shopper is allowed");
    const ratings = yield ratingModel_1.Rating.find({ user: req.user._id }).populate('coupon');
    res.render('rating/list.ejs', { user: req.user, ratings });
}));
exports.list = list;
//POST rating/create
const create = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.role != "shopper")
        throw new clientError_1.default(403, "Only shopper can rate");
    const couponId = req.body.couponId;
    const { comment, like } = req.body;
    if (!like || (like.toString() != "true" && like.toString() != "false"))
        throw new clientError_1.default(500, "Invalid value given for like");
    const coupon = yield couponModel_1.Coupon.findById(couponId).orFail(() => { throw new clientError_1.default(404, "Coupon doesn't exist"); });
    const rated = yield ratingModel_1.Rating.find({ user: req.user._id, coupon: couponId });
    if (rated.length > 0)
        throw new clientError_1.default(403, "Already commented");
    const rating = { comment, like, user: req.user._id, coupon: couponId };
    if (like.toString() == "true") {
        const currentLikes = coupon.likes;
        coupon.likes = currentLikes + 1;
    }
    else {
        const currentDislikes = coupon.dislikes;
        coupon.dislikes = currentDislikes + 1;
    }
    yield (new ratingModel_1.Rating(rating)).save();
    yield coupon.save();
    req.flash('message', 'Rating Submitted');
    res.redirect('back');
}));
exports.create = create;
//GET rating/:id
const detail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const rating = yield ratingModel_1.Rating.findById((_a = req.params) === null || _a === void 0 ? void 0 : _a.id)
        .populate('coupon')
        .orFail(() => { throw new clientError_1.default(404, "Rating doesn't exist"); });
    const rater = rating.user._id.toString();
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString();
    const isTheRater = (rater === userId) ? true : false;
    const coupon = yield couponModel_1.Coupon.findById(rating.coupon._id).orFail(() => { throw new clientError_1.default(404, "Coupon doesn't exist"); });
    res.render('rating/detail.ejs', { user: req.user, rating, isTheRater, coupon });
}));
exports.detail = detail;
//PUT rating/:id
const update = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const rating = yield ratingModel_1.Rating.findById(req.params.id).orFail(() => { throw new clientError_1.default(403, "Rating doesn't exist"); });
    const coupon = yield couponModel_1.Coupon.findById(rating.coupon).orFail(() => { throw new clientError_1.default(403, "Coupon doesn't exist"); });
    const updatedRating = req.body;
    rating.comment = (_c = updatedRating.comment) !== null && _c !== void 0 ? _c : rating.comment;
    rating.like = (_d = updatedRating.like) !== null && _d !== void 0 ? _d : rating.like;
    if (rating.like == true) {
        const currentLikes = coupon.likes;
        const currentDislikes = coupon.dislikes;
        coupon.dislikes = currentDislikes - 1;
        coupon.likes = currentLikes + 1;
    }
    else {
        const currentDislikes = coupon.dislikes;
        const currentLikes = coupon.likes;
        coupon.likes = currentLikes - 1;
        coupon.dislikes = currentDislikes + 1;
    }
    yield rating.save();
    yield coupon.save();
    req.flash('message', 'Rating updated successfully');
    res.redirect(`/rating/${rating._id}`);
}));
exports.update = update;
const remove = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.role != "shopper")
        throw new clientError_1.default(403, "Only shopper can access this page");
    const rating = yield ratingModel_1.Rating.findById(req.params.id).orFail(() => { throw new clientError_1.default(404, "Rating doesn't exist"); });
    const coupon = yield couponModel_1.Coupon.findById(rating.coupon).orFail(() => { throw new clientError_1.default(404, "Coupon doesn't exist"); });
    if (rating.like == true) {
        const currentLikes = coupon.likes;
        coupon.likes = currentLikes - 1;
    }
    else {
        const currentDislikes = coupon.dislikes;
        coupon.dislikes = currentDislikes - 1;
    }
    yield ratingModel_1.Rating.deleteOne({ _id: rating._id, user: req.user.id });
    yield coupon.save();
    req.flash('message', 'Rating deleted successfully');
    res.redirect('/rating/');
}));
exports.remove = remove;
