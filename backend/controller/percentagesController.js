var mongoose = require("mongoose");
var Percentage = require("../models/percentageModal");

var percentagesController = {};

//shows the dashboard of the percentages
percentagesController.dashboard = (req, res, next) => {
    Percentage.find({}).exec((err, percentages) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "percentages/percentageDashboard.ejs",
                    percentages: percentages[0],
                },
            });
        }
    });
};

//return the percentages of the book grade
percentagesController.getPercentages = (req, res) => {
    Percentage.aggregate()
        .project({
            _id: 0,
            percentagesToSale: 1,
            percentagesToPurchase: 1,
        })
        .exec((err, data) => {
            if (err) {
                res.status(400).json({});
            } else {
                res.status(200).send(data[0]);
            }
        });
};

//promise that gets the book percentage
percentagesController.getPercentagesPromise = () => {
    return new Promise((resolve, reject) => {
        Percentage.aggregate()
            .project({
                _id: 0,
                percentagesToSale: 1,
                percentagesToPurchase: 1,
            })
            .exec((err, data) => {
                if (err) {
                    reject({});
                } else {
                    resolve(data[0]);
                }
            });
    });
};

module.exports = percentagesController;
