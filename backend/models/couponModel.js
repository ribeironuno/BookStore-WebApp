var mongoose = require("mongoose");
var validator = require("../models/validator");

var CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        validator: validator.isCoupon,
        message: "Code not valid",
        required: [true, "Code is unique and required"],
    },
    initialDate: {
        type: String,
        validator: validator.isValidCouponDate,
        message: "Initial date not valid",
        required: [true, "Percentage is required"],
    },
    expireDate: {
        type: String,
        validator: validator.isValidCouponDate,
        message: "Expired date not valid",
        required: [true, "Percentage is required"],
    },
    percentageToDiscount: {
        type: Number,
        validator: validator.isPercentage,
        message: "Percentage not valid",
        required: [true, "Percentage is required"],
    },
});

module.exports = mongoose.model("Coupon", CouponSchema);
