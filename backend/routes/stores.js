var express = require("express");
var router = express.Router();
var storesController = require("../controller/storesController");

//GET the dasboard with the fidelization program of store if already is one defined
router.get("/", storesController.dashboard);

//GET the form to edit a store
router.get("/edit", storesController.editForm);

//POST edit information of a store
router.post("/edit/:id", storesController.edit);

module.exports = router;
