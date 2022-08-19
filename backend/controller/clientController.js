const { log } = require("console");
const { resolve } = require("path");
var Client = require("../models/clientModal");
var Purchase = require("../models/purchaseModal");
var Sale = require("../models/saleModal");

var clientController = {};

//show form to create one book
clientController.dashboard = (req, res, next) => {
    let perPage = req.query.perPage || 10; //10 per default
    let page = req.query.page || 1; //page 1 in default

    let searchType = req.query.searchType || "default";
    let searchValue = req.query.searchValue || null;

    //object for search
    let searchCustomization;

    //checks the search type
    try {
        switch (searchType) {
            case "id":
                searchCustomization = {
                    "personalInformation.clientNumber": Number(searchValue),
                };
                break;

            case "name":
                searchCustomization = {
                    "personalInformation.name": {
                        $regex: `.*${searchValue}.*`,
                        $options: "i",
                    },
                };
                break;

            case "cellPhone":
                searchCustomization = {
                    "personalInformation.cellPhone": Number(searchValue),
                };
                break;

            case "nif":
                searchCustomization = {
                    "personalInformation.nif": searchValue,
                    $regex: `.*${searchValue}.*`,
                    $options: "i",
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

    Client.find(searchCustomization).exec((err, dbClient) => {
        if (err) {
            return next(err);
        } else {
            let counter = dbClient.length;
            let totalPages = Math.ceil(counter / perPage);
            //if the page to search exceeds the max, the max is associated
            if (page > totalPages) {
                page = totalPages;
            }
            Client.find(searchCustomization)
                .skip(perPage * page - perPage) //skips the first N elements
                .limit(perPage) //limits the number of results
                .exec(async (err, dbClient) => {
                    if (err) {
                        res.redirect("/admin/clients?badSearch=true");
                        console.log("Error searching for clients in dashboard");
                        return next();
                    } else {
                        try {
                            res.render("template", {
                                loadContent: {
                                    page: "clients/clientDashboard.ejs",
                                    clients: dbClient,
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
                            return next(err);
                        }
                    }
                });
        }
    });
};

//show form to create one book
clientController.form = (req, res) => {
    res.render("template", { loadContent: { page: "clients/addClient.ejs" } });
};

//creates an client
clientController.create = (req, res, next) => {
    let client = new Client({
        personalInformation: {
            name: req.body.name,
            gender: req.body.gender,
            dob: req.body.dob,
            cellPhone: req.body.cellPhone,
            email: req.body.email,
            address: req.body.address,
            city: req.body.city,
            zip: req.body.zip,
            nif: req.body.nif,
        },
    });
    //Insert object in BD
    client.save((err) => {
        if (err) {
            console.log(err);
            console.log("Error saving client");
            return next(err);
        } else {
            res.redirect("/admin/clients");
        }
    });
};

//shows the form edit
clientController.formEdit = (req, res, next) => {
    Client.findOne({ "personalInformation.nif": req.params.nif }).exec(
        (err, dbClient) => {
            if (err) {
                console.log("Error showing form edit in clients");
                return next(err);
            } else {
                res.render("template", {
                    loadContent: {
                        page: "clients/editClient.ejs",
                        client: dbClient,
                    },
                });
            }
        }
    );
};

//edit client
clientController.edit = (req, res) => {
    //Checks if the email is valid, in other words, if its the same as before or new but unique in DB
    let checkDuplicatedEmail = new Promise((resolve, reject) => {
        Client.find(
            { "personalInformation.email": req.body.email },
            (err, client) => {
                if (
                    (client.length != 0 &&
                        client[0].personalInformation.nif == req.params.nif) ||
                    client.length == 0
                ) {
                    resolve(); //The email is valid
                } else {
                    reject(); //The email cannot be used
                }
            }
        );
    });
    checkDuplicatedEmail
        .then(() => {
            Client.findOneAndUpdate(
                { "personalInformation.nif": req.params.nif },
                {
                    $set: {
                        personalInformation: {
                            name: req.body.name,
                            gender: req.body.gender,
                            age: req.body.age,
                            dob: req.body.dob,
                            cellPhone: req.body.cellPhone,
                            email: req.body.email,
                            address: req.body.address,
                            city: req.body.city,
                            zip: req.body.zip,
                            nif: req.body.nif,
                        },
                    },
                },
                { runValidators: true },
                (err, editedClient) => {
                    if (err) {
                        res.redirect("/error");
                    } else {
                        return res.render("template", {
                            loadContent: {
                                page: "clients/viewClient.ejs",
                                client: editedClient,
                            },
                        });
                    }
                }
            );
        })
        .catch((err) => {
            Client.findOne({ "personalInformation.nif": req.params.nif }).exec(
                (err, dbClient) => {
                    if (err) {
                        res.redirect("/clients");
                    } else {
                        res.render("template", {
                            loadContent: {
                                page: "clients/editClient.ejs",
                                client: dbClient,
                                alreadyExists: true,
                            },
                        });
                    }
                }
            );
        });
};

//view one client
clientController.show = (req, res, next) => {
    Client.findOne({ "personalInformation.nif": req.params.nif }).exec(
        (err, dbClient) => {
            if (err) {
                console.log("Error reading one client");
                return next(err);
            } else {
                res.render("template", {
                    loadContent: {
                        page: "clients/viewClient.ejs",
                        client: dbClient,
                    },
                });
            }
        }
    );
};

//checks if a client have at least one sale associated
checkIfClientExitsInSales = (nifClient) => {
    return new Promise((resolve, reject) => {
        Sale.exists({ "client.nif": nifClient }).exec((err, exists) => {
            if (err) {
                reject(err);
            } else {
                if (exists) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
};

//checks if a client have at least one sale associated
checkIfClientExitsInPurchases = (nifClient) => {
    return new Promise((resolve, reject) => {
        Purchase.exists({ "client.nif": nifClient }).exec((err, exists) => {
            if (err) {
                reject(err);
            } else {
                if (exists) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
};

//delete client
clientController.delete = (req, res, next) => {
    Promise.all([
        checkIfClientExitsInPurchases(req.params.nif),
        checkIfClientExitsInSales(req.params.nif),
    ])
        .then((result) => {
            if (result[0] || result[1]) {
                res.status(400).json({
                    error: "clientHaveSaleOrPurchaseAssociated",
                });
            } else {
                Client.deleteOne({
                    "personalInformation.nif": req.params.nif,
                }).exec((err, result) => {
                    if (err) {
                        return next(err);
                    } else {
                        res.status(200).json(result.deletedCount);
                    }
                });
            }
        })
        .catch((err) => {
            next(err);
        });
};

//returns the JSON client given a NIF number
clientController.getClientByNif = (req, res) => {
    Client.findOne({ "personalInformation.nif": req.query.nif }).exec(
        (err, dbClient) => {
            if (err) {
                res.status(404).json(err);
            } else {
                res.status(200).json(dbClient);
            }
        }
    );
};

clientController.createFromBuy = (req, res) => {
    let client = new Client({
        personalInformation: {
            name: req.body.newName,
            gender: req.body.newGender,
            dob: req.body.newDob,
            cellPhone: req.body.newCellPhone,
            email: req.body.newEmail,
            address: req.body.newAddress,
            city: req.body.newCity,
            zip: req.body.newZip,
            nif: req.body.newNif,
        },
    });

    //Insert object in BD
    client.save((err) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(200).json(client);
        }
    });
};

clientController.getClientsByAge = (req, res) => {
    const aggregate = Client.aggregate([
        {
            $set: {
                age: {
                    $let: {
                        vars: {
                            birthday: {
                                $dateFromString: {
                                    dateString: "$personalInformation.dob",
                                    format: "%Y-%m-%d",
                                },
                            },
                        },
                        in: {
                            $subtract: [
                                {
                                    $subtract: [
                                        { $year: "$$NOW" },
                                        { $year: "$$birthday" },
                                    ],
                                },
                                {
                                    $cond: [
                                        {
                                            $lt: [
                                                { $dayOfYear: "$$birthday" },
                                                { $dayOfYear: "$$NOW" },
                                            ],
                                        },
                                        0,
                                        1,
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
        },
        { $project: { age: 1 } },
        {
            $project: {
                range: {
                    $concat: [
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$age", 0] },
                                        { $lte: ["$age", 14] },
                                    ],
                                },
                                "0-14",
                                "",
                            ],
                        },
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: ["$age", 14] },
                                        { $lte: ["$age", 23] },
                                    ],
                                },
                                "14-23",
                                "",
                            ],
                        },
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: ["$age", 23] },
                                        { $lte: ["$age", 50] },
                                    ],
                                },
                                "23-50",
                                "",
                            ],
                        },
                        { $cond: [{ $gt: ["$age", 50] }, "Acima de 50", ""] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: "$range",
                count: {
                    $sum: 1,
                },
            },
        },
    ]);

    aggregate.exec((err, result) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(200).json(result);
        }
    });
};

//request to get the quantity of registrations in last 6 months
clientController.getClientsRegistrationsLast6MonthsInclusive = (req, res) => {
    let response = {};

    //Todays month
    let todayDate = new Date();

    //start month (today minus 5, because actual month counts)
    let minus6monthsDate = new Date(); //sets date
    minus6monthsDate.setDate(1); //sets the first day of the month
    minus6monthsDate.setMonth(minus6monthsDate.getMonth() - 5); //remove 5 months

    //tmp date, used for loop
    let tmpDate = new Date();
    tmpDate.setDate(1);
    tmpDate.setMonth(tmpDate.getMonth() - 5); //remove 5 months

    //create the json response. Goes from the start date until today
    while (tmpDate < todayDate) {
        let tmpDateString = tmpDate.toISOString().slice(0, 7); //gets only the yyyy-mm
        response[tmpDateString] = 0;
        tmpDate.setMonth(tmpDate.getMonth() + 1); //adds one month
    }
    response[todayDate.toISOString().slice(0, 7)] = 0; //adds the actual month

    //Searches for the sales between the dates
    Client.aggregate()
        .match({
            "loyaltySystem.creationMemberDate": {
                $lte: todayDate.toISOString().slice(0, 10),
                $gte: minus6monthsDate.toISOString().slice(0, 10),
            },
        })
        .addFields({ actualDate: { $toDate: "$date" } })
        .project({
            registrationDate: {
                $substr: ["$loyaltySystem.creationMemberDate", 0, 7],
            },
            _id: 0,
        })
        .group({ _id: "$registrationDate", count: { $sum: 1 } })
        .project({ _id: 0, month: "$_id", count: 1 })
        .exec((err, dbSales) => {
            if (err) {
                res.status(400).json(response);
            } else {
                //for each sale will sum the counter of books
                dbSales.forEach((elem) => {
                    response[elem.month] += elem.count;
                });
                res.status(200).json(response);
            }
        });
};

//return the number of clients grouped by gender
clientController.getClientsByGender = (req, res) => {
    let genders = { Masculino: 0, Feminino: 0, Outros: 0 };

    Client.aggregate()
        .group({
            _id: "$personalInformation.gender",
            count: { $sum: 1 },
        })
        .project({ _id: 0, gender: "$_id", count: 1 })
        .exec((err, result) => {
            if (err) {
                res.status(400).json(genders);
            } else {
                let response = {};
                result.forEach((gender) => {
                    genders[gender.gender] = gender.count;
                });
                res.status(200).json(genders);
            }
        });
};

module.exports = clientController;
