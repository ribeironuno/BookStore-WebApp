var express = require("express");
var router = express.Router();
var newsletterStoreController = require("../../controller/store/newsletterController");

//POST subscribe the newsletter service
router.post("/subscribe", newsletterStoreController.subscribe);

//POST unsubscribe a client from the newsletter service
router.delete("/unsubscribe", newsletterStoreController.unsubscribe)

module.exports = router;