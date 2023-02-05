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
const clientError_1 = __importDefault(require("../clientError"));
const formatDiscount = (discount) => {
    let formatDis = discount.toString().toLowerCase();
    formatDis = formatDis.replace(/ & /g, " and ");
    formatDis = formatDis.replace(/%/g, "percent");
    formatDis = formatDis.replace(/\+/g, "%2B");
    formatDis = formatDis.replace(/\!/g, "");
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
const getDataFromHargapedia = (shopName, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    let coupons = [];
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    yield page.goto(`https://www.hargapedia.com.my/vouchers/store/${shopName}`).catch(err => { throw new clientError_1.default(404, "Cannot find that shop,please try again later"); });
    const discounts = yield page.$$eval(".styles_colMid__3FOth h4", (elements) => elements.map(element => element.textContent))
        .catch(err => { throw new clientError_1.default(404, "Cannot find any coupon from that shop"); });
    yield Promise.all(discounts.map((discount) => __awaiter(void 0, void 0, void 0, function* () {
        if (discount != null)
            return yield (0, axios_1.default)(config(discount))
                .then(res => {
                var _a, _b, _c, _d;
                const detail = res.data.data.getExternalVoucherBySlug;
                let coupon = new couponModel_1.Coupon({
                    discount,
                    offer: detail === null || detail === void 0 ? void 0 : detail.offer,
                    expiry: formatDate(detail === null || detail === void 0 ? void 0 : detail.expiry),
                    code: detail === null || detail === void 0 ? void 0 : detail.code,
                    link: detail === null || detail === void 0 ? void 0 : detail.outbound_url,
                    description: (_a = detail === null || detail === void 0 ? void 0 : detail.description) === null || _a === void 0 ? void 0 : _a.en,
                    category: (_c = (_b = detail === null || detail === void 0 ? void 0 : detail.category_name) === null || _b === void 0 ? void 0 : _b.en) !== null && _c !== void 0 ? _c : "others",
                    owner: adminId,
                    store_name: (_d = detail === null || detail === void 0 ? void 0 : detail.store_name) !== null && _d !== void 0 ? _d : `${shopName}'s shop`
                });
                coupon.validate();
                coupons.push(coupon);
            });
    })));
    yield browser.close();
    return coupons;
});
exports.default = getDataFromHargapedia;
