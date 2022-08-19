var mongoose = require("mongoose");

const ReviewCounter = mongoose.Schema({
    review_seq: Number,
});

module.exports = mongoose.model("Counters", ReviewCounter);
