var express = require("express");
const authStoreController = require("../../controller/store/authStoreController");
const salesStoreController = require("../../controller/store/salesStoreController");
const salesController = require("../../controller/salesController");
const purchaseController = require("../../controller/purchasesController");
const purchasesStoreController = require("../../controller/store/purchasesStoreController");
var router = express.Router();

//POST to get the purchases of a client by the valid token
router.post(
    "/getSalesByToken",
    authStoreController.getClientNifByToken,
    salesStoreController.getSalesByNif
);

//POST to get the purchases of a client by the valid token
router.post(
    "/getInvoicePdfPath",
    authStoreController.getClientNifByToken,
    salesStoreController.invoiceVerification,
    salesController.generateInvoicePdf
);

//POST generate session to make the payment
router.post(
    "/checkoutSession",
    authStoreController.verifyClientToken,
    salesStoreController.checkoutSession
);

router.post(
    "/createTempSale",
    authStoreController.verifyClientToken,
    (req, res, next) => {
        //create a errors object to collect errors in process
        req.errors = {};
        next();
    },
    salesController.clientPhase, 
    salesController.booksPhase,
    salesController.pointsPhase,
    salesStoreController.couponPhase,
    salesStoreController.finalPhase
);

router.get(
    "/confirmSale/:id",
    salesStoreController.confirmSale
);

module.exports = router;
