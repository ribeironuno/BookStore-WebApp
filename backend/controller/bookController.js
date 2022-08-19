var mongoose = require("mongoose");
var Book = require("../models/bookModal");
var path = require("path");
var fs = require("fs");
var percentagesController = require("../controller/percentagesController");
var Purchase = require("../models/purchaseModal");
var Sale = require("../models/saleModal");
var ObjectId = require("mongoose").Types.ObjectId;

var bookController = {};

//show form to create one book
bookController.dashboard = (req, res, next) => {
    let perPage = req.query.perPage || 10; //10 per default
    let page = req.query.page || 1; //page 1 in default

    let searchType = req.query.searchType || "default";
    let searchValue = req.query.searchValue || null;

    //object for search
    let searchCustomization;

    //checks the search type
    try {
        switch (searchType) {
            case "isbn":
                searchCustomization = { ISBN: searchValue };
                break;

            case "authorName":
                searchCustomization = {
                    "author.name": {
                        $regex: `.*${searchValue}.*`,
                        $options: "i",
                    },
                };
                break;

            case "subject":
                searchCustomization = {
                    subject: {
                        $regex: `.*${searchValue}.*`,
                        $options: "i",
                    },
                };
                break;

            default:
                searchCustomization = {};
                break;
        }
    } catch {
        //If some error in casting occurred
        searchCustomization = {};
        searchType = "default";
        searchValue = null;
    }

    Book.find(searchCustomization).exec((err, dbBook) => {
        if (err) {
            return next(err);
        } else {
            let counter = dbBook.length;
            let totalPages = Math.ceil(counter / perPage);
            //if the page to search exceeds the max, the max is associated
            if (page > totalPages) {
                page = totalPages;
            }
            Book.find(searchCustomization)
                .skip(perPage * page - perPage) //skips the first N elements
                .limit(perPage) //limits the number of results
                .exec(async (err, dbBook) => {
                    if (err) {
                        res.redirect("/admin/books?badSearch=true");
                        console.log("Error searching for books in dashboard");
                        next(err);
                    } else {
                        try {
                            res.render("template", {
                                loadContent: {
                                    page: "books/bookDashboard.ejs",
                                    books: dbBook,
                                    pagination: {
                                        totalPages: totalPages,
                                        current: Number(page),
                                        perPage: perPage,
                                    },
                                    search: {
                                        type: searchType,
                                        value: searchValue,
                                    },
                                },
                            });
                        } catch (err) {
                            console.log("Error in show all books");
                            return next(err);
                        }
                    }
                });
        }
    });
};

//show form to create one book
bookController.formCreate = (req, res) => {
    res.render("template", { loadContent: { page: "books/createBook.ejs" } });
};

//save image in the processing of creating/editing book
bookController.saveImage = (req, res, next) => {
    if (req.file) {
        // writes the file in disk
        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                req.errors.errorWritingImageInDisk = true;
                return next();
            } else {
                fs.writeFile(req.file.path, data, function (err) {
                    if (err) {
                        req.errors.errorWritingImageInDisk = true;
                        return next();
                    } else {
                        return next();
                    }
                });
            }
        });
    } else {
        next();
    }
};

//calculate the prices
bookController.calculatePrices = async (req, res, next) => {
    let pricesObj = { toSale: {}, toPurchase: {} };

    if (!req.body.newPrice) {
        req.errors.NewPriceNotSended = true;
        return next();
    }

    let baseValue = req.body.newPrice;

    percentagesController
        .getPercentagesPromise()
        .then((percentages) => {
            try {
                pricesObj.toSale.excellent = (
                    (baseValue * percentages.percentagesToSale.excellent) /
                    100
                ).toFixed(2);
                pricesObj.toSale.good = (
                    (baseValue * percentages.percentagesToSale.good) /
                    100
                ).toFixed(2);
                pricesObj.toSale.medium = (
                    (baseValue * percentages.percentagesToSale.medium) /
                    100
                ).toFixed(2);
                pricesObj.toSale.bad = (
                    (baseValue * percentages.percentagesToSale.bad) /
                    100
                ).toFixed(2);

                pricesObj.toPurchase.excellent = (
                    (baseValue * percentages.percentagesToPurchase.excellent) /
                    100
                ).toFixed(2);
                pricesObj.toPurchase.good = (
                    (baseValue * percentages.percentagesToPurchase.good) /
                    100
                ).toFixed(2);
                pricesObj.toPurchase.medium = (
                    (baseValue * percentages.percentagesToPurchase.medium) /
                    100
                ).toFixed(2);
                pricesObj.toPurchase.bad = (
                    (baseValue * percentages.percentagesToPurchase.bad) /
                    100
                ).toFixed(2);
            } catch {
                req.errors.CalculationPrices = true;
                return next();
            }
        })
        .then(() => {
            req.prices = pricesObj; //associate to the req var
            return next();
        })
        .catch((err) => {
            req.errors.GettingPercentage = true;
            return next();
        });
};

//creates one book
bookController.create = async (req, res, next) => {
    if (!req.file) {
        req.errors.notImage = true;
        return res.status(400).json(req.errors);
    }

    let tmp = req.file.path.replace("public", "");
    tmp = tmp.substring(1, tmp.length);
    tmp = tmp.replaceAll("\\", "/");

    if (!req.prices) {
        //if there is no prices, can't continue
        return res.status(400).json(req.errors);
    }
    //Create book object to be inserted in bd
    let book = new Book({
        title: req.body.title,
        edition: req.body.edition,
        publishYear: req.body.publishYear,
        numberPages: req.body.numberPages,
        ISBN: req.body.ISBN,
        language: req.body.language,
        author: {
            name: req.body.authorName,
            key: req.body.keyAuthor,
        },
        subject: req.body.subject,
        imageBook: {
            staticUrl: tmp,
            type: req.file.mimetype,
        },
        description: req.body.description,
        stock: {
            new: req.body.newStock,
            excellent: req.body.usedExcellentStock,
            good: req.body.usedGoodStock,
            medium: req.body.usedMediumStock,
            bad: req.body.usedBadStock,
        },
        infoToSale: {
            price: {
                new: req.body.newPrice,
                excellent: req.prices.toSale.excellent,
                good: req.prices.toSale.good,
                medium: req.prices.toSale.medium,
                bad: req.prices.toSale.bad,
            },
        },
        infoToPurchase: {
            price: {
                excellent: req.prices.toPurchase.excellent,
                good: req.prices.toPurchase.good,
                medium: req.prices.toPurchase.medium,
                bad: req.prices.toPurchase.bad,
            },
        },
    });
    //Insert object in BD
    book.save((err, dbBook) => {
        if (err) {
            console.log(err);
            if (err.name === "MongoServerError" && err.code === 11000) {
                //unique error (isbn)
                req.errors.isbnDuplicate = true;
            }
            if (err.name == "ValidationError") {
                //general validation error
                req.errors.validationsErrors = true;
            }
            if (Object.keys(req.errors).length == 0) {
                //other error that we are not counting
                req.errors.notIdentified = true;
            }
        }
        //if there were errors in the process
        if (Object.keys(req.errors).length > 0) {
            if (req.file) {
                // if was send a img its necessary to remove
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        req.errors.deletingImage = true;
                    }
                });
            }
            res.status(400).json(req.errors);
        } else {
            if (req.body.newsletter) {
                req.createdBook = dbBook;
                return next();
            } else {
                res.status(200).json(dbBook);
            }
        }
    });
};

//shows form to edit
bookController.formEdit = (req, res, next) => {
    Book.findOne({ _id: req.params.id }).exec((err, dbitem) => {
        if (err) {
            console.log("Error showing form edit in books");
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "books/editBook.ejs",
                    book: dbitem,
                },
            });
        }
    });
};

//edit one book
bookController.edit = async (req, res, next) => {
    if (!req.prices) {
        //if there is no prices, can't continue
        return res.status(400).json(req.errors);
    }

    //Create book object to be inserted in bd
    let book = new Book(
        {
            title: req.body.title,
            edition: req.body.edition,
            publishYear: req.body.publishYear,
            numberPages: req.body.numberPages,
            ISBN: req.body.newIsbn,
            language: req.body.language,
            author: {
                name: req.body.authorName,
                key: req.body.keyAuthor,
            },
            subject: req.body.subject,
            stock: {
                new: req.body.newStock,
                excellent: req.body.usedExcellentStock,
                good: req.body.usedGoodStock,
                medium: req.body.usedMediumStock,
                bad: req.body.usedBadStock,
            },
            description: req.body.description,
            infoToSale: {
                price: {
                    new: req.body.newPrice,
                    excellent: req.prices.toSale.excellent,
                    good: req.prices.toSale.good,
                    medium: req.prices.toSale.medium,
                    bad: req.prices.toSale.bad,
                },
            },
            infoToPurchase: {
                price: {
                    excellent: req.prices.toPurchase.excellent,
                    good: req.prices.toPurchase.good,
                    medium: req.prices.toPurchase.medium,
                    bad: req.prices.toPurchase.bad,
                },
            },
        },
        { _id: false }
    );

    if (req.file) {
        //if image was received to change
        if (!req.errorInImage) {
            //if image was saved correctly
            let imageBook = {};
            let tmp = req.file.path.replace("public", "");
            tmp = tmp.substring(1, tmp.length);
            tmp = tmp.replaceAll("\\", "/");
            imageBook.staticUrl = tmp;
            imageBook.type = req.file.mimety;
            book.imageBook = imageBook;
        }
    }

    Book.findOneAndUpdate(
        { ISBN: req.params.isbn },
        book,
        { runValidators: true },
        (err, dbOldBook) => {
            if (err) {
                if (req.file) {
                    // if DB errors occurred and user send a new img delete image saved
                    fs.unlink(req.file.path, function (err) {
                        if (err) {
                            return next(err);
                        }
                    });
                }

                if (err.name === "MongoServerError" && err.code === 11000) {
                    req.errors.isbnDuplicate = true;
                }
                if (err.name == "ValidationError") {
                    req.errors.validationsErrors = true;
                }
                res.status(400).json(req.errors);
            } else if (dbOldBook == null) {
                //isbn not founded
                req.errors.BookNotFound = true;
                res.status(400).json(req.errors);
            } else {
                if (req.file) {
                    // if image was updated , delete old image
                    fs.unlink(
                        "public/" + dbOldBook.imageBook.staticUrl,
                        function (err) {
                            if (err) {
                                return next(err);
                            }
                        }
                    );
                }
                res.status(200).json({ isbn: req.body.newIsbn });
            }
        }
    );
};

//view one book
bookController.show = (req, res, next) => {
    Book.findOne({ ISBN: req.params.isbn }).exec((err, dbBook) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "books/viewBook.ejs",
                    book: dbBook,
                },
            });
        }
    });
};

//view one book
bookController.deleteReview = (req, res, next) => {
    console.log(req.body);
    try {
        //search fot the book
        Book.findOne({
            ISBN: req.body.isbn,
        }).exec((err, data) => {
            if (err) {
                console.log(err);
                return res.status(400).json(err);
            } else {
                if (data == null) {
                    return res.status(400).json({ error: "Book not found" });
                }
                //if the ook does not have reviews
                if (data.reviews.totalRate == 0) {
                    return res
                        .status(400)
                        .json({ error: "No reviews in book" });
                }
                //if have we need to search for the review information
                let reviews = data.reviews.list;
                let reviewToRemove = null;
                for (let i = 0; i < reviews.length; i++) {
                    if (reviews[i].reviewId == req.body.idReview) {
                        reviewToRemove = reviews[i];
                        break;
                    }
                }

                if (reviewToRemove == null) {
                    return res
                        .status(400)
                        .json({ error: "Id not found in book" });
                }

                let newAvg = Number(
                    (
                        (data.reviews.totalRate - reviewToRemove.rate) /
                        (data.reviews.counterRate - 1)
                    ).toFixed(2)
                );

                Book.findOneAndUpdate(
                    { ISBN: req.body.isbn },
                    {
                        $pull: {
                            "reviews.list": {
                                reviewId: req.body.idReview,
                            },
                        },
                        $set: {
                            "reviews.totalRate":
                                data.reviews.totalRate - reviewToRemove.rate,
                            "reviews.counters.one":
                                reviewToRemove.rate != 1
                                    ? data.reviews.counters.one
                                    : data.reviews.counters.one - 1,
                            "reviews.counters.oneAndHalf":
                                reviewToRemove.rate != 1.5
                                    ? data.reviews.counters.oneAndHalf
                                    : data.reviews.counters.oneAndHalf - 1,
                            "reviews.counters.two":
                                reviewToRemove.rate != 2
                                    ? data.reviews.counters.two
                                    : data.reviews.counters.two - 1,
                            "reviews.counters.twoAndHalf":
                                reviewToRemove.rate != 2.5
                                    ? data.reviews.counters.twoAndHalf
                                    : data.reviews.counters.twoAndHalf - 1,
                            "reviews.counters.three":
                                reviewToRemove.rate != 3
                                    ? data.reviews.counters.three
                                    : data.reviews.counters.three - 1,
                            "reviews.counters.threeAndHalf":
                                reviewToRemove.rate != 3.5
                                    ? data.reviews.counters.threeAndHalf
                                    : data.reviews.counters.threeAndHalf - 1,
                            "reviews.counters.four":
                                reviewToRemove.rate != 4
                                    ? data.reviews.counters.four
                                    : data.reviews.counters.four - 1,
                            "reviews.counters.fourAndHalf":
                                reviewToRemove.rate != 4.5
                                    ? data.reviews.counters.fourAndHalf
                                    : data.reviews.counters.fourAndHalf - 1,
                            "reviews.counters.five":
                                reviewToRemove.rate != 5
                                    ? data.reviews.counters.five
                                    : data.reviews.counters.five - 1,

                            "reviews.counterRate": data.reviews.counterRate - 1,
                            "reviews.averageRate":
                                data.reviews.counterRate == 0
                                    ? 1
                                    : Number(
                                          (
                                              (data.reviews.totalRate - 1.5) /
                                              (data.reviews.counterRate - 1)
                                          ).toFixed(2)
                                      ),
                        },
                    }
                ).exec((err, updatedinfo) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json(err);
                    } else {
                        if (updatedinfo.modifiedCount == 0) {
                            return res.status(400).json(updatedinfo);
                        }
                        return res.status(200).json(updatedinfo);
                    }
                });
            }
        });
    } catch (err) {
        console.log(err);
    }
};

//checks if a client have at least one sale associated
checkIfBookExitsInSales = (isbn) => {
    return new Promise((resolve, reject) => {
        Sale.exists({ "books.isbn": isbn }).exec((err, exists) => {
            if (err) {
                reject(err);
            } else {
                if (exists != null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
};

//checks if a client have at least one sale associated
checkIfBookExitsInPurchases = (isbn) => {
    return new Promise((resolve, reject) => {
        Purchase.exists({ "books.isbn": isbn }).exec((err, exists) => {
            if (err) {
                reject(err);
            } else {
                if (exists != null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
};

//delete book
bookController.delete = (req, res, next) => {
    Promise.all([
        checkIfBookExitsInPurchases(req.params.isbn),
        checkIfBookExitsInSales(req.params.isbn),
    ])
        .then((result) => {
            if (result[0] || result[1]) {
                res.status(400).json({
                    error: "bookAssociatedWithSalesOrPurchases",
                });
            } else {
                Book.findOneAndDelete({ ISBN: req.params.isbn }).exec(
                    (err, dbBook) => {
                        if (err) {
                            return next(err);
                        } else if (dbBook == null) {
                            res.status(400).json({ error: "BookNotFound" });
                        } else {
                            // delete image from disk
                            fs.unlink(
                                "public/" + dbBook.imageBook.staticUrl,
                                function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                }
                            );
                            res.status(200).json(result.deletedCount);
                        }
                    }
                );
            }
        })
        .catch((err) => {
            next(err);
        });
};

//return the book JSON that correspond to the ISBN
bookController.getBookByIsbn = (req, res) => {
    Book.findOne({ ISBN: req.query.isbn }).exec((err, dbBook) => {
        if (err) {
            res.status(404).json(err);
        } else {
            res.status(200).json(dbBook);
        }
    });
};

//get group by subjects
bookController.getSubjectsCountDesc = async (req, res) => {
    Book.aggregate()
        .unwind({
            path: "$subject",
        })
        .group({
            _id: "$subject",
            count: { $sum: 1 },
        })
        .project({
            subject: "$_id",
            count: 1,
            _id: 0,
        })
        .sort({ count: -1 })
        .exec((err, result) => {
            if (err) {
                res.status(400).json({});
            } else {
                res.status(200).json(result);
            }
        });
};

//request to get number of books by author
bookController.getBooksByAuthorDesc = async (req, res) => {
    Book.aggregate()
        .group({
            _id: "$author.name",
            count: { $sum: 1 },
        })
        .project({
            author: "$_id",
            count: 1,
            _id: 0,
        })
        .sort({ count: -1 })
        .exec((err, result) => {
            if (err) {
                res.status(400).json({});
            } else {
                res.status(200).json(result);
            }
        });
};

module.exports = bookController;
