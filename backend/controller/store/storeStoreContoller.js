var Store = require("../../models/storeModal");

var storeStoreController = {};

//get details of the store
storeStoreController.getStoreInfo = (req, res) => {
    Store.findOne({}).exec((err, store) => {
        if (err) {
            return res.status(400).json({error: 1});
        } else {
            return res.status(200).json(store);
        }
    });
}

module.exports = storeStoreController;