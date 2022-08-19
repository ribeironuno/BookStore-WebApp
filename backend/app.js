var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var multer = require("multer");
var cors = require("cors");
var cron = require("node-cron");
var bodyParser = require("body-parser");
var fs = require("fs");
var authController = require("./controller/authController");
var swaggerUi = require('swagger-ui-express')
var swaggerDocument = require('./swagger/swagger.json')

//multer storage options
const imageFilter = (req, file, cb) => {
    //reject a file that does not is .png or .jpeg
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/books/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const imageUpload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, //Accepts imgs until 5 MB
    },
    fileFilter: imageFilter,
});

//loads file with sensitive information
require("dotenv").config({ path: "./config.env" });

//define routes
var indexRouter = require("./routes/index");
var adminRouter = require("./routes/auth");
var booksRouter = require("./routes/books");
var employeeRouter = require("./routes/employee");
var clientRouter = require("./routes/client");
var pointsRouter = require("./routes/points");
var couponsRouter = require("./routes/coupons");
var percentagesRouter = require("./routes/gradePercentages");
var salesAndPurchases = require("./routes/salesAndPurchases");
var newsletterRouter = require("./routes/newsletter");
var storesRouter = require("./routes/stores");

//frontoffice routes
var authStore = require("./routes/store/authStore");
var clientStoreRouter = require("./routes/store/clientStore");
var purchasesStoreRouter = require("./routes/store/purchasesStore");
var salesStoreRouter = require("./routes/store/salesStore");
var booksStoreRouter = require("./routes/store/bookStore");
var newsletterStoreRouter = require("./routes/store/newsletterStore");
var storeStoreRouter = require("./routes/store/storeStore");

//Mongo BD connection
const urlMongo = `mongodb+srv://${process.env.USERNAME_DB}:${process.env.PASSWORD_DB}@clusterpaw.1w3ge.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(urlMongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to BD");
    })
    .catch(() => {
        console.log("Failed connecting BD ");
    });

//starts the application
var app = express();

//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(cors()); //middleware to accept all request source
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/docs", express.static(path.join(__dirname, "docs")));
app.use("/styleInvoice", express.static(path.join(__dirname, "styleInvoice")));
app.use("/styleShipping", express.static(path.join(__dirname, "styleShipping")));
cron.schedule("0 5 * * Sun", () => {
    //At 5:00 every Sunday
    // cron.schedule("*/1 * * * *", () => { //every minute for test purposes
    console.log("executing schedule task");
    //faturas
    fs.readdir(__dirname + "/docs/faturas", (err, files) => {
        if (!err) {
            for (const file of files) {
                fs.unlink(
                    path.join(__dirname + "/docs/faturas", file),
                    (err) => {
                        if (err) {
                            console.log("error deleting faturas");
                        }
                    }
                );
            }
        }
    });
    //notas de credito
    fs.readdir(__dirname + "/docs/notasDeCredito", (err, files) => {
        if (!err) {
            for (const file of files) {
                fs.unlink(
                    path.join(__dirname + "/docs/notasDeCredito", file),
                    (err) => {
                        if (err) {
                            console.log("error deleting notas de credito");
                        }
                    }
                );
            }
        }
    });
});
//routes
app.use("/", indexRouter);
app.use("/admin/books", authController.verifyToken, imageUpload.single("imageBook"), booksRouter);
app.use("/admin/employee", authController.verifyTokenManager, employeeRouter);
app.use("/admin/clients", authController.verifyToken, clientRouter);
app.use("/admin/points", pointsRouter);
app.use(
    "/admin/salesAndPurchases",
    authController.verifyToken,
    salesAndPurchases
);
app.use(
    "/admin/gradePercentages",
    authController.verifyToken,
    percentagesRouter
);
app.use("/admin/coupons", authController.verifyToken, couponsRouter);
app.use("/admin/stores", authController.verifyTokenManager, storesRouter);
app.use("/admin/newsletter", imageUpload.single("imageBook"), newsletterRouter);
app.use("/admin", adminRouter);

//front end routes
app.use("/store/auth", authStore);
app.use("/store/client", clientStoreRouter);
app.use("/store/purchases", purchasesStoreRouter);
app.use("/store/sales", salesStoreRouter);
app.use("/store/books", booksStoreRouter);
app.use("/store/newsletter", newsletterStoreRouter);
app.use("/store/store", storeStoreRouter);
//Swagger documentation of API Store
app.use("/store/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(res.render("404"));
});

//error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("500");
});

module.exports = app;
