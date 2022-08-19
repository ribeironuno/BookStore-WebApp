var express = require("express");
var router = express.Router();
var pointsController = require("../controller/pointsController");
var authController = require("../controller/authController");

//GET the dasboard with the fidelization program of store if already is one defined
router.get("/", authController.verifyTokenManager, pointsController.dashboard);

//GET the form to add a fidelization program
router.get("/add", authController.verifyTokenManager, pointsController.add);

//GET the form to edit the atual fidelization program
router.get(
    "/edit",
    authController.verifyTokenManager,
    pointsController.formEdit
);

//POST edit the fidelization program
router.post(
    "/editPoints",
    authController.verifyTokenManager,
    pointsController.edit
);

//GET delete the atual fidelization program
router.get(
    "/delete/:id",
    authController.verifyTokenManager,
    pointsController.delete
);

//GET the discount for each 100 points
router.get(
    "/getDiscountForEach100Points",
    pointsController.getDiscountForEach100Points
);

//GET the discount for each 100 points
router.get("/getShippingCost", pointsController.getShippingCost);

//GET the loyalty program
router.get("/getLoyaltyProgram", pointsController.getLoyaltyProgram);

module.exports = router;
