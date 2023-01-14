"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ratingController_1 = require("../controllers/ratingController");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.route("/")
    .get(auth_1.authenticate, ratingController_1.list);
router.route("/create")
    .post(auth_1.authenticate, ratingController_1.create);
router.route("/:id")
    .get(auth_1.authenticate, ratingController_1.detail)
    .put(auth_1.authenticate, auth_1.authorizeRater, ratingController_1.update)
    .delete(auth_1.authenticate, auth_1.authorizeRater, ratingController_1.remove);
exports.default = router;
