var Employee = require("../models/employeeModal");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./config.env" });

var authController = {};

authController.formLogin = (req, res) => {
    res.render("login", { error: false });
};

authController.errorLogin = (req, res) => {
    res.render("login", { error: true });
};

authController.login = function (req, res) {
    let headers = req.headers.referer;

    Employee.findOne({ email: req.body.email }, function (err, user) {
        if (err || !user) {
            return res.redirect("/admin/login/error");
        }

        // check if the password is valid
        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.redirect("/admin/login/error");
        }

        // if user is found and password is valid
        // create a token
        var token = jwt.sign(
            { id: user._id, role: user.employeeType },
            process.env.SECRET,
            {
                expiresIn: 3600 * 4, // expires in 4 hours
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
        });

        res.cookie("name", user.name);

        // return the information including token as JSON
        if (!headers || headers.split("/admin")[1].includes("/login")) {
            res.redirect("/admin/salesAndPurchases");
        } else {
            res.redirect(headers);
        }
    });
};

authController.verifyToken = function (req, res, next) {
    let token = req.cookies["token"];

    if (!token) {
        //If there is no cookies could be a request from another source
        token = req.headers["x-access-token"];
    }

    if (!token) {
        return res.render("login", { error: false });
    }

    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            return res.render("login", { error: false });
        }

        // if everything is good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
};

authController.verifyTokenManager = function (req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.cookies["token"];
    if (!token) {
        token = req.headers["x-acess-token"];
    }

    if (!token) {
        return res.redirect("/admin/login");
    }

    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err || decoded.role !== "Gerente") {
            return res.render("notAuthorized", { link: req.headers.referer });
        }
        // if everything is good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
};

authController.logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/admin/login");
};

authController.index = (req, res) => {
    res.render("template", {
        loadContent: {
            page: "dashboard.ejs",
        },
    });
};

module.exports = authController;
