var express = require("express");
const authStoreController = require("../../controller/store/authStoreController");
const purchasesStoreController = require("../../controller/store/purchasesStoreController");
const purchaseController = require("../..//controller/purchasesController");
var router = express.Router();

//POST to get the sales of a client by the valid token
router.post(
    "/getPurchasesByToken",
    authStoreController.getClientNifByToken,
    purchasesStoreController.getPurchasesByNif
);

//POST to create the request of a purchase
router.post(
    "/requestPurchase",
    (req, res, next) => {
        //create a errors object to collect errors in process
        req.errors = {};
        next();
    },
    authStoreController.verifyClientToken,
    purchaseController.clientPhase,
    purchaseController.booksPhase,
    purchasesStoreController.finalPhase
);

//POST to get the sale of a client by the valid token
router.post(
    "/generatePdfCredit",
    authStoreController.getClientNifByToken,
    purchasesStoreController.invoiceVerification,
    purchaseController.generatePdfCredit
);

//POST to create the request of a purchase
router.post(
    "/generateShippingSticker",
    authStoreController.getClientNifByToken,
    purchasesStoreController.invoiceVerification,
    purchasesStoreController.generate
);

module.exports = router;
