"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Categories = exports.Coupon = void 0;
const mongoose_1 = require("mongoose");
var Categories;
(function (Categories) {
    Categories[Categories["Health & Beauty"] = 0] = "Health & Beauty";
    Categories[Categories["Electronic & Appliances"] = 1] = "Electronic & Appliances";
    Categories[Categories["Travel & Leisure"] = 2] = "Travel & Leisure";
    Categories[Categories["Sports & Outdoors"] = 3] = "Sports & Outdoors";
    Categories[Categories["E-Commerce"] = 4] = "E-Commerce";
    Categories[Categories["Fashion"] = 5] = "Fashion";
    Categories[Categories["Groceries"] = 6] = "Groceries";
    Categories[Categories["Food Delivery"] = 7] = "Food Delivery";
    Categories[Categories["Restaurants"] = 8] = "Restaurants";
    Categories[Categories["E-Wallet"] = 9] = "E-Wallet";
})(Categories || (Categories = {}));
exports.Categories = Categories;
const couponSchema = new mongoose_1.Schema({
    //coupon can have the same discount title
    discount: {
        type: String,
        trim: true,
        minLength: [3, "Discount cant be less than 3 character"],
        required: [true, "Discount is required"],
    },
    offer: {
        type: String,
        trim: true,
        default: "Not available",
        minlength: [3, "Offer cant be less than 3 character"]
    },
    expiry: {
        type: String,
        trim: true,
        validate: {
            validator: function (date) {
                if ((date === null || date === void 0 ? void 0 : date.length) > 0) {
                    if (date.toString() != "No expiry")
                        return new RegExp(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/).test(date);
                }
            },
            message: props => `${props.value} is not a valid Date`
        },
    },
    code: {
        type: String,
        trim: true,
        default: "No code"
    },
    link: {
        type: String,
        trim: true,
        required: false,
        validate: {
            validator: function (url) {
                if (url != null && url.trim().length > 0 && url != "No link") {
                    return new URL(url).toString();
                }
            }
        },
        default: "No link"
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, "Coupon have to be owned by an owner"],
        ref: 'User'
    },
    store_name: {
        type: String,
        default: null,
        trim: true,
        index: true
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
couponSchema.pre('save', function (next) {
    if (this.offer == null)
        this.offer = "No offer";
    console.log("code:", this.code);
    if (this.code == null)
        this.code = "No code";
    if (this.link == null)
        this.link = "No link";
    if (this.description == null)
        this.description = "No description";
    if (this.category == null)
        this.category = "Others";
    else
        this.category = getCategoryName(this.category);
    next();
});
function getCategoryName(category) {
    let sCategory = category === null || category === void 0 ? void 0 : category.toString().trim();
    if (((sCategory === null || sCategory === void 0 ? void 0 : sCategory.length) > 0) && (sCategory in Categories)) {
        return sCategory;
    }
    return "Others";
}
const Coupon = (0, mongoose_1.model)('Coupon', couponSchema);
exports.Coupon = Coupon;
