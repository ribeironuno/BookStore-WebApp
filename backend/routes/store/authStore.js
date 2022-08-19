var express = require("express");
var router = express.Router();
var authStoreController = require("../../controller/store/authStoreController");

//POST try to make login with the email and password
router.post("/login", authStoreController.login);

//GET logout the user
router.get("/logout", authStoreController.logout);

module.exports = router;
