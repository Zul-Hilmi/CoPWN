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
const axios_1 = __importDefault(require("axios"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const couponModel_1 = require("../../api/models/couponModel");
const formatDiscount = (discount) => {
    let formatDis = discount.toString().toLowerCase();
    formatDis = formatDis.replace(/ & /g, " and ");
    formatDis = formatDis.replace(/%/g, "percent");
    formatDis = formatDis.replace(/\+/g, "%2B");
    formatDis = formatDis.trim();
    formatDis = formatDis.replace(/\s{1,}/g, "-");
    return formatDis;
};
const formatDate = (date) => {
    if (!date)
        return null;
    const d = new Date(+date);
    let curr_date = d.getDate().toLocaleString();
    let curr_month = (d.getMonth() + 1).toString(); //Months are zero based
    let curr_year = d.getFullYear();
    if (curr_date.length < 2)
        curr_date = "0" + curr_date;
    if (curr_month.length < 2)
        curr_month = "0" + curr_month;
    let fullDate = (curr_year + "-" + curr_month + "-" + curr_date);
    if (curr_year < 2005) {
        return null;
    }
    return fullDate;
};
const config = (discount) => {
    return {
        method: 'post',
        url: 'https://www.hargapedia.com.my/api/voucher_external/getVoucherBySlug',
        headers: {
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Referer': 'https://www.hargapedia.com.my/vouchers/store/lazada?voucher=lazada-free-shipping-1',
            'sec-ch-ua-mobile': '?0',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'sec-ch-ua-platform': '"Windows"'
        },
        data: JSON.stringify({
            "slug": formatDiscount(discount)
        })
    };
};
const getData = (shopName, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    let coupons = [];
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    yield page.goto(`https://www.hargapedia.com.my/vouchers/store/${shopName}`, { timeout: 0 });
    const discounts = yield page.$$eval(".styles_colMid__3FOth h4", (elements) => {
        return elements.map(element => element.textContent);
    });
    yield Promise.all(discounts.map((discount) => __awaiter(void 0, void 0, void 0, function* () {
        return yield (0, axios_1.default)(config(discount))
            .then(res => {
            var _a, _b, _c, _d;
            const detail = res.data.data.getExternalVoucherBySlug;
            let offer = detail === null || detail === void 0 ? void 0 : detail.offer;
            let expiry = formatDate(detail === null || detail === void 0 ? void 0 : detail.expiry);
            let description = (_a = detail === null || detail === void 0 ? void 0 : detail.description) === null || _a === void 0 ? void 0 : _a.en;
            let code = detail === null || detail === void 0 ? void 0 : detail.code;
            let link = detail === null || detail === void 0 ? void 0 : detail.outbound_url;
            let store_name = (_b = detail === null || detail === void 0 ? void 0 : detail.store_name) !== null && _b !== void 0 ? _b : shopName;
            let category = (_d = (_c = detail === null || detail === void 0 ? void 0 : detail.category_name) === null || _c === void 0 ? void 0 : _c.en) !== null && _d !== void 0 ? _d : "others";
            let coupon = new couponModel_1.Coupon({
                discount,
                offer,
                expiry,
                code,
                link,
                description,
                category,
                owner: adminId,
                store_name
            });
            coupon.validate();
            coupons.push(coupon);
        });
    })));
    yield browser.close();
    return coupons;
});
exports.default = getData;
