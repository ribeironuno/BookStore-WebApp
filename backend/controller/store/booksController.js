var ReviewCounter = require("../../models/reviewCounter");
var Book = require("../../models/bookModal");
var Client = require("../../models/clientModal");

var bookStoreController = {};

//Return all existent books
bookStoreController.getAllBooks = (req, res) => {
    Book.find({}).exec((err, dbBook) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(200).json(dbBook);
        }
    });
};

//return the book JSON that correspond to the ISBN
bookStoreController.getBookByIsbn = (req, res) => {
    Book.findOne({ ISBN: req.params.isbn }).exec((err, dbBook) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(200).json(dbBook);
        }
    });
};

isRateValid = (rate) => {
    return [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(rate);
};

getStringCounterToUpdate = (value) => {
    let string = "reviews.counters.";
    switch (value) {
        case 1:
            return string + "one";
        case 1.5:
            return string + "oneAndHalf";
        case 2:
            return string + "two";
        case 2.5:
            return string + "twoAndHalf";
        case 3:
            return string + "three";
        case 3.5:
            return string + "threeAndHalf";
        case 4:
            return string + "four";
        case 4.5:
            return string + "fourAndHalf";
        case 5:
            return string + "five";
    }
};

//return the book JSON that correspond to the ISBN
bookStoreController.reviewRegistration = async (req, res) => {
    if (!req.nif) {
        return res.status(400).json({
            success: 0,
            error: {
                code: "0",
                message: "No valid token received",
            },
        });
    }

    let parseRate = !req.body.rate ? undefined : parseFloat(req.body.rate);
    if (!parseRate || !isRateValid(parseRate)) {
        return res.status(400).json({
            success: 0,
            error: {
                code: "1",
                message: "Rate number is invalid",
            },
        });
    }

    if (!req.body.text) {
        return res.status(400).json({
            success: 0,
            error: {
                code: "2",
                message: "No description received",
            },
        });
    }

    if (!req.body.isbn) {
        return res.status(400).json({
            success: 0,
            error: {
                code: "3",
                message: "No isbn received",
            },
        });
    }

    let reviewId;
    getReviewCounter = () => {
        return new Promise((resolve, reject) => {
            ReviewCounter.findOneAndUpdate(
                { review_seq: { $exists: true } },
                { $inc: { review_seq: 1 } }
            ).exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        success: 0,
                        error: {
                            code: "-1",
                            message: "DB error",
                        },
                    });
                } else {
                    reviewId = data.review_seq;
                    resolve();
                }
            });
        });
    };
    await getReviewCounter();

    let client = null;
    try {
        client = await searchClient(req.nif);
    } catch (err) {
        return res.status(400).json({
            success: 0,
            error: {
                code: "4",
                message: "Nif client invalid",
            },
        });
    }

    Book.findOne({ ISBN: req.body.isbn }, (err, doc) => {
        if (doc == null || err) {
            return res.status(400).json({
                success: 0,
                error: {
                    code: "4",
                    message: "The isbn do not corresponds to any book",
                },
            });
        } else {
            Book.findOneAndUpdate(
                { ISBN: req.body.isbn },
                {
                    $push: {
                        "reviews.list": {
                            reviewId: reviewId,
                            nif: req.nif,
                            name: client.personalInformation.name,
                            rate: parseRate,
                            text: req.body.text,
                        },
                    },
                    $set: {
                        "reviews.totalRate": doc.reviews.totalRate + parseRate,
                        "reviews.counters.one":
                            parseRate != 1
                                ? doc.reviews.counters.one
                                : doc.reviews.counters.one + 1,
                        "reviews.counters.oneAndHalf":
                            parseRate != 1.5
                                ? doc.reviews.counters.oneAndHalf
                                : doc.reviews.counters.oneAndHalf + 1,
                        "reviews.counters.two":
                            parseRate != 2
                                ? doc.reviews.counters.two
                                : doc.reviews.counters.two + 1,
                        "reviews.counters.twoAndHalf":
                            parseRate != 2.5
                                ? doc.reviews.counters.twoAndHalf
                                : doc.reviews.counters.twoAndHalf + 1,
                        "reviews.counters.three":
                            parseRate != 3
                                ? doc.reviews.counters.three
                                : doc.reviews.counters.three + 1,
                        "reviews.counters.threeAndHalf":
                            parseRate != 3.5
                                ? doc.reviews.counters.threeAndHalf
                                : doc.reviews.counters.threeAndHalf + 1,
                        "reviews.counters.four":
                            parseRate != 4
                                ? doc.reviews.counters.four
                                : doc.reviews.counters.four + 1,
                        "reviews.counters.fourAndHalf":
                            parseRate != 4.5
                                ? doc.reviews.counters.fourAndHalf
                                : doc.reviews.counters.fourAndHalf + 1,
                        "reviews.counters.five":
                            parseRate != 5
                                ? doc.reviews.counters.five
                                : doc.reviews.counters.five + 1,
                        "reviews.counterRate": doc.reviews.counterRate + 1,
                        "reviews.averageRate": Number(
                            (
                                (doc.reviews.totalRate + parseRate) /
                                (doc.reviews.counterRate + 1)
                            ).toFixed(2)
                        ),
                    },
                },
                (err, doc) => {
                    if (doc == null || err) {
                        return res.status(400).json({
                            success: 0,
                            error: {
                                code: "4",
                                message:
                                    "The isbn do not corresponds to any book",
                            },
                        });
                    } else {
                        return res.status(200).json({
                            success: 1,
                        });
                    }
                }
            );
        }
    });
};

//promise that checks if a client exists and return the client or reject
function searchClient(nifClient) {
    return new Promise((resolve, reject) => {
        Client.findOne({ "personalInformation.nif": nifClient }).exec(
            (err, dbClient) => {
                if (dbClient) {
                    resolve(dbClient);
                } else {
                    reject();
                }
            }
        );
    });
}

module.exports = bookStoreController;
