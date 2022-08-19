var Purchase = require("../../models/purchaseModal");
var Store = require("../../models/storeModal");
var Client = require("../../models/clientModal");
var fs = require("fs");
var pdf = require("pdf-creator-node");
var path = require("path");

var jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config.env" });

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

var purchasesStoreController = {};

//returns the purchases with the nif
purchasesStoreController.getPurchasesByNif = (req, res) => {
    console.log(req.nif);
    //searchs only for sales that are payed or made in store
    Purchase.find({
        "client.nif": req.nif,
    }).exec((err, data) => {
        if (err) {
            return res.status(500).json({ error: 1 });
        }
        return res.status(200).json(data);
    });
};

//Verify if the client is seeing one document that belongs to him
purchasesStoreController.invoiceVerification = (req, res, next) => {
    if (!req.nif) {
        return res.status(400).json({ error: "Token invalid" });
    }

    if (!req.body.docId) {
        return res.status(400).json({ error: "Document id missing" });
    }

    Purchase.findOne({ purchaseId: req.body.docId }).exec((err, data) => {
        if (err || data == null) {
            return res.status(500).json({ error: "Problem searching in bd" });
        }
        if (data.client.nif != req.nif) {
            return res.status(400).json({
                error: "Document not belongs to the client",
            });
        } else {
            req.params.id = data._id;
        }
        next();
    });
};

//get information of the store
function getStoreInformation() {
    return new Promise((resolve, reject) => {
        Store.findOne({}).exec((err, store) => {
            if (err) {
                reject();
            } else {
                resolve(store);
            }
        });
    });
}

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

//By the token search for the client and associates to a request var (req.nif)
purchasesStoreController.getClientNifByToken = async (req, res, next) => {
    if (!req.body.token) {
        req.errors = {};
        req.errors.ClientNotFound = true;
        return res.status(400).json(req.errors);
    } else {
        // verifies secret and checks exp
        jwt.verify(req.body.token, process.env.SECRET, function (err, decoded) {
            if (err) {
                //If there was problems in client adds a error
                req.errors = {};
                req.errors.ClientNotFound = true;
                return res.status(400).json(req.errors);
            } else {
                let nif = decoded.nif;

                if (!nif) {
                    req.errors = {};
                    req.errors.ClientNotFound = true;
                    return res.status(400).json(req.errors);
                }
            }
        });
    }
    // if everything is good, save to request for use in other routes
    req.nif = nif;
    req.client = await searchClient(req.body.client.nif);
    next();
};

//Verify if the client is seeing one document that belongs to him
purchasesStoreController.generate = async (req, res) => {
    let store = await getStoreInformation();

    Purchase.findOne({ _id: req.params.id })
        .lean()
        .exec(async (err, purchase) => {
            let cb = (err, html) => {
                if (err) {
                    return res.status(400).json({ error: 1 });
                }

                const filename = "shipping" + req.params.id + ".pdf";

                const document = {
                    html: html,
                    data: {
                        host: req.get("host"),
                        client: purchase.client,
                        storeAddress: store.address,
                        storeZip: store.zipCode,
                        storeCity: store.city,
                        storeContact: store.cellPhone,
                        date: purchase.date,
                        documentId: purchase.purchaseId,
                    },
                    path: "./docs/shipping/" + filename,
                };

                pdf.create(document, options)
                    .then((result) => {
                        const filepath = "/docs/shipping/" + filename;
                        res.status(200).send(filepath);
                    })
                    .catch((error) => {
                        return res.status(400).json({ error: 1 });
                    });
            };

            if (err) {
                return res.status(400).json({ error: 1 });
            } else {
                fs.readFile(
                    path.join(
                        __dirname,
                        "../../styleShipping/shippingTemplate.html"
                    ),
                    "utf-8",
                    (err, data) => {
                        cb(err, data);
                    }
                );
            }
        });
};

purchasesStoreController.finalPhase = (req, res, next) => {
    if (req.errors.length > 0) {
        return res.status(400).json(errors);
    }

    purchase = new Purchase({
        client: {
            _id: req.client._id,
            name: req.client.personalInformation.name,
            nif: req.client.personalInformation.nif,
            cellPhone: req.client.personalInformation.cellPhone,
            email: req.client.personalInformation.email,
            address: req.client.personalInformation.address,
            city: req.client.personalInformation.city,
            zip: req.client.personalInformation.zip,
            pointsBeforePurchase: req.client.loyaltySystem.atualPoints,
            pointsAfterPurchase: 0,
        },
        books: req.books,
        totalValue: req.totalValue,
        status: "Pendente",
    });

    purchase.save((err, purchase) => {
        if (err) {
            errors.ErrorWritingInBD = true;
            res.status(400).json(errors);
        } else {
            res.status(200).json(purchase);
        }
    });
};

module.exports = purchasesStoreController;
