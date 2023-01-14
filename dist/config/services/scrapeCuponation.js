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
const puppeteer_1 = __importDefault(require("puppeteer"));
const couponModel_1 = require("../../api/models/couponModel");
const clientError_1 = __importDefault(require("../clientError"));
const axios_1 = __importDefault(require("axios"));
const getDataCP = (store_name, owner) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    let coupons = [];
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    yield page.goto(`https://www.cuponation.com.my/${store_name}-voucher`).catch(err => { throw new clientError_1.default(404, "Cannot find any shop with that name from sources"); });
    const fetchIds = yield page.$$eval('._15mbvey1', divs => divs.map(div => {
        let id = div.getAttribute('data-id');
        return id;
    }));
    if (fetchIds.length < 1)
        throw new clientError_1.default(404, "Cannot find any coupon from that shop");
    const requestLink = 'https://www.cuponation.com.my/api/voucher/country/my/client/ab44d89d7c613756a86989b1765d18b9/id/';
    const responses = yield Promise.all(fetchIds.map(id => axios_1.default.get(requestLink + id)));
    for (let response of responses) {
        const data = response.data;
        let coupon = new couponModel_1.Coupon({
            discount: data.title,
            offer: (_b = (_a = data === null || data === void 0 ? void 0 : data.captions[0]) === null || _a === void 0 ? void 0 : _a.text) !== null && _b !== void 0 ? _b : data.title.split(':')[1],
            code: data === null || data === void 0 ? void 0 : data.code,
            expiry: formatExpiry(data.end_time),
            description: data.description,
            link: (_c = data === null || data === void 0 ? void 0 : data.retailer) === null || _c === void 0 ? void 0 : _c.merchant_url_title,
            category: 'Others',
            owner,
            store_name: (_e = (_d = data === null || data === void 0 ? void 0 : data.retailer) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : store_name
        });
        coupon.validate();
        coupons.push(coupon);
    }
    yield browser.close();
    return coupons;
});
const formatExpiry = (date) => {
    if ((date === null || date === void 0 ? void 0 : date.length) > 0) {
        let day = new Date(date).getDate().toString();
        if (day.length == 1)
            day = "0" + day;
        let month = (new Date(date).getMonth() + 1).toString();
        if (month.length == 1)
            month = "0" + month;
        const year = new Date(date).getFullYear().toString();
        const expiry = `${year}-${month}-${day}`;
        return expiry;
    }
    return "";
};
exports.default = getDataCP;
