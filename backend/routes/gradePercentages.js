var express = require("express");
var router = express.Router();
var percentagesController = require("../controller/percentagesController");

//GET dashboard of percentages
router.get("/", percentagesController.dashboard);

//GET get book grade percentages
router.get("/getPercentages", percentagesController.getPercentages);

module.exports = router;
