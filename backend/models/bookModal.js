var mongoose = require("mongoose");
var validator = require("../models/validator");

var BookSchema = new mongoose.Schema(
    {
        id: Number,

        title: {
            type: String,
            validate: {
                validator: validator.isName,
                message: "Title must contain only letters",
            },
            minlength: 3,
            maxlength: 60,
            required: true,
        },

        edition: {
            type: Number,
            min: 0,
        },

        publishYear: {
            type: String,
            validate: {
                validator: validator.isPublishYear,
                message: "Publish year must be lower than actual date",
            },

            required: [true, "Publish year is required. Min length 1"],
        },

        numberPages: {
            type: Number,
            min: 1,
            required: [true, "Number of pages is required. Min length 0"],
        },

        ISBN: {
            type: String,
            unique: [true, "ISBN must be unique."],
            validate: {
                validator: validator.isIsbn,
                message: "Must be in ISBN-10 or ISBN-13 format",
            },
            required: [true, "ISBN is necessary"],
        },

        language: {
            type: String,
            enum: {
                values: ["pt", "en", "de", "fr", "es"],
            },
            required: [true, "Language is required"],
        },

        author: {
            name: {
                type: String,
                validate: {
                    validator: validator.isName,
                    message: "Author name must be only letters",
                },
                minlength: 3,
                maxlength: 60,
                required: [true, "Name is required"],
            },

            key: {
                type: String,
            },
        },

        subject: {
            type: [
                {
                    type: String,
                    minlength: 3,
                    maxlength: 60,
                },
            ],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length > 0;
                },
                message: "There is required at least one subject",
            },
        },

        imageBook: { staticUrl: { type: "String" }, type: { type: "String" } },

        description: {
            type: String,
            minlength: 5,
            required: true,
        },

        stock: {
            new: {
                type: Number,
                validate: {
                    validator: Number.isInteger,
                },
                min: 0,
                required: [true, "New condition stock is required"],
            },

            excellent: {
                type: Number,
                validate: {
                    validator: Number.isInteger,
                },
                min: 0,
                required: [true, "Excellent sale condition stock is required"],
            },

            good: {
                type: Number,
                validate: {
                    validator: Number.isInteger,
                },
                min: 0,
                required: [true, "Good sale condition stock is required"],
            },

            medium: {
                type: Number,
                validate: {
                    validator: Number.isInteger,
                },
                min: 0,
                required: [true, "Medium sale condition stock is required"],
            },

            bad: {
                type: Number,
                validate: {
                    validator: Number.isInteger,
                },
                min: 0,
                required: [true, "Bad sale condition stock is required"],
            },
        },

        infoToSale: {
            price: {
                new: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [true, "New condition price is required"],
                },

                excellent: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [
                        true,
                        "Excellent sale condition price is required",
                    ],
                },

                good: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [true, "Good sale condition price is required"],
                },

                medium: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [true, "Medium sale condition price is required"],
                },

                bad: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [true, "Bad sale condition price is required"],
                },
            },
        },

        infoToPurchase: {
            price: {
                excellent: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [
                        true,
                        "Excellent purchase condition price is required",
                    ],
                },

                good: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [
                        true,
                        "Good purchase condition price is required",
                    ],
                },

                medium: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [
                        true,
                        "Medium purchase condition price is required",
                    ],
                },

                bad: {
                    type: Number,
                    validate: {
                        validator: validator.isPrice,
                        message:
                            "Price can not have more than two decimal numbers",
                    },
                    min: 0,
                    required: [
                        true,
                        "Bad purchase condition price is required",
                    ],
                },
            },
        },
        reviews: {
            totalRate: {
                type: Number,
                default: 0,
            },
            counterRate: {
                type: Number,
                default: 0,
            },
            averageRate: {
                type: Number,
                default: 0,
            },
            counters: {
                one: {
                    type: Number,
                    default: 0,
                },
                oneAndHalf: {
                    type: Number,
                    default: 0,
                },
                two: {
                    type: Number,
                    default: 0,
                },
                twoAndHalf: {
                    type: Number,
                    default: 0,
                },
                three: {
                    type: Number,
                    default: 0,
                },
                threeAndHalf: {
                    type: Number,
                    default: 0,
                },
                four: {
                    type: Number,
                    default: 0,
                },
                fourAndHalf: {
                    type: Number,
                    default: 0,
                },
                five: {
                    type: Number,
                    default: 0,
                },
            },
            list: {
                type: [
                    {
                        reviewId: Number,
                        nif: Number,
                        date: {
                            type: String,
                            default: new Date().toISOString().slice(0, 10),
                        },
                        rate: {
                            type: Number,
                            validate: {
                                validator: (value) => {
                                    return [
                                        1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
                                    ].includes(value);
                                },
                            },
                        },
                        text: String,
                        name: String,
                    },
                ],
            },
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("Book", BookSchema);
