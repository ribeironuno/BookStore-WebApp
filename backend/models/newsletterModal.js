var mongoose = require("mongoose");
var validator = require("../models/validator");

var NewsletterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            validate: {
                validator: validator.isName,
                message:
                    "The inserted name is not a valid. The name cannot include numbers or any special characters.",
            },
            minlength: 3,
            maxlength: 50,
            required: [true, "Name is required!"],
        },
        email: {
            type: String,
            validate: {
                validator: validator.isEmail,
                message: "Invalid email.",
            },
            unique: true,
            required: [true, "Email is required!"],
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("Newsletter", NewsletterSchema);
