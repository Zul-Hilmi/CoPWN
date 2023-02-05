"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponController_1 = require("../controllers/couponController");
const auth_1 = require("../../middlewares/auth");
const clientError_1 = __importDefault(require("../../config/clientError"));
const router = (0, express_1.Router)();
router.route("/")
    .get((req, res) => res.redirect("search"));
router.route("/search")
    .get(auth_1.authenticate, couponController_1.list);
router.route("/create")
    .post(auth_1.authenticate, couponController_1.create)
    .get(auth_1.authenticate, (req, res) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) == "shopper")
        throw new clientError_1.default(403);
    res.render("coupon/create.ejs", { message: req.flash('message'), error: req.flash('error'), user: req.user });
});
router.route("/scrape")
    .post(auth_1.authenticate, couponController_1.scrape)
    .get(auth_1.authenticate, couponController_1.shop);
router.route("/:id")
    .get(auth_1.authenticate, couponController_1.detail)
    .put(auth_1.authenticate, auth_1.authorizeOwner, couponController_1.update)
    .delete(auth_1.authenticate, auth_1.authorizeOwner, couponController_1.remove);
exports.default = router;
