var Client = require("../models/clientModal");
var Book = require("../models/bookModal");
var Points = require("../models/pointsModal");

var fs = require("fs");
var pdf = require("pdf-creator-node");
var path = require("path");

var Purchase = require("../models/purchaseModal");

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

var purchasesController = {};

//gets the form to register a sell from a client
purchasesController.clientSellForm = (req, res) => {
    res.render("template", {
        loadContent: {
            page: "salesAndPurchases/purchases/purchaseForm.ejs",
        },
    });
};

//gets the form to register a sell from a client
purchasesController.generatePdfCredit = async (req, res) => {
    Purchase.findOne({ _id: req.params.id })
        .lean()
        .exec((err, purchase) => {
            let cb = (err, html) => {
                if (err) {
                    res.status(400).send("");
                }

                const filename = "notaCredito" + req.params.id + ".pdf";

                const document = {
                    html: html,
                    data: {
                        host: req.get("host"),
                        client: purchase.client,
                        books: purchase.books,
                        value: purchase.totalValue,
                        date: purchase.date,
                        documentId: purchase.purchaseId,
                    },
                    path: "./docs/notasDeCredito/" + filename,
                };

                pdf.create(document, options)
                    .then((result) => {
                        const filepath = "/docs/notasDeCredito/" + filename;
                        res.status(200).send(filepath);
                    })
                    .catch((error) => {
                        res.status(400).send("");
                    });
            };

            if (err) {
                res.status(400).send("");
            } else {
                fs.readFile(
                    path.join(
                        __dirname,
                        "../styleInvoice/invoiceTemplate.html"
                    ),
                    "utf-8",
                    (err, data) => {
                        cb(err, data);
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

//promise that checks if a client exists and return the client or reject
function searchBook(isbnBook) {
    return new Promise((resolve, reject) => {
        Book.findOne({ ISBN: isbnBook }).exec((err, dbBook) => {
            if (dbBook) {
                resolve(dbBook);
            } else {
                reject();
            }
        });
    });
}

//Get the fidelization program of the store
function getFidelizationProgram() {
    return new Promise((resolve, reject) => {
        Points.find({}, (err, fidelizationProgram) => {
            if (err) {
                reject();
            } else {
                resolve(fidelizationProgram);
            }
        });
    });
}

//Update the loyalatly information of a client after his purchase
function updateLoyaltylyClient(
    clientId,
    newAtualPoints,
    booksPurchased,
    totalMoneyPurchased
) {
    return new Promise((resolve, reject) => {
        Client.findByIdAndUpdate(
            clientId,
            {
                $set: {
                    "loyaltySystem.booksSold": booksPurchased,
                    "loyaltySystem.atualPoints": newAtualPoints,
                    "loyaltySystem.totalMoneySold": totalMoneyPurchased,
                },
            },
            { new: true },
            (err, client) => {
                if (err) {
                    reject();
                } else {
                    resolve();
                }
            }
        );
    });
}

//get atual stock of a book
function getAtualStock(bookId, grade) {
    return new Promise((resolve, reject) => {
        Book.findOne({ _id: bookId }).exec((err, book) => {
            if (err) {
                reject();
            } else {
                switch (grade) {
                    case "Excelente":
                        resolve(book.stock.excellent);
                        break;
                    case "Bom":
                        resolve(book.stock.good);
                        break;
                    case "Médio":
                        resolve(book.stock.medium);
                        break;
                    case "Mau":
                        resolve(book.stock.bad);
                        break;
                }
            }
        });
    });
}

//Update stock after purchase registation
function updateStockBooks(bookId, grade, newStock) {
    return new Promise((resolve, reject) => {
        switch (grade) {
            case "Excelente":
                setCondition = { "stock.excellent": newStock };
                break;
            case "Bom":
                setCondition = { "stock.good": newStock };
                break;
            case "Médio":
                setCondition = { "stock.medium": newStock };
                break;
            case "Mau":
                setCondition = { "stock.bad": newStock };
                break;
        }
        Book.findByIdAndUpdate(
            bookId,
            {
                $set: setCondition,
            },
            { new: true },
            (err, book) => {
                if (err) {
                    reject();
                } else {
                    resolve();
                }
            }
        );
    });
}

purchasesController.clientPhase = async (req, res, next) => {
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

purchasesController.booksPhase = async (req, res, next) => {
    let books = [];
    let tmpBook;
    let totalValue = 0;
    let booksErrors = [];
    let booksQuantity = 0;

    for (let i = 0; i < req.body.books.length; i++) {
        try {
            tmpBook = await searchBook(req.body.books[i].isbn);
            req.body.books[i]._id = tmpBook._id;

            //check if the grade of the book is valid
            if (
                req.body.books[i].grade != "Excelente" &&
                req.body.books[i].grade != "Bom" &&
                req.body.books[i].grade != "Médio" &&
                req.body.books[i].grade != "Mau"
            ) {
                booksErrors.push("BookGradeNotValid");
            } else {
                let actualPrice;
                switch (req.body.books[i].grade) {
                    case "Excelente":
                        actualPrice = tmpBook.infoToPurchase.price.excellent;
                        break;
                    case "Bom":
                        actualPrice = tmpBook.infoToPurchase.price.good;
                        break;
                    case "Médio":
                        actualPrice = tmpBook.infoToPurchase.price.medium;
                        break;
                    case "Mau":
                        actualPrice = tmpBook.infoToPurchase.price.bad;
                        break;
                }

                if (req.body.books[i].pricePerUnit != actualPrice) {
                    booksErrors.push("BooksPricesNotMatch");
                } else {
                    req.body.books[i].title = tmpBook.title;
                    books.push(req.body.books[i]);
                    booksQuantity += req.body.books[i].quantity;
                    totalValue +=
                        Math.round(
                            (req.body.books[i].quantity *
                                req.body.books[i].pricePerUnit +
                                Number.EPSILON) *
                                100
                        ) / 100;
                }
            }
        } catch (err) {
            //book not found
            booksErrors.push("BooksNotFound");
        }
    }
    //if there was errors in books phase
    if (booksErrors.length > 0) {
        //adds the books error to the general error
        req.errors.booksErrors = [];
        req.errors.booksErrors = booksErrors;
        res.status(400).json(req.errors);
    } else {
        req.totalValue = Math.round((totalValue + Number.EPSILON) * 100) / 100;
        req.books = books;
        req.quantity = booksQuantity;
        next();
    }
};

purchasesController.finalPhase = async (req, res, next) => {
    if (req.errors.length > 0) {
        return res.status(400).json(errors);
    }
    //If there is no error we update and calculate the 'impact' of the purchase on the store

    //GET fidelization program to calculate the points that client gonna be earn
    let fidelizationProgram = await getFidelizationProgram();

    //Points of client after this purchase
    let newPoints =
        req.client.loyaltySystem.atualPoints +
        fidelizationProgram[0].earnedPointsForEachPurchaseUsedBook *
            req.quantity;

    //Create a new purchase object
    purchase = new Purchase({
        client: {
            _id: req.client._id,
            name: req.client.personalInformation.name,
            nif: req.client.personalInformation.nif,
            cellPhone: req.client.personalInformation.cellPhone,
            email: req.client.personalInformation.email,
            pointsBeforePurchase: req.client.loyaltySystem.atualPoints,
            pointsAfterPurchase: newPoints,
        },
        books: req.books,
        totalValue: req.totalValue,
    });

    //Update all the information of client
    await updateLoyaltylyClient(
        req.client._id,
        newPoints,
        req.client.loyaltySystem.booksSold + req.quantity,
        (req.client.loyaltySystem.totalMoneySold =
            Math.round(
                (req.client.loyaltySystem.totalMoneySold +
                    req.totalValue +
                    Number.EPSILON) *
                    100
            ) / 100)
    );

    let tmpBook, quantity;

    //Update the stock of all books purchased (used condiction only!)
    for (let i = 0; i < req.books.length; i++) {
        tmpBook = await searchBook(req.books[i].isbn);

        newStock = await getAtualStock(req.books[i]._id, req.books[i].grade);

        await updateStockBooks(
            req.books[i]._id,
            req.books[i].grade,
            newStock + req.books[i].quantity
        );
    }

    //If nothing fails we can save the purchase
    purchase.save((err, purchase) => {
        if (err) {
            errors.ErrorWritingInBD = true;
            res.status(400).json(errors);
        } else {
            res.status(200).json(purchase);
        }
    });
};

purchasesController.show = (req, res, next) => {
    Purchase.findOne({ _id: req.params.id }).exec((err, purchase) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "salesAndPurchases/purchases/showPurchase.ejs",
                    purchase: purchase,
                },
            });
        }
    });
};

purchasesController.dashboardPurchases = (req, res, next) => {
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

            case "purchaseId":
                searchCustomization = {
                    purchaseId: Number(searchValue),
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
        { status: "Aprovado" },
        { status: { $exists: false } },
    ];

    Purchase.find(searchCustomization).exec((err, dbPurchase) => {
        if (err) {
            next(err);
        } else {
            let counter = dbPurchase.length;
            let totalPages = Math.ceil(counter / perPage);
            //if the page to search exceeds the max, the max is associated
            if (page > totalPages) {
                page = totalPages;
            }
            Purchase.find(searchCustomization)
                .skip(perPage * page - perPage) //skips the first N elements
                .limit(perPage) //limits the number of results
                .exec(async (err, dbPurchase) => {
                    if (err) {
                        next(err);
                    } else {
                        res.render("template", {
                            loadContent: {
                                page: "salesAndPurchases/purchases/purchaseDashboard.ejs",
                                purchases: dbPurchase,
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

//request that returns the money spent on used books (purchases values) in last 30 days
purchasesController.getPurchasesByDaysLast30Days = (req, res) => {
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

    //Searches for the purchases between the dates
    Purchase.find({
        date: {
            $gt: minus30DaysDate,
            $lte: todaysDate.toISOString().slice(0, 10),
        },
        $or: [{ status: "Aprovado" }, { status: { $exists: false } }],
    }).exec((err, dbPurchases) => {
        if (err) {
            res.status(400).json(response);
        } else {
            //for each purchase will sum the value to the response object
            dbPurchases.forEach((purchase) => {
                response[purchase.date] += purchase.totalValue;
            });
            res.status(200).json(response);
        }
    });
};

//request to get the quantity of books purchased per month
purchasesController.getNumberBooksPurchasedByMonthLast6MonthsInclusive = (
    req,
    res
) => {
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

    //Searches for the purchases between the dates
    const aggregation = Purchase.aggregate()
        .match({
            date: {
                $lte: todayDate.toISOString().slice(0, 10),
                $gte: minus6monthsDate.toISOString().slice(0, 10),
            },
            $or: [{ status: "Aprovado" }, { status: { $exists: false } }],
        })
        .unwind({ path: "$books" })
        .addFields({ actualDate: { $toDate: "$date" } })
        .project({
            books: 1,
            _id: 0,
            date: { $dateToString: { format: "%Y-%m", date: "$actualDate" } },
        })
        .group({ _id: "$date", count: { $sum: "$books.quantity" } })
        .project({ _id: 0, date: "$_id", count: 1 });

    aggregation.exec((err, dbPurchases) => {
        if (err) {
            res.status(400).json(response);
        } else {
            //for each purchase will sum the counter of books
            dbPurchases.forEach((purchase) => {
                response[purchase.date] += purchase.count;
            });
            res.status(200).json(response);
        }
    });
};

//request that returns the earning in last 30 days
purchasesController.getTotalPurchasedLast30Days = (req, res) => {
    //Todays date
    let todaysDate = new Date();

    //start date (today minus 30)
    let minus30DaysDate = new Date(); //sets date
    minus30DaysDate.setDate(minus30DaysDate.getDate() - 30); //remove 30 days
    minus30DaysDate = minus30DaysDate.toISOString().slice(0, 10);

    //tmp date, used for loop
    let tmpDate = new Date();
    tmpDate.setDate(tmpDate.getDate() - 30); //remove 30 days

    const aggregation = Purchase.aggregate()
        .match({
            date: {
                $gte: minus30DaysDate,
                $lte: todaysDate.toISOString().slice(0, 10),
            },
            $or: [{ status: "Aprovado" }, { status: { $exists: false } }],
        })
        .group({
            _id: null,
            totalValue: { $sum: "$totalValue" },
            lengthPurchases: { $sum: 1 },
        })
        .project({
            totalValue: { $round: ["$totalValue", 2] },
            lengthPurchases: 1,
            _id: 0,
        });

    aggregation.exec((err, dbPurchase) => {
        if (err) {
            res.status(400).json();
        } else {
            res.status(200).json(dbPurchase);
        }
    });
};

//show all the purchase request
purchasesController.salesRequestList = (req, res, next) => {
    let perPage = req.query.perPage || 10; //10 per default
    let page = req.query.page || 1; //page 1 in default

    //checks if the request was a custom search
    let searchType = req.query.searchType || "default";
    let searchValue = req.query.searchValue || null;

    //object for search
    let searchCustomization = { status: { $in: ["Pendente", "Recusado"] } };

    //checks the search type
    try {
        switch (searchType) {
            case "NIF":
                searchCustomization = {
                    "client.nif": Number(searchValue),
                    status: { $in: ["Pendente", "Recusado"] },
                };
                break;

            case "clientName":
                searchCustomization = {
                    "client.name": {
                        $regex: `.*${searchValue}.*`,
                        $options: "i",
                    }, //option i: search for upper or lower case
                    status: { $in: ["Pendente", "Recusado"] },
                };
                break;

            case "higherThan":
                searchCustomization = {
                    totalValue: { $gt: Number(searchValue) },
                    status: { $in: ["Pendente", "Recusado"] },
                };
                break;

            case "lowerThan":
                searchCustomization = {
                    totalValue: { $lt: Number(searchValue) },
                    status: { $in: ["Pendente", "Recusado"] },
                };
                break;

            case "requestId":
                searchCustomization = {
                    purchaseId: Number(searchValue),
                    status: { $in: ["Pendente", "Recusado"] },
                };
                break;

            case "refused":
                searchCustomization = {
                    status: "Recusado",
                };
                break;

            case "pending":
                searchCustomization = {
                    status: "Pendente",
                };
                break;

            default:
                searchCustomization = {
                    status: { $in: ["Pendente", "Recusado"] },
                };
                break;
        }
    } catch {
        //If some error in casting occurred
        searchCustomization = { status: { $in: ["Pendente", "Recusado"] } };
        searchType = "default";
        searchValue = null;
    }

    Purchase.find(searchCustomization)
        .sort({ date: "descending" })
        .exec((err, dbPurchase) => {
            if (err) {
                next(err);
            } else {
                let counter = dbPurchase.length;
                let totalPages = Math.ceil(counter / perPage);
                //if the page to search exceeds the max, the max is associated
                if (page > totalPages) {
                    page = totalPages;
                }
                Purchase.find(searchCustomization)
                    .sort({ date: "descending" })
                    .skip(perPage * page - perPage) //skips the first N elements
                    .limit(perPage) //limits the number of results
                    .exec(async (err, dbPurchase) => {
                        if (err) {
                            next(err);
                        } else {
                            res.render("template", {
                                loadContent: {
                                    page: "salesAndPurchases/purchases/purchasesRequested.ejs",
                                    requests: dbPurchase,
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

//show a specific request purchase
purchasesController.showRequest = (req, res) => {
    Purchase.findOne({ _id: req.params.id }).exec((err, dbRequest) => {
        if (err) {
            next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "salesAndPurchases/purchases/showRequest.ejs",
                    request: dbRequest,
                },
            });
        }
    });
};

//deny a specific request
purchasesController.denyRequest = (req, res) => {
    Purchase.findOneAndUpdate(
        { _id: req.params.id },
        {
            $set: { status: "Recusado" },
        },
        (err, editedClient) => {
            if (err) {
                res.status(200).json(editedClient);
            } else {
                res.status(200).json({});
            }
        }
    );
};

//Get the fidelization program of the store
function findRequest(id) {
    return new Promise((resolve, reject) => {
        Purchase.findOne({ _id: id }, (err, request) => {
            if (err) {
                reject();
            } else {
                resolve(request);
            }
        });
    });
}

//deny a specific request
purchasesController.approveRequest = async (req, res) => {
    //GET the request that should be approved
    let request = await findRequest(req.params.id);

    let quantityBooks = 0;
    for (let i = 0; i < request.books.length; i++) {
        quantityBooks += request.books[i].quantity;
    }

    //GET the client associated with the request
    let client = await searchClient(request.client.nif);

    //GET fidelization program to calculate the points that client gonna be earn
    let fidelizationProgram = await getFidelizationProgram();

    //Points of client after this purchase
    let newPoints =
        client.loyaltySystem.atualPoints +
        fidelizationProgram[0].earnedPointsForEachPurchaseUsedBook *
            quantityBooks;

    //Update all the information of client
    await updateLoyaltylyClient(
        client._id,
        newPoints,
        client.loyaltySystem.booksSold + quantityBooks,
        (client.loyaltySystem.totalMoneySold =
            Math.round(
                (client.loyaltySystem.totalMoneySold +
                    request.totalValue +
                    Number.EPSILON) *
                    100
            ) / 100)
    );

    let tmpBook;

    //Update the stock of all books purchased (used condiction only!)
    for (let i = 0; i < request.books.length; i++) {
        tmpBook = await searchBook(request.books[i].isbn);

        newStock = await getAtualStock(
            request.books[i]._id,
            request.books[i].grade
        );

        await updateStockBooks(
            request.books[i]._id,
            request.books[i].grade,
            newStock + request.books[i].quantity
        );
    }

    Purchase.findOneAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                status: "Aprovado",
                "client.pointsAfterPurchase":
                    request.client.pointsBeforePurchase +
                    fidelizationProgram[0].earnedPointsForEachPurchaseUsedBook *
                        quantityBooks,
            },
        },
        (err, purchase) => {
            if (err) {
                res.status(400).json(purchase);
            } else {
                res.status(200).json({});
            }
        }
    );
};

//get the number of sales requests group by status from the lasts 30 days
purchasesController.getRequestsSalesCount = (req, res) => {
    //Todays date
    let todaysDate = new Date();

    //start date (today minus 30)
    let minus30DaysDate = new Date(); //sets date
    minus30DaysDate.setDate(minus30DaysDate.getDate() - 30); //remove 30 days
    minus30DaysDate = minus30DaysDate.toISOString().slice(0, 10);

    //tmp date, used for loop
    let tmpDate = new Date();
    tmpDate.setDate(tmpDate.getDate() - 30); //remove 30 days

    const aggregation = Purchase.aggregate()
        .match({
            date: {
                $gte: minus30DaysDate,
                $lte: todaysDate.toISOString().slice(0, 10),
            },
            status: { $exists: true },
        })
        .group({
            _id: "$status",
            count: { $sum: 1 },
        });

    aggregation.exec((err, dbPurchase) => {
        if (err) {
            res.status(400).json();
        } else {
            res.status(200).json(dbPurchase);
        }
    });
};

module.exports = purchasesController;
