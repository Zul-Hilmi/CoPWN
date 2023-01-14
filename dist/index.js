"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const method_override_1 = __importDefault(require("method-override"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const express_flash_1 = __importDefault(require("express-flash"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
app.use((0, method_override_1.default)('_method'));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: '123',
    resave: true,
    saveUninitialized: true
}));
app.use((0, express_flash_1.default)());
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    var _a, _b;
    let message = (_a = req.flash('message')[0]) === null || _a === void 0 ? void 0 : _a.toString();
    let error = (_b = req.flash('error')[0]) === null || _b === void 0 ? void 0 : _b.toString();
    if (error === "You have to login first") {
        console.log("success");
        res.redirect('/user/login');
    }
    else {
        console.log("failed");
        res.render('index.ejs', { message, error });
    }
});
app.get('/test', (req, res) => {
    res.render('test.ejs');
});
const userRoute_1 = __importDefault(require("./api/routes/userRoute"));
app.use('/user', userRoute_1.default);
const couponRoute_1 = __importDefault(require("./api/routes/couponRoute"));
app.use('/coupon', couponRoute_1.default);
const ratingRoute_1 = __importDefault(require("./api/routes/ratingRoute"));
app.use('/rating', ratingRoute_1.default);
app.all("*", (req, res) => { res.redirect("/"); });
app.use(errorHandler_1.default);
app.listen(process.env.PORT, () => {
    console.log("Server started");
});
