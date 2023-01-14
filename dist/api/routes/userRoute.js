"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.route("/")
    .get(auth_1.authenticate, userController_1.index);
router.route("/register")
    .post(userController_1.email)
    .get(userController_1.register);
router.route("/login")
    .post(userController_1.login)
    .get(userController_1.verify);
router.route("/forget")
    .post(userController_1.forget)
    .get(userController_1.changePassword);
router.route("/reset")
    .get(userController_1.reset);
router.route("/logout")
    .get(userController_1.logout);
router.route("/create")
    .get(userController_1.create);
router.route("/:id")
    .get(auth_1.authenticate, auth_1.authorizeUser, userController_1.detail)
    .put(auth_1.authenticate, auth_1.authorizeUser, userController_1.update)
    .delete(auth_1.authenticate, auth_1.authorizeUser, userController_1.remove, userController_1.logout);
exports.default = router;
