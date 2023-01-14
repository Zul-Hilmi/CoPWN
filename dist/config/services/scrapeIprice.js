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
const scrape = () => __awaiter(void 0, void 0, void 0, function* () {
    let coupons = [];
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
    let stores = [];
    const getShopsName = page.$$eval(".rY > p", pTags => {
        return pTags.map(p => p.textContent);
    });
    const getLink = page.$$eval(".rY > p > a", aTags => {
        return aTags.map(a => a.href);
    });
    const results = yield Promise.all([getShopsName, getLink]);
    const count = results[0].length;
    for (let i = 0; i < count; i++)
        stores.push({ 'name': results[0][i], 'link': results[1][i] });
    yield browser.close();
    return coupons;
});
