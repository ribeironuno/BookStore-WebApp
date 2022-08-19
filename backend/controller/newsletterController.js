var mongoose = require("mongoose");
var NewsLetter = require("../models/newsletterModal");
var Book = require("../models/bookModal");
require("dotenv").config({ path: "./config.env" });
var handlebars = require("handlebars");
var hbs = require("nodemailer-express-handlebars");
var path = require("path");
var fs = require("fs");
const nodemailer = require("nodemailer");

//SMTP configurations of nodemailer
const transporter = nodemailer.createTransport({
    service: "Outlook365",
    host: "smtp.office365.com",
    port: "587",
    tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
    },
    auth: {
        user: String(process.env.EMAIL),
        pass: String(process.env.PASSWORD_EMAIL),
    },
});

var newsletterController = {};

//form to create a new newsletter
newsletterController.create = (req, res) => {
    res.render("template", {
        loadContent: {
            page: "newsletter/createNewsletter.ejs",
        },
    });
};

//get list of newsletter subscribers
function getNewsletterSubscribers() {
    let subscribersList = [];
    return new Promise((resolve, reject) => {
        NewsLetter.find({}, (err, subscribers) => {
            if (err) {
                reject();
            } else {
                for (let i = 0; i < subscribers.length; i++) {
                    subscribersList.push(subscribers[i].email);
                }
                resolve(subscribersList);
            }
        });
    });
}

//save image in the processing of creating/editing book
newsletterController.saveImage = (req, res, next) => {
    if (req.file) {
        // writes the file in disk
        fs.readFile(req.file.path, function (err, data) {
            if (err) {
                req.errors.errorWritingImageInDisk = true;
                return next();
            } else {
                fs.writeFile(req.file.path, data, function (err) {
                    if (err) {
                        req.errors.errorWritingImageInDisk = true;
                        return next();
                    } else {
                        return next();
                    }
                });
            }
        });
    } else {
        next();
    }
};

//get the newest two books
getLatestTwoBook = () => {
    return new Promise((resolve, reject) => {
        //TODO .sort({ bookId: "descending" })
        Book.find({})
            .sort({ bookId: "descending" })
            .limit(2)
            .exec(function (err, books) {
                if (err) {
                    reject();
                } else {
                    books.length >= 2 ? resolve(books) : reject();
                }
            });
    });
};

//send a newsletter announcing a new book
newsletterController.announceNewBook = async (req, res) => {
    const subs = await getNewsletterSubscribers();

    Promise.resolve(getLatestTwoBook())
        .then((books) => {
            var options = {
                viewEngine: {
                    extname: ".handlebars",
                    layoutsDir: "newsletterTemplates",
                    defaultLayout: "email2LatestBooks",
                },
                viewPath: "newsletterTemplates",
            };

            let splitedurlBook1 = books[0].imageBook.staticUrl.split("/")[2];
            let splitedurlBook2 = books[1].imageBook.staticUrl.split("/")[2];

            transporter.use("compile", hbs(options));

            transporter.sendMail(
                {
                    from: `Livraria ESTG <${process.env.EMAIL}>`,
                    bcc: subs,
                    subject: "Agora disponível: " + req.body.title,
                    template: "email2LatestBooks",
                    context: {
                        bookName: req.body.title,
                        authorName: req.body.authorName,
                        imageBook: "cid:" + req.file.filename,
                        price: req.prices.toSale.bad,
                        nameBook1: books[0].title,
                        imageBook1: "cid:" + splitedurlBook1,
                        author1: books[0].author.name,
                        priceBook1: books[0].infoToSale.price.bad,
                        nameBook2: books[1].title,
                        imageBook2: "cid:" + splitedurlBook2,
                        author2: books[1].author.name,
                        priceBook2: books[1].infoToSale.price.bad,
                        logo: "cid:bookLogo-tranparent.png",
                    },
                    attachments: [
                        {
                            filename: req.file.filename,
                            path: req.file.path,
                            cid: req.file.filename,
                        },
                        {
                            filename: "bookLogo-tranparent.png",
                            path: "public/images/bookLogo-tranparent.png",
                            cid: "bookLogo-tranparent.png",
                        },
                        {
                            filename: splitedurlBook1,
                            path: "public/" + books[0].imageBook.staticUrl,
                            cid: splitedurlBook1,
                        },
                        {
                            filename: splitedurlBook2,
                            path: "public/" + books[1].imageBook.staticUrl,
                            cid: splitedurlBook2,
                        },
                    ],
                },
                function (err, results) {
                    if (err) {
                        console.log(err);
                        res.status(400).json();
                    } else {
                        res.status(200).json(req.createdBook);
                    }
                }
            );
        })
        .catch((err) => {
            var options = {
                viewEngine: {
                    extname: ".handlebars",
                    layoutsDir: "newsletterTemplates",
                    defaultLayout: "emailWithoutLatestBooks",
                },
                viewPath: "newsletterTemplates",
            };

            transporter.use("compile", hbs(options));

            transporter.sendMail(
                {
                    from: `Livraria ESTG <${process.env.EMAIL}>`,
                    bcc: subs,
                    subject: "Agora disponível: " + req.body.title,
                    template: "emailWithoutLatestBooks",
                    context: {
                        bookName: req.body.title,
                        authorName: req.body.authorName,
                        imageBook: "cid:" + req.file.filename,
                        price: req.prices.toSale.bad,
                        logo: "cid:bookLogo-tranparent.png",
                    },
                    attachments: [
                        {
                            filename: req.file.filename,
                            path: req.file.path,
                            cid: req.file.filename,
                        },
                        {
                            filename: "bookLogo-tranparent.png",
                            path: "public/images/bookLogo-tranparent.png",
                            cid: "bookLogo-tranparent.png",
                        },
                    ],
                },
                function (err, results) {
                    if (err) {
                        res.status(400).json();
                    } else {
                        res.status(200).json(req.createdBook);
                    }
                }
            );
        });
};

//send the newsletter created
newsletterController.send = async (req, res) => {
    const subs = await getNewsletterSubscribers();

    if (req.file) {
        const mailSent = await transporter.sendMail(
            {
                text: req.body.message,
                subject: req.body.subject,
                from: `Livraria ESTG <${process.env.EMAIL}>`,
                bcc: subs,
                attachments: {
                    filename: req.file.path
                        .replace("public\\", "")
                        .split("/")[3],
                    path: req.file.path.replace("public\\", ""),
                    cid: req.file.path.replace("public\\", "").split("/")[3],
                },
            },
            function (error, info) {
                if (error) {
                    return res.status(400).json({});
                } else {
                    return res.status(200).json({});
                }
            }
        );
    } else {
        const mailSent = await transporter.sendMail(
            {
                text: req.body.message,
                subject: req.body.subject,
                from: `Livraria ESTG <${process.env.EMAIL}>`,
                bcc: subs,
            },
            function (error, info) {
                if (error) {
                    return res.status(400).json({});
                } else {
                    return res.status(200).json({});
                }
            }
        );
    }
};

module.exports = newsletterController;
