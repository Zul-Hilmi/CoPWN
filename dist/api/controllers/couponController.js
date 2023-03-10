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
exports.shop = exports.scrape = exports.remove = exports.update = exports.detail = exports.list = exports.create = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const couponModel_1 = require("../models/couponModel");
const ratingModel_1 = require("../models/ratingModel");
const clientError_1 = __importDefault(require("../../config/clientError"));
const scrapeHargapedia_1 = __importDefault(require("../../config/services/scrapeHargapedia"));
const scrapeLoveCoupon_1 = require("../../config/services/scrapeLoveCoupon");
const scrapeCuponation_1 = __importDefault(require("../../config/services/scrapeCuponation"));
//POST coupon/create
const create = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (req.user.role == "shopper")
        throw new clientError_1.default(403);
    const coupon = req.body;
    coupon.code = (_a = coupon.code.trim()) !== null && _a !== void 0 ? _a : "No code";
    coupon.owner = req.user._id;
    coupon.store_name = (_b = coupon.store_name) !== null && _b !== void 0 ? _b : req.user.name;
    yield new couponModel_1.Coupon(coupon).save();
    res.render('coupon/create', { message: "Successfully created", user: req.user });
}));
exports.create = create;
//GET coupon/search
const list = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let coupons;
    let stores;
    let { store_name, category, page, sort } = req.query;
    let sortedBy = {};
    let storesQuery = {};
    let queries = {};
    if (typeof store_name == 'string' && (store_name === null || store_name === void 0 ? void 0 : store_name.length) > 0) {
        queries['store_name'] = store_name;
    }
    if (typeof category == 'string' && (category === null || category === void 0 ? void 0 : category.length) > 0) {
        queries['category'] = category;
    }
    if (req.user.role.toLowerCase() == "owner") {
        storesQuery = { 'owner': req.user._id };
        queries['owner'] = req.user._id;
    }
    if (typeof sort == 'string' && (sort === null || sort === void 0 ? void 0 : sort.length) > 0) {
        switch (sort) {
            case 'DE':
                sortedBy = { expiry: -1 };
                break;
            case 'AE':
                sortedBy = { expiry: 1 };
                break;
            case 'LR':
                sortedBy = { dislikes: -1, likes: 1 };
                break;
            case 'TR':
                sortedBy = { likes: -1, dislikes: 1 };
                break;
            default:
                sortedBy = {};
        }
    }
    yield Promise.all([
        coupons = yield couponModel_1.Coupon.find(queries)
            .populate('owner')
            .sort(sortedBy)
            .lean(),
        stores = yield couponModel_1.Coupon.find(storesQuery).distinct('store_name').lean()
    ]);
    res.render('coupon/list.ejs', { user: req.user, coupons, stores, store_name, category, message: req.flash('message') });
}));
exports.list = list;
const detail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f;
    const coupon = yield couponModel_1.Coupon.findById((_c = req.params) === null || _c === void 0 ? void 0 : _c.id)
        .populate('owner')
        .orFail(() => { throw new clientError_1.default(404, "Coupon doesn't exist"); });
    const ratings = yield ratingModel_1.Rating.find({ coupon: coupon._id }).populate('user');
    const coupon_owner = coupon.owner._id.toString();
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id.toString();
    const canEdit = coupon_owner === userId || ((_e = req.user) === null || _e === void 0 ? void 0 : _e.role) == "admin" ? true : false;
    const ratedByThisUser = yield ratingModel_1.Rating.exists({ user: (_f = req.user) === null || _f === void 0 ? void 0 : _f._id, coupon: coupon._id });
    res.render('coupon/view.ejs', {
        message: req.flash('message'),
        user: req.user,
        coupon,
        ratings,
        canEdit,
        ratedByThisUser
    });
}));
exports.detail = detail;
//PUT coupon/:id
const update = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j, _k, _l, _m, _o, _p;
    const coupon = yield couponModel_1.Coupon.findById(req.params.id).orFail(() => { throw new clientError_1.default(403); });
    const updatedCoupon = req.body;
    coupon.discount = (_g = updatedCoupon.discount) !== null && _g !== void 0 ? _g : coupon.discount;
    coupon.expiry = (_h = updatedCoupon.expiry) !== null && _h !== void 0 ? _h : coupon.expiry;
    coupon.offer = (_j = updatedCoupon.offer) !== null && _j !== void 0 ? _j : coupon.offer;
    coupon.code = (_k = updatedCoupon.code) !== null && _k !== void 0 ? _k : coupon.code;
    coupon.link = (_l = updatedCoupon.link) !== null && _l !== void 0 ? _l : coupon.link;
    coupon.description = (_m = updatedCoupon.description) !== null && _m !== void 0 ? _m : coupon.description;
    coupon.category = (_o = updatedCoupon.category) !== null && _o !== void 0 ? _o : coupon.category;
    coupon.store_name = (_p = updatedCoupon.store_name) !== null && _p !== void 0 ? _p : coupon.store_name;
    yield coupon.save();
    req.flash('message', 'Coupon updated');
    res.redirect(`/coupon/${coupon._id}`);
}));
exports.update = update;
//DELETE coupon/:id
const remove = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield couponModel_1.Coupon.findById(req.params.id).orFail(() => { throw new clientError_1.default(404, "Coupon doesn't exist"); });
    yield couponModel_1.Coupon.deleteOne({ _id: req.params.id });
    const ratings = yield ratingModel_1.Rating.deleteMany({ coupon: req.params.id });
    req.flash('message', "Coupon deleted");
    res.redirect(`/coupon/`);
}));
exports.remove = remove;
//GET coupon/scrape
const shop = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.role.toLowerCase() != "admin")
        throw new clientError_1.default(403);
    res.render('coupon/scrape.ejs', { message: req.flash('message'), error: req.flash('error'), user: req.user });
}));
exports.shop = shop;
//POST coupon/scrape
const scrape = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _q, _r;
    if (req.user.role.toLowerCase() != "admin")
        throw new clientError_1.default(403);
    const adminId = req.user._id;
    let source = req.body.source;
    if (((_q = req.body) === null || _q === void 0 ? void 0 : _q.shopName.length) < 1)
        throw new clientError_1.default(400, "Shop name is not given");
    const shopName = (_r = req.body.shopName) === null || _r === void 0 ? void 0 : _r.toLowerCase().replace(/ /g, "-");
    if (source.match(/^[0-9]+$/) == null)
        source = '1';
    if (parseInt(source) < 1 || parseInt(source) > 3)
        source = '1';
    let data = [];
    if (source == '1')
        data = yield (0, scrapeHargapedia_1.default)(shopName, adminId);
    else if (source == '2')
        data = yield (0, scrapeLoveCoupon_1.getDataLC)(shopName, adminId);
    else if (source == '3')
        data = yield (0, scrapeCuponation_1.default)(shopName, adminId);
    else
        data = yield (0, scrapeLoveCoupon_1.getDataLC)(shopName, adminId);
    yield couponModel_1.Coupon.bulkSave(data);
    res.render('coupon/scrape.ejs', { message: "Done scraping", user: req.user, coupons: data });
}));
exports.scrape = scrape;
