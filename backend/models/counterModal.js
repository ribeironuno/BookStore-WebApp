var mongoose = require("mongoose");

var CounterSchema = new mongoose.Schema({
    _id: {
        db: String,
        coll: String,
    },
    seq_value: Number,
    review_seq: Number,
});

module.exports = mongoose.model("Counter", CounterSchema);
