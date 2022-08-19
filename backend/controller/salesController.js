var Sale = require("../models/saleModal");
var Client = require("../models/clientModal");
var Book = require("../models/bookModal");
var Points = require("../models/pointsModal");
var Purchase = require("../models/purchaseModal");

var fs = require("fs");
var pdf = require("pdf-creator-node");
var path = require("path");

//pdf document options
var options = {
    format: "A4",
    orientation: "portrait",
    border: "8mm",
    header: {
        height: "8mm",
    },
    footer: {
        height: "7mm",
    },
};

var salesController = {};

//updates the stock in books
salesController.updateStockBooks = (
    bookIsbn,
    minusNew,
    minusExcellent,
    minusGood,
    minusMedium,
    minusBad
) => {
    return new Promise((resolve, reject) => {
        Book.findOneAndUpdate(
            { ISBN: bookIsbn },
            {
                $inc: {
                    "stock.new": -minusNew,
                    "stock.excellent": -minusExcellent,
                    "stock.good": -minusGood,
                    "stock.medium": -minusMedium,
                    "stock.bad": -minusBad,
                },
            },
            { new: true },
            (err, book) => {
                if (err) {
                    console.log(err);
                    reject();
                } else {
                    resolve();
                }
            }
        );
    });
};

//Update the loyalty information of a client after his purchase
salesController.updateLoyaltyClient = (
    clientId,
    updatedPoints,
    booksPurchased,
    moneyPurchased
) => {
    return new Promise((resolve, reject) => {
        Client.findByIdAndUpdate(
            clientId,
            {
                $set: {
                    "loyaltySystem.booksPurchased": booksPurchased,
                    "loyaltySystem.atualPoints": updatedPoints,
                    "loyaltySystem.totalMoneyPurchased": moneyPurchased,
                },
            },
            { new: true },
            (err, client) => {
                if (err) {
                    reject();
                    console.log(err);
                    console.log("IM HEREE");
                } else {
                    resolve();
                }
            }
        );
    });
};

//promise that checks if a client exists and return the client or reject
function searchClient(nif) {
    return new Promise((resolve, reject) => {
        Client.findOne({ "personalInformation.nif": nif }).exec(
            (err, dbClient) => {
                if (dbClient && !err) {
                    resolve(dbClient);
                } else {
                    reject();
                }
            }
        );
    });
}

//promise that checks if a client exists and return the client or reject
function searchBook(isbn) {
    return new Promise((resolve, reject) => {
        Book.findOne({ ISBN: isbn }).exec((err, dbBook) => {
            if (dbBook) {
                resolve(dbBook);
            } else {
                reject();
            }
        });
    });
}

//Get the loyalty program of the store
function getLoyaltyProgram() {
    return new Promise((resolve, reject) => {
        Points.findOne({}, (err, dbLoyaltySystem) => {
            if (err) {
                reject();
            } else {
                resolve(dbLoyaltySystem);
            }
        });
    });
}

//renders dashboard of sales
salesController.showDashboard = async (req, res, next) => {
    let perPage = req.query.perPage || 10; //10 per default
    let page = req.query.page || 1; //page 1 in default

    //checks if the request was a custom search
    let searchType = req.query.searchType || "default";
    let searchValue = req.query.searchValue || null;

    //object for search
    let searchCustomization;

    //checks the search type
    try {
        switch (searchType) {
            case "NIF":
                searchCustomization = { "client.nif": Number(searchValue) };
                break;

            case "clientName":
                searchCustomization = {
                    "client.name": {
                        $regex: `.*${searchValue}.*`,
                        $options: "i",
                    }, //option i: search for upper or lower case
                };
                break;

            case "higherThan":
                searchCustomization = {
                    totalValue: { $gt: Number(searchValue) },
                };
                break;

            case "lowerThan":
                searchCustomization = {
                    totalValue: { $lt: Number(searchValue) },
                };
                break;

            case "salesId":
                searchCustomization = {
                    salesId: Number(searchValue),
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

    searchCustomization.$or = [
        { status: "Pago" },
        { status: { $exists: false } },
    ];

    Sale.find(searchCustomization).exec((err, dbSale) => {
        if (err) {
            return next(err);
        } else {
            let counter = dbSale.length;
            let totalPages = Math.ceil(counter / perPage);
            //if the page to search exceeds the max, the max is associated
            if (page > totalPages) {
                page = totalPages;
            }
            Sale.find(searchCustomization)
                .skip(perPage * page - perPage) //skips the first N elements
                .limit(perPage) //limits the number of results
                .exec(async (err, dbSale) => {
                    if (err) {
                        res.redirect(
                            "/admin/salesAndPurchases/salesDashboard?badSearch=true"
                        );
                        console.log("Error searching for sales in dashboard");
                        next(err);
                    } else {
                        res.render("template", {
                            loadContent: {
                                page: "salesAndPurchases/sales/salesDashboard.ejs",
                                sales: dbSale,
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
                    }
                });
        }
    });
};

//gets the form to register a purchase by client
salesController.saleForm = (req, res) => {
    res.render("template", {
        loadContent: {
            page: "salesAndPurchases/sales/salesForm.ejs",
        },
    });
};

//Search for client and create a var in req or return error
salesController.clientPhase = async (req, res, next) => {
    try {
        req.nif
            ? (req.client = await searchClient(req.nif))
            : (req.client = await searchClient(req.body.client.nif));
        next();
    } catch {
        //If there was problems in client adds a error
        req.errors = {};
        req.errors.ClientNotFound = true;
        res.status(400).json(req.errors);
    }
};

//Search for books and adds the books rows to the local array books
salesController.booksPhase = async (req, res, next) => {
    if (!req.body.books) {
        return res.status(400).json({ error: "No books sended" });
    }

    let books = [];
    let tmpBook;
    let totalValue = new Number(0);
    let booksErrors = [];
    let booksIds = [];
    let totalBooks = 0;

    //For all books received will be checked if the quantity received is valid
    for (let i = 0; i < req.body.books.length; i++) {
        try {
            let book = req.body.books[i];
            tmpBook = await searchBook(book.isbn);
            //check if the books entry is duplicated
            if (booksIds.indexOf(book.isbn) != -1) {
                booksErrors.push("ThereIsDuplicatesLines");
            } else {
                booksIds.push(book.isbn);
            }

            //check if the quantities are integers
            if (
                !Number.isInteger(book.quantity.new) ||
                !Number.isInteger(book.quantity.excellent) ||
                !Number.isInteger(book.quantity.good) ||
                !Number.isInteger(book.quantity.medium) ||
                !Number.isInteger(book.quantity.bad)
            ) {
                booksErrors.push("QuantityIsNotInteger");
            }

            //check if the quantity is a valid number, a positive number and a integer
            if (
                book.quantity.new < 0 ||
                book.quantity.excellent < 0 ||
                book.quantity.good < 0 ||
                book.quantity.medium < 0 ||
                book.quantity.bad < 0
            ) {
                booksErrors.push("QuantityNegativeValue");
            }

            //check if there is enough stock
            if (
                book.quantity.new > tmpBook.stock.new ||
                book.quantity.excellent > tmpBook.stock.excellent ||
                book.quantity.good > tmpBook.stock.good ||
                book.quantity.medium > tmpBook.stock.medium ||
                book.quantity.bad > tmpBook.stock.bad
            ) {
                booksErrors.push("QuantityIsSuperiorThanStock");
            }

            //check if the total of line (card) matches with the received
            let cardTotal = 0;
            cardTotal += book.quantity.new * tmpBook.infoToSale.price.new;
            cardTotal +=
                book.quantity.excellent * tmpBook.infoToSale.price.excellent;
            cardTotal += book.quantity.good * tmpBook.infoToSale.price.good;
            cardTotal += book.quantity.medium * tmpBook.infoToSale.price.medium;
            cardTotal += book.quantity.bad * tmpBook.infoToSale.price.bad;
            cardTotal = Number(cardTotal.toFixed(2));
            if (cardTotal != book.total) {
                booksErrors.push("LineBookTotalNotMatch");
            }

            //if ocurred errors we can stop
            if (booksErrors.length > 0) {
                //adds the books error to the general error
                req.errors.booksErrors = [];
                req.errors.booksErrors = booksErrors;
                return res.status(400).json(req.errors);
            }

            //associates the info to the book object
            book.total = cardTotal;
            book.imageBook = tmpBook.imageBook;
            book.title = tmpBook.title;
            book.isbn = tmpBook.ISBN;
            book.price = tmpBook.infoToSale.price;
            books.push(book);
            totalValue = Number(totalValue) + Number(cardTotal);

            //counts the total of books sold
            totalBooks +=
                book.quantity.new +
                book.quantity.excellent +
                book.quantity.good +
                book.quantity.medium +
                book.quantity.bad;
        } catch (err) {
            console.log(err);
        }
    }

    if (totalBooks.length == 0) {
        booksErrors.push("NoFoundedBooks");
    }

    //if there was errors in books phase
    if (booksErrors.length > 0) {
        //adds the books error to the general error
        req.errors.booksErrors = [];
        req.errors.booksErrors = booksErrors;
        res.status(400).json(req.errors);
    } else {
        req.totalValue = Number(totalValue.toFixed(2));
        req.books = books;
        req.totalBooks = totalBooks;
        next();
    }
};

salesController.pointsPhase = async (req, res, next) => {
    let pointsErrors = [];

    try {
        //sets the loyalty program in req var
        req.loyaltySystem = await getLoyaltyProgram();

        //if there is no points to discount just continue to the next phase
        if (!req.body.pointsToDiscount || req.body.pointsToDiscount == 0) {
            return next();
        }

        //Checks if the discount for each 100 points received matched with the actual value in DB
        if (
            req.loyaltySystem.discountForEach100Points !=
            req.body.discountValuePer100Points
        ) {
            pointsErrors.push("DiscountForEach100PointsNotMatch");
        }

        /* 
        Check if the points to discount are a valid number 
        (higher or equals to 100 and superior, equals or lower than to the actual clients points)
        */
        if (req.body.pointsToDiscount < 100) {
            pointsErrors.push("PointsLowerThan100");
        }

        if (req.body.pointsToDiscount > req.client.loyaltySystem.atualPoints) {
            pointsErrors.push("PointsHigherThanClientPoints");
        }

        /*
        Gets the true points value, rounded by hundreds.
        Because there is discount for each 100 points
        */
        req.pointsToDiscount =
            Math.trunc(req.body.pointsToDiscount / 100) * 100;

        //If the points discount exceeds the total, adjusts the points to the minimum
        if (
            (req.pointsToDiscount / 100) *
                req.loyaltySystem.discountForEach100Points >
            req.totalValue
        ) {
            let minimumPointsNeeded =
                (req.totalValue / req.loyaltySystem.discountForEach100Points) *
                100;
            minimumPointsNeeded = Math.trunc(minimumPointsNeeded);

            let tensPart = minimumPointsNeeded % 100;

            /*if the "tens" part are not equal to 0 its need to goes to the next hundred.
            (1232 -> 1300) because the discount is from 100 points in 100 points */
            if (tensPart != 0) {
                hundredsPart++;
                minimumPointsNeeded = minimumPointsNeeded + (100 - tensPart); //to complete
            }
            req.pointsToDiscount = minimumPointsNeeded;
        }

        /*
        Checks if the value with discount received, matches with the calculation
        with the db actual values
        */
        let discount =
            (req.pointsToDiscount / 100) *
            req.loyaltySystem.discountForEach100Points;
        let totalWithDiscount = req.totalValue - discount;

        //if the discount covers all the value
        if (totalWithDiscount < 0) {
            totalWithDiscount = 0;
        }

        // if the total with discount not match, check only if is not online buy
        if (!req.body.couponPercentage || req.body.couponPercentage == 0) {
            if (totalWithDiscount != req.body.totalValueWithDiscount) {
                pointsErrors.push("TotalWithDiscountNotMatch");
            } else {
                req.totalWithDiscount = totalWithDiscount;
            }
        } else {
            req.totalWithDiscount = totalWithDiscount;
        }
    } catch {
        pointsErrors.push("Error searching loyalty program");
    }

    //if there was errors in points phase
    if (pointsErrors.length > 0) {
        //adds the books error to the general error
        req.errors.pointsErrors = [];
        req.errors.pointsErrors = pointsErrors;
        return res.status(400).json(req.errors);
    } else {
        next();
    }
};

//Last phase, checks if the process occurred without errors and make the response logic
salesController.decisionPhase = async (req, res, next) => {
    //If some error occurred. If objects error have more thant 0 entries
    if (req.errors.length > 0) {
        console.log(req.errors);
        return res.status(400).json(errors);
    }

    req.totalValue = req.totalValue.toFixed(2);

    //If not we can create a sale object
    let sale = new Sale({
        client: {
            _id: req.client._id,
            name: req.client.personalInformation.name,
            nif: req.client.personalInformation.nif,
            cellPhone: req.client.personalInformation.cellPhone,
            email: req.client.personalInformation.email,
            pointsBeforeSale: req.client.loyaltySystem.atualPoints,
        },

        books: req.books,

        totalValue: req.totalValue,

        //for each will check if there is points trigger, if not just put 0
        pointsToDiscount:
            req.body.pointsToDiscount != 0
                ? req.pointsToDiscount //round to hundreds
                : 0,

        totalValueWithDiscount:
            req.body.pointsToDiscount != 0 ? req.totalWithDiscount : 0,

        discountValuePer100Points:
            req.body.pointsToDiscount != 0
                ? req.body.discountValuePer100Points
                : 0,
    });

    //Update all the information of client, if its need
    try {
        //store the old client info
        let oldPoints = req.client.loyaltySystem.atualPoints;

        //points gained because of the buy
        let gainedPoints =
            Math.trunc(req.totalValue) *
            req.loyaltySystem.earnedPointsForEachEuro;

        let lossPoints =
            req.pointsToDiscount || req.pointsToDiscount >= 100
                ? req.pointsToDiscount
                : 0;

        let totalPoints =
            req.client.loyaltySystem.atualPoints + gainedPoints - lossPoints;

        await salesController.updateLoyaltyClient(
            req.client.id,
            totalPoints,
            req.client.loyaltySystem.booksPurchased + req.totalBooks,
            Number(
                (
                    req.client.loyaltySystem.totalMoneyPurchased +
                    Number(req.totalValue)
                ).toFixed(2)
            )
        );
    } catch (err) {
        console.log(err);
        req.errors.ErrorUpdatingClientInfo = true;
        return res.status(400).json(req.errors);
    }

    try {
        //updates the stock in books
        let book;
        for (let i = 0; i < req.body.books.length; i++) {
            book = req.body.books[i];
            await salesController.updateStockBooks(
                book.isbn,
                book.quantity.new,
                book.quantity.excellent,
                book.quantity.good,
                book.quantity.medium,
                book.quantity.bad
            );
        }
    } catch (err) {
        //if a error occurred in book revert the changes in client
        await updateLoyaltyClient(
            req.client._id,
            oldPoints,
            -req.totalBooks,
            -req.totalValue
        );
        req.errors.ErrorUpdatingBookInfo = true;
        return res.status(400).json(req.errors);
    }

    //Insert object in BD
    sale.save((err, dbSale) => {
        if (err) {
            req.errors.ErrorWritingInBD = true;
            console.log(err);
            return res.status(400).json(req.errors);
        } else {
            return res.status(200).json(dbSale);
        }
    });
};

//shows a sale
salesController.showSale = (req, res, err) => {
    Sale.findOne({ _id: req.params.id }).exec((err, sale) => {
        if (err) {
            console.log("Error reading sale");
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "salesAndPurchases/sales/showSale.ejs",
                    sale: sale,
                },
            });
        }
    });
};

//shows a sale
salesController.getSale = (req, res) => {
    Sale.findOne({ _id: req.params.id }).exec((err, sale) => {
        if (err) {
            res.status(400).json({});
        } else {
            res.status(200).json(sale);
        }
    });
};

//generate the invoice pdf document
salesController.generateInvoicePdf = (req, res, next) => {
    Sale.findOne({ _id: req.params.id })
        .lean()
        .exec((err, dbSale) => {
            if (err) {
                console.log("Error reading sale");
            } else {
                //call back function
                let cb = (err, html) => {
                    if (err) {
                        return res.status(400).send("");
                    }
                    const filename = "fatura" + req.params.id + ".pdf";

                    const document = {
                        html: html,
                        data: {
                            host: req.get("host"),
                            document: dbSale.salesId,
                            client: dbSale.client,
                            books: dbSale.books,
                            value: dbSale.totalValue,
                            date: dbSale.date,
                            valueWithDiscount: dbSale.totalValueWithDiscount,
                            discount: Number(
                                (
                                    dbSale.totalValue -
                                    dbSale.totalValueWithDiscount
                                ).toFixed(2)
                            ),
                            shippingInformation: dbSale.shippingInformation,
                        },
                        path: "./docs/faturas/" + filename,
                    };

                    pdf.create(document, options)
                        .then((result) => {
                            const filepath = "/docs/faturas/" + filename;
                            res.status(200).send(filepath);
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(400).send("");
                        });
                };

                fs.readFile(
                    path.join(__dirname, "../styleInvoice/faturaTemplate.html"),
                    "utf-8",
                    (err, data) => {
                        cb(err, data);
                    }
                );
            }
        });
};

//chart requests

//request that returns the earning in last 30 days
salesController.getEarningsByDaysLast30Days = (req, res) => {
    let response = {};

    //Todays date
    let todaysDate = new Date();

    //start date (today minus 30)
    let minus30DaysDate = new Date(); //sets date
    minus30DaysDate.setDate(minus30DaysDate.getDate() - 30); //remove 30 days
    minus30DaysDate = minus30DaysDate.toISOString().slice(0, 10);

    //tmp date, used for loop
    let tmpDate = new Date();
    tmpDate.setDate(tmpDate.getDate() - 30); //remove 30 days

    //goes from the start date until today
    while (tmpDate <= todaysDate) {
        let tmpDateString = tmpDate.toISOString().slice(0, 10);
        response[tmpDateString] = 0;
        tmpDate.setDate(tmpDate.getDate() + 1); //adds one day
    }

    //Searches for the sales between the dates
    Sale.find({
        date: {
            $gte: minus30DaysDate,
            $lte: todaysDate.toISOString().slice(0, 10),
        },
        $or: [{ status: "Pago" }, { status: { $exists: false } }],
    }).exec((err, dbSales) => {
        if (err) {
            res.status(400).json(response);
        } else {
            //for each sale will sum the value to the response object
            dbSales.forEach((sale) => {
                response[sale.date] += Number(sale.totalValue.toFixed(2));
            });
            res.status(200).json(response);
        }
    });
};

//request to get the quantity of books sold per month
salesController.getNumberBooksSoldByMonthLast6MonthsInclusive = (req, res) => {
    let response = {};

    //Todays month
    let todayDate = new Date();

    //start month (today minus 5, because actual month counts)
    let minus6monthsDate = new Date(); //sets date
    minus6monthsDate.setDate(1); //sets the first day of the month
    minus6monthsDate.setMonth(minus6monthsDate.getMonth() - 5); //remove 5 months

    //tmp date, used for loop
    let tmpDate = new Date();
    tmpDate.setMonth(tmpDate.getMonth() - 5); //remove 6 months

    //goes from the start date until today
    while (tmpDate < todayDate) {
        let tmpDateString = tmpDate.toISOString().slice(0, 7); //gets only the yyyy-mm
        response[tmpDateString] = 0;
        tmpDate.setMonth(tmpDate.getMonth() + 1); //adds one month
    }
    response[todayDate.toISOString().slice(0, 7)] = 0; //adds the actual month

    //Searches for the sales between the dates
    const aggregation = Sale.aggregate()
        .match({
            date: {
                $lte: todayDate.toISOString().slice(0, 10),
                $gte: minus6monthsDate.toISOString().slice(0, 10),
            },
            $or: [{ status: "Pago" }, { status: { $exists: false } }],
        })
        .unwind({ path: "$books" })
        .addFields({ actualDate: { $toDate: "$date" } })
        .project({
            books: 1,
            _id: 0,
            date: { $dateToString: { format: "%Y-%m", date: "$actualDate" } },
        })
        .group({ _id: "$date", count: { $sum: 1 } })
        .project({ _id: 0, date: "$_id", count: 1 });

    aggregation.exec((err, dbSales) => {
        if (err) {
            res.status(400).json(response);
        } else {
            //for each sale will sum the counter of books
            dbSales.forEach((sale) => {
                response[sale.date] += sale.count;
            });
            res.status(200).json(response);
        }
    });
};

//request that returns the earning in last 30 days
salesController.getEarningsLast30Days = (req, res) => {
    //Todays date
    let todaysDate = new Date();

    //start date (today minus 30)
    let minus30DaysDate = new Date(); //sets date
    minus30DaysDate.setDate(minus30DaysDate.getDate() - 30); //remove 30 days
    minus30DaysDate = minus30DaysDate.toISOString().slice(0, 10);

    //tmp date, used for loop
    let tmpDate = new Date();
    tmpDate.setDate(tmpDate.getDate() - 30); //remove 30 days

    //Searches for the sales between the dates
    const aggregation = Sale.aggregate()
        .match({
            date: {
                $gte: minus30DaysDate,
                $lte: todaysDate.toISOString().slice(0, 10),
            },
            $or: [{ status: "Pago" }, { status: { $exists: false } }],
        })
        .group({
            _id: null,
            totalValue: { $sum: "$totalValue" },
            lenghtSales: { $sum: 1 },
        })
        .project({
            totalValue: { $round: ["$totalValue", 2] },
            lenghtSales: 1,
            _id: 0,
        });

    aggregation.exec((err, dbSales) => {
        if (err) {
            res.status(400).json();
        } else {
            res.status(200).json(dbSales);
        }
    });
};

salesController.getEarningsPurchasesAndSalesLast3Months = async (req, res) => {
    let responsePurchases = {};
    let responseSales = {};

    //Todays month
    let todayDate = new Date();

    //start month (today minus 5, because actual month counts)
    let minus3monthsDate = new Date(); //sets date
    minus3monthsDate.setDate(1); //sets the first day of the month
    minus3monthsDate.setMonth(minus3monthsDate.getMonth() - 5); //remove 5 months

    //tmp date, used for loop
    let tmpDate = new Date();
    tmpDate.setMonth(tmpDate.getMonth() - 2); //remove 6 months

    //goes from the start date until today
    while (tmpDate < todayDate) {
        let tmpDateString = tmpDate.toISOString().slice(0, 7); //gets only the yyyy-mm
        responsePurchases[tmpDateString] = 0;
        responseSales[tmpDateString] = 0;
        tmpDate.setMonth(tmpDate.getMonth() + 1); //adds one month
    }
    responsePurchases[todayDate.toISOString().slice(0, 7)] = 0; //adds the actual month
    responseSales[todayDate.toISOString().slice(0, 7)] = 0; //adds the actual month

    //Searches for the sales between the dates
    const aggregation = Sale.aggregate()
        .match({
            date: {
                $lte: todayDate.toISOString().slice(0, 10),
                $gte: minus3monthsDate.toISOString().slice(0, 10),
            },
            $or: [{ status: "Pago" }, { status: { $exists: false } }],
        })
        .addFields({ actualDate: { $toDate: "$date" } })
        .project({
            totalValue: 1,
            _id: 0,
            date: { $dateToString: { format: "%Y-%m", date: "$actualDate" } },
        })
        .group({ _id: "$date", totalValue: { $sum: "$totalValue" } });

    aggregation.exec((err, dbSales) => {
        if (err) {
            res.status(400).json(responseSales);
        } else {
            dbSales.forEach((sale) => {
                responseSales[sale._id] = sale.totalValue;
            });
        }
    });

    //Searches for the sales between the dates
    const aggregationPurchases = Purchase.aggregate()
        .match({
            date: {
                $lte: todayDate.toISOString().slice(0, 10),
                $gte: minus3monthsDate.toISOString().slice(0, 10),
            },
        })
        .addFields({ actualDate: { $toDate: "$date" } })
        .project({
            totalValue: 1,
            _id: 0,
            date: { $dateToString: { format: "%Y-%m", date: "$actualDate" } },
        })
        .group({ _id: "$date", totalValue: { $sum: "$totalValue" } })
        .project({
            totalValue: { $round: ["$totalValue", 2] },
            _id: 1,
        });

    aggregationPurchases.exec((err, dbPurchases) => {
        if (err) {
            res.status(400).json(responsePurchases);
        } else {
            dbPurchases.forEach((purchase) => {
                responsePurchases[purchase._id] = purchase.totalValue;
            });

            let response = {
                purchases: responsePurchases,
                sales: responseSales,
            };

            res.status(200).json(response);
        }
    });
};

module.exports = salesController;
