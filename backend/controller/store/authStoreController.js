var Client = require("../../models/clientModal");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config.env" });

var authStoreController = {};

//login a user and return the token
authStoreController.login = function (req, res) {
    if (!req.body.email || !req.body.password) {
        return req.status(400).json({});
    }
    Client.findOne(
        { "personalInformation.email": req.body.email },
        function (err, user) {
            if (err || !user) {
                return res.status(500).json({});
            }

            if (!user.personalInformation.password) {
                return res.status(400).json({});
            }

            // check if the password is valid
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.personalInformation.password
            );

            if (!passwordIsValid) {
                return res.status(500).json({});
            }

            // if user is found and password is valid
            // create a token
            var token = jwt.sign(
                { nif: user.personalInformation.nif },
                process.env.SECRET,
                {
                    expiresIn: 3600 * 4, // expires in 4 hours
                }
            );
            return res
                .status(200)
                .json({ token: token, name: user.personalInformation.name });
        }
    );
};

authStoreController.logout = (req, res) => {};

//By the token search for the client and associates to a request var (req.nif)
authStoreController.getClientNifByToken = (req, res, next) => {
    if (!req.body.token) {
        return res.status(400).json({ error: "No token received" });
    }

    // verifies secret and checks exp
    jwt.verify(req.body.token, process.env.SECRET, function (err, decoded) {
        if (err) {
            return res
                .status(400)
                .json({ error: "Error decoding 01 - Probably expired" });
        }
        // if everything is good, save to request for use in other routes
        let nif = decoded.nif;

        if (!nif) {
            return res.status(400).json({ error: "Error decoding 02" });
        }

        req.nif = nif;
        next();
    });
};

//By the token search for the client and associates to a request var (req.nif)
authStoreController.verifyClientToken = (req, res, next) => {
    if (!req.headers["x-access-token"]) {
        return res.status(400).json({ error: "No token received" });
    }
    // verifies secret and checks exp
    jwt.verify(
        req.headers["x-access-token"],
        process.env.SECRET,
        function (err, decoded) {
            if (err) {
                return res
                    .status(400)
                    .json({ error: "Error decoding 01 - Probably expired" });
            }
            // if everything is good, save to request for use in other routes
            let nif = decoded.nif;

            if (!nif) {
                return res.status(400).json({ error: "Error decoding 02" });
            }

            req.nif = nif;
            next();
        }
    );
};

module.exports = authStoreController;
