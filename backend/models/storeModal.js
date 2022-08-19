var mongoose = require("mongoose");
var validator = require("../models/validator");

var StoreSchema = new mongoose.Schema({
    address: {
        type: String,
        minlength: 3,
        maxlength: 60,
        required: [true, "Address of store is required"],
    },
    city: {
        type: String,
        minlength: 3,
        maxlength: 30,
        required: [true, "City of store is required"],
    },
    zipCode: {
        type: String,
        validate: {
            validator: validator.isZipCode,
            message: "Zip code should correspond to a Portugal country",
        },
        required: [true, "Zip code of store is required"],
    },
    cellPhone: {
        type: Number,
        validate: {
            validator: validator.isCellPhone,
            message: "Phone Number should be Portuguese",
        },
        required: [true, "Cell phone of store is required"],
    },
    email: {
        type: String,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "Email should be valid",
        },
        required: [true, "Email of store is required"],
    },
});

module.exports = mongoose.model("Store", StoreSchema);
