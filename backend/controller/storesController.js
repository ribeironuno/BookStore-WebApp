var Store = require("../models/storeModal");

var storesController = {};

//shows the dashboard of the percentages
storesController.dashboard = (req, res, next) => {
    Store.findOne({}).exec((err, store) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "stores/showStore.ejs",
                    store: store,
                },
            });
        }
    });
};

//show form for edit fidelization program
storesController.editForm = (req, res) => {
    Store.findOne({}).exec((err, store) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "stores/editStore.ejs",
                    store: store,
                },
            });
        }
    });
};

//edit fidelization program
storesController.edit = (req, res, next) => {
    console.log(req.body)
    Store.findByIdAndUpdate(
        req.params.id,
        req.body,
        { runValidators: true },
        (err, store) => {
            if (err) {
                return next(err);
            } else {
                res.redirect("/admin/stores");
            }
        }
    );
};

module.exports = storesController;
