var mongoose = require("mongoose");

var PointsSchema = new mongoose.Schema(
    {
        earnedPointsForEachEuro: {
            type: Number,
            min: 0,
        },
        freeShipPoints: {
            type: Number,
            min: 0,
        },
        discountForEach100Points: {
            type: Number,
            min: 0,
        },
        earnedPointsForEachPurchaseUsedBook: {
            type: Number,
            min: 0,
        }, //points earned for each books that the client sell to the store
        infantilAge: {
            type: Number,
            min: 0,
        },
        juvenilAge: {
            type: Number,
            min: 0,
        },
        adultAge: {
            type: Number,
            min: 0,
        },
        seniorAge: {
            type: Number,
            min: 0,
        },
        shipCost: {
            type: Number,
            min: 0,
        },
        isInUse: Boolean,
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("Points", PointsSchema);
