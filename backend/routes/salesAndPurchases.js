var express = require("express");
var router = express.Router();
var salesController = require("../controller/salesController");
var purchaseController = require("../controller/purchasesController");

/* SALES NEW AND USED BOOKS FROM BOOKSTORE TO CLIENT */

//GET the index of sales and purchases mode dashboard
router.get("/", (req, res) => {
    res.render("template", {
        loadContent: {
            page: "salesAndPurchases/index.ejs",
        },
    });
});

//GET the page of registering a buy from a client
router.get("/saleForm", salesController.saleForm);

//POST request to make a registration of a sale
router.post(
    "/createSale",
    (req, res, next) => {
        //create a errors object to collect errors in process
        req.errors = {};
        next();
    },
    salesController.clientPhase,
    salesController.booksPhase,
    salesController.pointsPhase,
    salesController.decisionPhase
);

//GET shows the information about a sale registered in backOffice
router.get("/showSale/:id", salesController.showSale);

//GET shows the information about a sale registered in backOffice
router.get("/getSale/:id", salesController.getSale);

//GET generate the invoice pdf document of a sale
router.get("/generateInvoicePdf/:id", salesController.generateInvoicePdf);

//GET renders the sales dashboard
router.get("/salesDashboard", salesController.showDashboard);

//GET renders the sales dashboard with filter by isbn
router.get("/salesDashboard/:nif", salesController.showDashboard);

//GET earnings day by day from the last 30 days
router.get(
    "/getEarningsByDaysLast30Days",
    salesController.getEarningsByDaysLast30Days
);

//GET number of books sold by month in the last 6 months
router.get(
    "/getNumberBooksSoldByMonthLast6MonthsInclusive",
    salesController.getNumberBooksSoldByMonthLast6MonthsInclusive
);

//GET earnings and count of purchases of last 30 days
router.get("/getEarningLast30Days", salesController.getEarningsLast30Days);

router.get(
    "/getEarningsPurchasesAndSalesLast3Months",
    salesController.getEarningsPurchasesAndSalesLast3Months
);

/* PURCHASES USED BOOKS FROM CLIENT TO BOOKSTORE  */

//GET the page of registering a buy from a client
router.get("/dashboardPurchases", purchaseController.dashboardPurchases);

//GET purchase form
router.get("/purchaseForm", purchaseController.clientSellForm);

//POST create a purchase
router.post(
    "/createPurchase",
    (req, res, next) => {
        //create a errors object to collect errors in process
        req.errors = {};
        next();
    },
    purchaseController.clientPhase,
    purchaseController.booksPhase,
    purchaseController.finalPhase
);

//GET show details of a existent purchase
router.get("/showPurchase/:id", purchaseController.show);

//GET total value of purchases of the last 30 days
router.get(
    "/getPurchasedsByDaysLast30Days",
    purchaseController.getPurchasesByDaysLast30Days
);

//GET number of books purchased by month in the last 6 months
router.get(
    "/getNumberBooksPurchasedByMonthLast6MonthsInclusive",
    purchaseController.getNumberBooksPurchasedByMonthLast6MonthsInclusive
);

//GET earnings and count of purchases of last 30 days
router.get(
    "/getTotalPurchasedLast30Days",
    purchaseController.getTotalPurchasedLast30Days
);

//GET generate the credit pdf document of a purchase
router.get("/generatePdfCredit/:id", purchaseController.generatePdfCredit);

//GET the list of sales requests from the frontoffice application
router.get("/salesRequestList", purchaseController.salesRequestList);

//GET the details of a request purchae
router.get("/showRequest/:id", purchaseController.showRequest);

//POST deny a request purchase
router.post("/denyRequest/:id", purchaseController.denyRequest);

//POST approve a request purchase
router.post("/approveRequest/:id", purchaseController.approveRequest);

//GET the number of sales requests group by status from the lasts 30 days
router.get("/getRequestsSalesCount", purchaseController.getRequestsSalesCount);

module.exports = router;
