var express = require("express");
var router = express.Router();
var couponsController = require("../controller/couponsController");

router.get("/", couponsController.dashboard);

//Get a single coupon
router.get("/getCoupon", couponsController.getCoupon);

//GET create coupon
router.post("/create", couponsController.create);

//GET delete coupon
router.get("/delete/:code", couponsController.delete);

module.exports = router;
