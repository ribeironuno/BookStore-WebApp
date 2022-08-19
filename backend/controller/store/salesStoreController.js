var Sale = require("../../models/saleModal");
var Store = require("../../models/storeModal");
const salesController = require("../../controller/salesController");
var Coupon = require("../../models/couponModel");
var Points = require("../../models/pointsModal");
var Client = require("../../models/clientModal");
require("dotenv").config({ path: "../config.env" });

var salesStoreController = {};

//returns the purchases of client given a NIF number
salesStoreController.getSalesByNif = (req, res) => {
    Sale.find({
        $and: [
            { "client.nif": req.nif },
            { $or: [{ status: { $exists: false } }, { status: "Pago" }] },
        ],
    }).exec((err, data) => {
        if (err) {
            return res.status(500).json({});
        }
        return res.status(200).json(data);
    });
};

salesStoreController.couponPhase = async (req, res, next) => {
    //if there is no coupon to apply just continue
    if (
        !req.body.couponCode ||
        (req.body.couponCode == "" && req.body.couponPercentage == 0)
    ) {
        return next();
    }

    let promise = () => {
        return new Promise((resolve, reject) => {
            Coupon.findOne({ code: req.body.couponCode }).exec((err, data) => {
                if (err) {
                    return reject("Error searching bd");
                } else {
                    if (data == null) {
                        return reject("Coupon not exists");
                    } else {
                        let startDate = new Date(data.initialDate);
                        let endDate = new Date(data.expireDate);
                        let today = new Date();

                        if (startDate <= today && endDate >= today) {
                            if (
                                req.body.couponPercentage !=
                                data.percentageToDiscount
                            ) {
                                return reject("Percentage of coupon not match");
                            }
                            resolve(true);
                        } else {
                            reject("Coupon expired");
                        }
                    }
                }
            });
        });
    };
    try {
        let response = await promise();

        //if was not applied points
        if (req.body.pointsToDiscount == 0) {
            let newTotal =
                req.body.totalValue -
                (req.body.couponPercentage / 100) * req.body.totalValue;
            newTotal = Number(newTotal.toFixed(2));

            //if the total value matches with the real discount
            if (newTotal == req.body.totalValueWithDiscount) {
                return next();
            } else {
                return res
                    .status(400)
                    .json({ error: "Total value not matches 1" });
            }
        } else {
            let newTotal =
                req.totalWithDiscount -
                (req.body.couponPercentage / 100) * req.totalWithDiscount;
            newTotal = Number(newTotal.toFixed(2));

            //if the total value matches with the real discount
            if (newTotal == req.body.totalValueWithDiscount) {
                return next();
            } else {
                return res
                    .status(400)
                    .json({ error: "Total value not matches 2" });
            }
        }
    } catch (err) {
        return res.status(400).json({ error: err });
    }
};

//Verify if the client is seeing one document that belongs to him
salesStoreController.invoiceVerification = (req, res, next) => {
    if (!req.nif) {
        return res.status(400).json({ error: "Token invalid" });
    }

    if (!req.body.docId) {
        return res.status(400).json({ error: "Document id missing" });
    }

    Sale.findOne({ salesId: req.body.docId }).exec((err, data) => {
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

//Create the stripe session
salesStoreController.checkoutSession = async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Pagar ",
                        },
                        unit_amount: (req.body.value * 100).toFixed(0),
                    },
                    quantity: 1,
                },
            ],
            success_url: `http://localhost:3000/store/sales/confirmSale/${req.body.idSale}`,
            cancel_url: "http://localhost:4200/confirm-checkout/",
        });
        res.json({ url: session.url });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e.message });
    }
};

//Last phase, checks if the process occurred without errors and make the response logic
salesStoreController.finalPhase = async (req, res, next) => {
    //If some error occurred. If objects error have more thant 0 entries
    if (req.errors.length > 0) {
        console.log(req.errors);
        return res.status(400).json(errors);
    }
    req.totalValue = req.totalValue.toFixed(2);

    if (!req.body.shippingType) {
        return res.status(400).json({ error: "No shipping type received" });
    } else {
        if (
            req.body.shippingType != "storeAddress" &&
            req.body.shippingType != "clientAddress" &&
            req.body.shippingType != "otherAddress"
        )
            return res.status(400).json({
                error: "Shipping types available: storeAddress,clientAddress,otherAddress",
            });
    }

    switch (req.body.shippingType) {
        case "otherAddress":
            if (
                !req.body.shippingAddress.address ||
                !req.body.shippingAddress.city ||
                !req.body.shippingAddress.zip
            ) {
                return res
                    .status(400)
                    .json({ error: "Address information incomplete" });
            }
            if (!/\d{4}-\d{3}/.test(req.body.shippingAddress.zip)) {
                return res
                    .status(400)
                    .json({ error: "Zip code malformed (XXXX-XXX)" });
            }
            req.address = req.body.shippingAddress.address;
            req.city = req.body.shippingAddress.city;
            req.zip = req.body.shippingAddress.zip;
            break;

        case "clientAddress":
            req.address = req.client.personalInformation.address;
            req.city = req.client.personalInformation.city;
            req.zip = req.client.personalInformation.zip;
            break;

        case "storeAddress":
            let promise = () => {
                return new Promise((resolve, reject) => {
                    Store.findOne({}).exec((err, store) => {
                        if (err) {
                            return res.status(400).json(err);
                        } else {
                            req.address = store.address;
                            req.city = store.city;
                            req.zip = store.zipCode;
                            resolve();
                        }
                    });
                });
            };
            await promise();
            break;
    }

    //check if client supply free shipping
    if (
        req.body.freeShipping != undefined &&
        req.body.freeShipping &&
        req.body.shippingType != "storeAddress"
    ) {
        let pointsToBeDiscounted =
            req.body.pointsToDiscount != 0
                ? req.pointsToDiscount //round to hundreds
                : 0;
        //if the clients wants to apply free shipping, checks if have sufficient points
        if (
            pointsToBeDiscounted + req.loyaltySystem.freeShipPoints <=
            req.client.loyaltySystem.atualPoints
        ) {
            req.freeShipping = true;
            req.body.shippingCost = 0;

            if (req.pointsToDiscount) {
                req.pointsToDiscount += req.loyaltySystem.freeShipPoints;
                req.body.pointsToDiscount = req.pointsToDiscount;
            } else {
                req.body.pointsToDiscount = req.pointsToDiscount =
                    req.loyaltySystem.freeShipPoints;
            }
        } else {
            return res
                .status(400)
                .json({ error: "Insufficient points to have free shipping" });
        }
    } else {
        req.freeShipping = false;
    }

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

        shippingInformation: {
            freeShipping: req.freeShipping,
            cost: req.body.shippingCost,
            ShipType: req.body.shippingType,
            address: {
                address: req.address,
                city: req.city,
                zip: req.zip,
            },
        },

        couponPercentage: req.body.couponPercentage,
        couponCode: req.body.couponPercentage,

        //for each will check if there is points trigger, if not just put 0
        pointsToDiscount:
            req.body.pointsToDiscount != 0
                ? req.pointsToDiscount //round to hundreds
                : 0,

        totalValueWithDiscount:
            req.body.pointsToDiscount != 0 || req.body.couponPercentage != 0
                ? req.body.totalValueWithDiscount
                : 0,

        discountValuePer100Points:
            req.body.pointsToDiscount != 0
                ? req.body.discountValuePer100Points
                : 0,

        status: "Aguarda Pagamento",
    });

    if (req.body.couponPercentage != 0 && req.body.couponPercentage != "") {
        sale.couponPercentage = req.body.couponPercentage;
        sale.couponCode = req.body.couponCode;
    }

    //Insert object in BD
    sale.save((err, dbSale) => {
        if (err) {
            req.errors.ErrorWritingInBD = true;
            return res.status(400).json(req.errors);
        } else {
            return res.status(200).json(dbSale._id);
        }
    });
};

//Get the fidelization program of the store
function getFidelizationProgram() {
    return new Promise((resolve, reject) => {
        Points.findOne({}, (err, fidelizationProgram) => {
            if (err) {
                reject();
            } else {
                resolve(fidelizationProgram);
            }
        });
    });
}

//Get the fidelization program of the store
function findSale(id) {
    return new Promise((resolve, reject) => {
        Sale.findOne({ _id: id }, (err, request) => {
            if (err) {
                reject();
            } else {
                resolve(request);
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

//Last phase, checks if the process occurred without errors and make the response logic
salesStoreController.confirmSale = async (req, res) => {
    let totalBooks = 0;

    //GET the sale that should be confirmed
    let sale = await findSale(req.params.id);

    //GET fidelization program to calculate the points that client gonna be earn
    let fidelizationProgram = await getFidelizationProgram();

    //GET the client associated with the sale
    let client = await searchClient(sale.client.nif);

    //counts the total of books sold
    for (let i = 0; i < sale.books.length; i++) {
        totalBooks +=
            sale.books[i].quantity.new +
            sale.books[i].quantity.excellent +
            sale.books[i].quantity.good +
            sale.books[i].quantity.medium +
            sale.books[i].quantity.bad;
    }

    //Update all the information of client, if its need
    try {
        if (
            (sale.totalValueWithDiscount != 0 && sale.pointsToDiscount != 0) ||
            (sale.couponPercentage && sale.couponPercentage > 0)
        ) {
            sale.totalValue = sale.totalValueWithDiscount;
        }

        let gainedPoints =
            Math.trunc(sale.totalValue) *
            fidelizationProgram.earnedPointsForEachEuro;

        let lossPoints =
            sale.pointsToDiscount || sale.pointsToDiscount >= 100
                ? sale.pointsToDiscount
                : 0;

        let totalPoints =
            client.loyaltySystem.atualPoints + gainedPoints - lossPoints;

        await salesController.updateLoyaltyClient(
            client._id,
            totalPoints,
            client.loyaltySystem.booksPurchased + totalBooks,
            Number(
                (
                    client.loyaltySystem.totalMoneyPurchased + sale.totalValue
                ).toFixed(2)
            )
        );
    } catch (err) {
        console.log(err);
        return res.redirect("http://localhost:4200/error-after-payment");
    }

    try {
        //updates the stock in books
        let book;
        for (let i = 0; i < sale.books.length; i++) {
            book = sale.books[i];
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
            client._id,
            oldPoints,
            -totalBooks,
            -sale.totalValue
        );
        return res.redirect("http://localhost:4200/error-after-payment");
    }

    Sale.findOneAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                status: "Pago",
            },
        },
        (err, sale) => {
            if (err) {
                return res.redirect(
                    "http://localhost:4200/error-after-payment"
                );
            } else {
                return res.redirect("http://localhost:4200/after-payment");
            }
        }
    );
};

module.exports = salesStoreController;
