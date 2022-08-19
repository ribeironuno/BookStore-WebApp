var express = require("express");
const authStoreController = require("../../controller/store/authStoreController");
var router = express.Router();
var clientStoreController = require("../../controller/store/clientStoreController");

//POST the submission of client
router.post("/create", clientStoreController.create);

//POST to complete the registration
router.post(
    "/completeRegistration",
    clientStoreController.completeRegistration
);

//POST the edition of client
router.post(
    "/edit/:nif",
    authStoreController.verifyClientToken,
    clientStoreController.edit
);

//GET to get the client by token
router.post(
    "/getClientByToken",
    authStoreController.getClientNifByToken,
    clientStoreController.getClientByNif
);

module.exports = router;
