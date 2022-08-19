var express = require("express");
const storeStoreController = require("../../controller/store/storeStoreContoller")
var router = express.Router();

//GET details of the store 
router.get("/getStore", storeStoreController.getStoreInfo);

module.exports = router;