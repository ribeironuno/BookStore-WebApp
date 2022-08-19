var Points = require("../models/pointsModal");

var pointsController = {};

//check if there is one fidelization program
getFidelizationProgram = () => {
    return new Promise((resolve, reject) => {
        Points.findOne({}).exec((err, fidelizationProgram) => {
            if (err) {
                reject();
            } else {
                resolve(fidelizationProgram);
            }
        });
    });
};

//Show the fidelization program if there is one defined
pointsController.dashboard = async (req, res) => {
    let fidelizationProgram = await getFidelizationProgram();

    if (fidelizationProgram.isInUse) {
        res.render("template", {
            loadContent: {
                page: "points/pointsDashboard.ejs",
                points: fidelizationProgram,
            },
        });
    } else {
        res.render("template", {
            loadContent: {
                page: "points/pointsDashboard.ejs",
                doesntExist: true,
            },
        });
    }
};

//show form of add fidelization program
pointsController.add = (req, res) => {
    res.render("template", {
        loadContent: {
            page: "points/add.ejs",
        },
    });
};

//show form for edit fidelization program
pointsController.formEdit = (req, res) => {
    Points.findOne({}).exec((err, pointsInformation) => {
        res.render("template", {
            loadContent: {
                page: "points/edit.ejs",
                points: pointsInformation,
            },
        });
    });
};

//edit fidelization program
pointsController.edit = async (req, res, next) => {
    let fidelizationProgram = await getFidelizationProgram();

    Points.findOneAndUpdate(
        { _id: fidelizationProgram._id },
        {
            $set: {
                earnedPointsForEachEuro: req.body.earnedPointsForEachEuro,
                freeShipPoints: req.body.freeShipPoints,
                discountForEach100Points: req.body.discountForEach100Points,
                earnedPointsForEachPurchaseUsedBook: req.body.earnedPointsForEachPurchaseUsedBook,
                infantilAge: req.body.infantilAge,
                juvenilAge: req.body.juvenilAge,
                adultAge: req.body.adultAge,
                seniorAge: req.body.seniorAge,
                shipCost: req.body.shipCost,
                isInUse: true,
            },
        },
        { runValidators: true },
        (err, points) => {
            if (err) {
                return next(err);
            } else {
                res.redirect("/admin/points");
            }
        }
    );
};

//delete atual fidelization program
pointsController.delete = (req, res, next) => {
    Points.findOneAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                earnedPointsForEachEuro: 0,
                freeShipPoints: 0,
                discountForEach100Points: 0,
                earnedPointsForEachPurchaseUsedBook: 0,
                infantilAge: 0,
                juvenilAge: 0,
                adultAge: 0,
                seniorAge: 0,
                shipCost: 0,
                isInUse: false,
            },
        },
        { runValidators: true },
        (err, points) => {
            if (err) {
                return next(err);
            } else {
                res.redirect("/admin/points");
            }
        }
    );
};

//get the discount for each points to process the a sale
pointsController.getDiscountForEach100Points = (req, res) => {
    Points.find({}).exec((err, pointsInformation) => {
        if (err) {
            res.status(400).json({ error: "db searching error" });
        } else {
            res.status(200).json({
                points: pointsInformation[0].discountForEach100Points,
            });
        }
    });
};

//get the discount for each points to process the a sale
pointsController.getShippingCost = (req, res) => {
    Points.find({}).exec((err, pointsInformation) => {
        if (err) {
            res.status(400).json({ error: "db searching error" });
        } else {
            res.status(200).json({
                shippingCost: pointsInformation[0].shipCost,
            });
        }
    });
};

//get the discount for each points to process the a sale
pointsController.getLoyaltyProgram = (req, res) => {
    Points.find({}).exec((err, pointsInformation) => {
        if (err) {
            res.status(400).json({ error: "db searching error" });
        } else {
            res.status(200).json(pointsInformation[0]);
        }
    });
};

module.exports = pointsController;
