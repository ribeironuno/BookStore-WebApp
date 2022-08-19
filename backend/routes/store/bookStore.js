var express = require("express");
var router = express.Router();
var bookStoreController = require("../../controller/store/booksController");
var bookAdminController = require("../../controller/bookController");
var authStoreController = require("../../controller/store/authStoreController");

//GET the all books from DB
router.get("/getAllBooks", bookStoreController.getAllBooks);

//GET a book by the ISBN
router.get("/getBookByISBN/:isbn", bookStoreController.getBookByIsbn);

//POST registration of a client review
router.post(
    "/reviewRegistration",
    authStoreController.verifyClientToken,
    bookStoreController.reviewRegistration
);

router.get("/getBookByIsbnExtension", bookAdminController.getBookByIsbn);

module.exports = router;
