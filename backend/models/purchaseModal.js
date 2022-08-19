var mongoose = require("mongoose");

var purchaseSchema = new mongoose.Schema(
    {
        purchaseId: Number,
        client: {
            _id: String,
            name: String,
            nif: Number,
            cellPhone: Number,
            email: String,
            address: String,
            city: String,
            zip: String,
            pointsBeforePurchase: Number,
            pointsAfterPurchase: Number,
        },
        books: [
            {
                _id: String,
                title: String,
                isbn: String,
                grade: String,
                quantity: Number,
                pricePerUnit: Number,
                total: Number,
            },
        ],
        totalValue: Number,
        date: {
            type: String,
            default: new Date().toISOString().slice(0, 10),
        },
        status: {
            type: String,
            enum: {
                values: ["Pendente", "Aprovado", "Recusado"],
                message: "Status must be : Pendente, Aprovado or Recusado",
            },
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("purchases", purchaseSchema);
