var express = require("express");
var router = express.Router();
var newsletterController = require("../controller/newsletterController");
var booksController = require("../controller/bookController");

//get the form to send a newsletter
router.get("/", newsletterController.create);

//send the newslleter 
router.post("/send", newsletterController.saveImage, newsletterController.send);

module.exports = router;
