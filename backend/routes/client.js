var express = require("express");
var router = express.Router();
var clientController = require("../controller/clientController");

//GET books dashboard
router.get("/", clientController.dashboard);

//GET the form
router.get("/form", clientController.form);

//POST the submission of client
router.post("/create", clientController.create);

//GET form edit
router.get("/formEdit/:nif", clientController.formEdit);

//GET to edit the client
router.post("/edit/:nif", clientController.edit);

//GET show client details
router.get("/show/:nif", clientController.show);

//GET to delete one client
router.delete("/delete/:nif", clientController.delete);

//GET JSON client by nif
router.get("/getClientByNif", clientController.getClientByNif);

//POST creation by form in purchases
router.post("/createFromBuy", clientController.createFromBuy);

//GET the number of registrations grouped by last 6 months
router.get(
    "/getClientsRegistrationsLast6MonthsInclusive",
    clientController.getClientsRegistrationsLast6MonthsInclusive
);

//GET number clients grouped by age
router.get("/getClientByAge", clientController.getClientsByAge);

//GET the number of clients grouped by gender
router.get("/getClientsByGender", clientController.getClientsByGender);

module.exports = router;
