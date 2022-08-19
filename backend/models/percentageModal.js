var mongoose = require("mongoose");

var PercentageSchema = new mongoose.Schema({
    percentagesToSale: {
        excellent: {
            type: Number,
        },
        good: {
            type: Number,
        },
        medium: {
            type: Number,
        },
        bad: {
            type: Number,
        },
    },

    percentagesToPurchase: {
        excellent: {
            type: Number,
        },
        good: {
            type: Number,
        },
        medium: {
            type: Number,
        },
        bad: {
            type: Number,
        },
    },
});

module.exports = mongoose.model("bookGradeTable", PercentageSchema, "bookGradeTable");
