var Coupon = require("../models/couponModel");

var couponsController = {};

//shows the dashboard of the percentages
couponsController.dashboard = (req, res, next) => {
    Coupon.find({}).exec((err, data) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "coupons/couponsDashboard.ejs",
                    coupons: data,
                },
            });
        }
    });
};

//Create coupons
couponsController.create = (req, res, next) => {
    let coupon = new Coupon({
        code: req.body.code,
        percentageToDiscount: req.body.percentage,
        expireDate: req.body.endDate,
        initialDate: req.body.beginDate,
    });

    //Insert object in BD
    coupon.save((err) => {
        if (err) {
            console.log(err);
            return res.status(400).redirect("/admin/coupons");
        } else {
            return res.status(200).redirect("/admin/coupons");
        }
    });
};

//returns the coupon given a code of a coupon
couponsController.getCoupon = (req, res) => {
    if (!req.query.code) {
        return res.status(400).json({ error: "No code received" });
    }
    Coupon.findOne({ code: req.query.code }).exec((err, data) => {
        if (err) {
            return res.status(400).json({ error: "Error searching bd" });
        } else {
            if (data == null) {
                return res.status(404).json({});
            } else {
                return res.status(200).json(data);
            }
        }
    });
};

//returns the coupon given a code of a coupon
couponsController.getCoupon = (req, res) => {
    if (!req.query.code) {
        return res.status(400).json({ error: "No code received" });
    }
    Coupon.findOne({ code: req.query.code }).exec((err, data) => {
        if (err) {
            return res.status(400).json({ error: "Error searching bd" });
        } else {
            if (data == null) {
                return res.status(404).json({});
            } else {
                return res.status(200).json(data);
            }
        }
    });
};

//delete one coupon
couponsController.delete = (req, res, next) => {
    Coupon.deleteOne({ code: req.params.code }).exec((err, coupon) => {
        if (err) {
            return next(err);
        } else {
            res.redirect("/admin/coupons");
        }
    });
};

module.exports = couponsController;
