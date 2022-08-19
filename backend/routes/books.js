var express = require("express");
var router = express.Router();
var bookController = require("../controller/bookController");
var authController = require("../controller/authController");
var newsletterController = require("../controller/newsletterController");

//GET books dashboard
router.get("/", authController.verifyToken, bookController.dashboard);

//GET books form create
router.get("/form", authController.verifyToken, bookController.formCreate);

//POST create book
router.post(
    "/create",
    (req, res, next) => {
        req.errors = {}; //creates a errors object to save the errors
        next();
    },
    authController.verifyToken,
    bookController.saveImage,
    bookController.calculatePrices,
    bookController.create,
    newsletterController.announceNewBook
);

//GET edit book
router.put(
    "/edit/:isbn",
    (req, res, next) => {
        req.errors = {}; //creates a errors object to save the errors
        next();
    },
    authController.verifyToken,
    bookController.saveImage,
    bookController.calculatePrices,
    bookController.edit
);

//GET form edit
router.get(
    "/formEdit/:id",
    authController.verifyToken,
    bookController.formEdit
);

//GET show book
router.get("/show/:isbn", authController.verifyToken, bookController.show);

//GET delete book
router.delete(
    "/delete/:isbn",
    authController.verifyToken,
    bookController.delete
);

//GET JSON book by isbn
router.get(
    "/getBookByIsbn",
    authController.verifyToken,
    bookController.getBookByIsbn
);

//GET the subjects count descending
router.get(
    "/getSubjectsCountDesc",
    authController.verifyToken,
    bookController.getSubjectsCountDesc
);

//GET the author books count descending
router.get(
    "/getBooksByAuthorDesc",
    authController.verifyToken,
    bookController.getBooksByAuthorDesc
);

//DELETE a review
router.delete(
    "/deleteReview",
    authController.verifyToken,
    bookController.deleteReview
);

module.exports = router;
