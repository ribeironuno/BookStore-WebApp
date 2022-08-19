var mongoose = require("mongoose");
var validator = require("../models/validator");

var SaleSchema = new mongoose.Schema(
    {
        client: {
            _id: String,
            name: String,
            nif: Number,
            cellPhone: Number,
            email: String,
            pointsBeforeSale: Number,
        },
        books: [
            {
                _id: String,
                title: String,
                isbn: String,
                quantity: {
                    new: Number,
                    excellent: Number,
                    good: Number,
                    medium: Number,
                    bad: Number,
                },
                price: {
                    new: Number,
                    excellent: Number,
                    good: Number,
                    medium: Number,
                    bad: Number,
                },
                imageBook: {
                    staticUrl: { type: "String" },
                    type: { type: "String" },
                },
                total: Number,
            },
        ],
        totalValue: Number,
        pointsToDiscount: Number,
        couponPercentage: {
            type: Number,
            min: 0,
            max: 100,
        },
        couponCode: String,
        totalValueWithDiscount: Number,
        discountValuePer100Points: Number,
        date: {
            type: String,
            default: new Date().toISOString().slice(0, 10),
        },
        shippingInformation: {
            freeShipping: Boolean,
            cost: Number,
            ShipType: String,
            address: {
                address: {
                    type: String,
                    minlength: 1,
                    maxlength: 30,
                },

                city: {
                    type: String,
                    minlength: 1,
                    maxlength: 30,
                },

                zip: {
                    type: String,
                    validate: {
                        validator: validator.isZipCode,
                        message:
                            "Zip code should correspond to a Portugal country",
                    },
                },
            },
        },
        status: String,
        salesId: Number,
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("Sale", SaleSchema);
