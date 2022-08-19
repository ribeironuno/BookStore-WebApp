var Client = require("../../models/clientModal");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

var clientStoreController = {};

//Hash a password
function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
}

//creates an client
clientStoreController.create = async (req, res, next) => {
    if (!req.body.password) {
        return res.status(400).json({
            success: 0,
            error: {
                code: 1,
                message: "No password received",
            },
        });
    }
    req.body.password = await hashPassword(req.body.password);

    let client = new Client({
        personalInformation: {
            name: req.body.name,
            gender: req.body.gender,
            dob: req.body.dob,
            cellPhone: req.body.cellPhone,
            email: req.body.email,
            password: req.body.password,
            address: req.body.address,
            city: req.body.city,
            zip: req.body.zip,
            nif: req.body.nif,
        },
    });

    //Insert object in BD
    client.save((err) => {
        if (err) {
            return res.status(400).json({
                success: 0,
                error: {
                    code: 2,
                    message: "Some information were wrong",
                },
            });
        } else {
            return res.status(200).json({
                success: 1,
            });
        }
    });
};

//creates an client
clientStoreController.completeRegistration = async (req, res, next) => {
    if (!req.body.password || !req.body.email) {
        return res.status(500).json({
            success: 0,
            error: {
                code: 1,
                message: "No email or no password",
            },
        });
    }
    req.body.password = await hashPassword(req.body.password);

    Client.findOne({ "personalInformation.email": req.body.email }).exec(
        (err, dbClient) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    error: {
                        code: 0,
                        message: "DB error",
                    },
                });
            } else {
                if (dbClient == null) {
                    return res.status(400).json({
                        success: 0,
                        error: {
                            code: 3,
                            message: "Email is not associated to anyone",
                        },
                    });
                }
                //if client already has a password
                if (dbClient.personalInformation.password) {
                    return res.status(500).json({
                        success: 0,
                        error: {
                            code: 2,
                            message:
                                "Client already have a password associated",
                        },
                    });
                }
                //Insert object in BD
                Client.findOneAndUpdate(
                    { "personalInformation.email": req.body.email },
                    { "personalInformation.password": req.body.password },
                    (err, data) => {
                        if (err) {
                            return res.status(500).json({
                                success: 0,
                                error: {
                                    code: 0,
                                    message: "DB error",
                                },
                            });
                        } else {
                            return res.status(200).json({
                                success: 1,
                            });
                        }
                    }
                );
            }
        }
    );
};

function getPassword(nif) {
    return new Promise((resolve, reject) => {
        Client.findOne({ "personalInformation.nif": nif }).exec(
            (err, dbClient) => {
                if (err) {
                    reject();
                } else {
                    resolve(dbClient.personalInformation.password);
                }
            }
        );
    });
}

//edit client
clientStoreController.edit = async (req, res, next) => {
    //Get hashed password before edit
    let previousPassword = await getPassword(req.nif);

    //If the password was changed then the new password should be hashed
    if (previousPassword != req.body.personalInformation.password) {
        req.body.personalInformation.password = await hashPassword(
            req.body.personalInformation.password
        );
    }

    Client.updateOne(
        { "personalInformation.nif": req.nif },
        {
            $set: {
                personalInformation: {
                    name: req.body.personalInformation.name,
                    gender: req.body.personalInformation.gender,
                    dob: req.body.personalInformation.dob,
                    cellPhone: req.body.personalInformation.cellPhone,
                    email: req.body.personalInformation.email,
                    address: req.body.personalInformation.address,
                    city: req.body.personalInformation.city,
                    zip: req.body.personalInformation.zip,
                    nif: req.body.personalInformation.nif,
                    password: req.body.personalInformation.password,
                },
            },
        },
        { runValidators: true }
    ).exec((err, editedClient) => {
        if (err) {
            res.status(400).json({
                sucess: 0,
                error: {
                    code: 1,
                    message: "Ocorred a error trying to edit the client",
                },
            });
        } else {
            res.status(200).json({
                sucess: 1,
            });
        }
    });
};

//returns the JSON client given a NIF number
clientStoreController.getClientByNif = (req, res) => {
    Client.findOne({ "personalInformation.nif": req.query.nif | req.nif }).exec(
        (err, dbClient) => {
            if (err) {
                res.status(400).json({});
            } else {
                res.status(200).json(dbClient);
            }
        }
    );
};

module.exports = clientStoreController;
