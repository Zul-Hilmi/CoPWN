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
exports.getDataLC = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const couponModel_1 = require("../../api/models/couponModel");
const clientError_1 = __importDefault(require("../clientError"));
const getDataLC = (store_name, owner) => __awaiter(void 0, void 0, void 0, function* () {
    let coupons = [];
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    yield page.goto(`https://www.lovecoupons.com.my/${store_name}`).catch(err => { throw new clientError_1.default(404, "Cannot find any shop with that name from sources"); });
    if ((yield page.$('head > script:nth-child(29)')) == null)
        throw new clientError_1.default(404, "Cannot find any coupon from that shop");
    const results = yield page.$eval('head > script:nth-child(29)', script => { return JSON.parse(script.text); });
    const data = results.hasOfferCatalog.itemListElement;
    const codeTarget = ".border.border-partner-300.font-bold.text-center.border-dashed.text-2xl.py-4.mb-4";
    for (let i = 0; i < data.length; i++) {
        let item = data[i].item;
        let id = data[i]['@id'].split('#')[1];
        yield page.goto(`https://www.lovecoupons.com.my/go/3/${id}`);
        if ((yield page.$(codeTarget)) == null)
            continue;
        let couponDetails = yield page.$eval(codeTarget, (div, id, item, store_name, owner) => {
            return {
                discount: item.name,
                offer: item.name.split(':')[1],
                expiry: (item.priceValidUntil && item.priceValidUntil !== "N/A") ? item.priceValidUntil : '',
                code: div.textContent,
                link: `https://www.lovecoupons.com.my/go/2/${id}`,
                description: item.description,
                category: (item === null || item === void 0 ? void 0 : item.category.trim().length) > 0 ? item.category : 'Others',
                owner,
                store_name
            };
        }, id, item, store_name, owner);
        if (couponDetails != null) {
            let coupon = new couponModel_1.Coupon(couponDetails);
            coupon.validate();
            coupons.push(coupon);
        }
    }
    yield browser.close();
    if (coupons.length < 1)
        throw new clientError_1.default(404, "Cannot find any coupon");
    return coupons;
});
exports.getDataLC = getDataLC;
