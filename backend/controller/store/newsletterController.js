var NewsLetter = require("../../models/newsletterModal");

var newsletterStoreController = {};

//Add a new client to the subscriber list of newsletter
newsletterStoreController.subscribe = (req, res) => {
    let newsletterUser = new NewsLetter({
        name: req.body.name,
        email: req.body.email,
    });

    newsletterUser.save((err) => {
        if (err) {
            return res.status(400).json({ error: 1 });
        } else {
            return res.status(200).json({ sucess: 1 });
        }
    });
};

//Remove the client to the subscriber list of newsletter
newsletterStoreController.unsubscribe = (req, res) => {
    NewsLetter.deleteOne({
        email: req.body.email,
    }).exec((err, result) => {
        if (err) {
            return res.status(400).json({error: 1});
        } else {
            return res.status(200).json({sucess: 1});
        }
    });
};

module.exports = newsletterStoreController;
