var mongoose = require("mongoose");
var Points = require("../models/pointsModal");
var validator = require("../models/validator");

//Get the fidelization program of the store
function getPoints() {
    return new Promise((resolve, reject) => {
        Points.find({}, (err, fidelizationProgram) => {
            if (err) {
                reject();
            } else {
                resolve(fidelizationProgram);
            }
        });
    });
}

const ClientSchema = new mongoose.Schema(
    {
        personalInformation: {
            idClient: Number,

            name: {
                type: String,
                validate: {
                    validator: validator.isName,
                    message: "Name must only contains letters",
                },
                minlength: 1,
                maxlength: 60,
                required: [true, "Name of client is required"],
            },

            gender: {
                type: String,
                enum: {
                    values: ["Masculino", "Feminino", "Outro"],
                    message: "Gender must be : Feminino or Masculino or Outro",
                },
                required: [true, "Gender of client is required"],
            },

            dob: {
                type: String,
                validate: {
                    validator: validator.isDOBChild,
                    message: `Year must be : yyyy-mm-dd. Min date: 1900-01-01. Max date: ${new Date()} `,
                },
                required: [true, "Birth date of client is required"],
            },

            cellPhone: {
                type: Number,
                validate: {
                    validator: validator.isCellPhone,
                    message: "Phone Number should be Portuguese",
                },
                required: [true, "Cell phone of client is required"],
            },

            email: {
                type: String,
                unique: true,
                validate: {
                    validator: validator.isEmail,
                    message: "Email should be valid",
                },
                required: [true, "Email of client is required"],
            },

            password: {
                type: String,
                minlength: 5,
            },

            address: {
                type: String,
                minlength: 1,
                maxlength: 30,
                required: [true, "Address of client is required"],
            },

            city: {
                type: String,
                minlength: 1,
                maxlength: 30,
                required: [true, "City of client is required"],
            },

            zip: {
                type: String,
                validate: {
                    validator: validator.isZipCode,
                    message: "Zip code should correspond to a Portugal country",
                },
                required: [true, "Zip code of client is required"],
            },

            nif: {
                type: String,
                unique: true,
                validate: {
                    validator: validator.isNIF,
                    message: "NIF should have 9 digits",
                },
                required: [true, "NIF of client is required"],
            },
        },
        loyaltySystem: {
            creationMemberDate: {
                type: String,
                default: new Date().toISOString().slice(0, 10),
            },
            booksSold: {
                type: Number,
                default: 0,
            },
            booksPurchased: {
                type: Number,
                default: 0,
            },
            totalMoneySold: {
                type: Number,
                default: 0,
            },
            totalMoneyPurchased: {
                type: Number,
                default: 0,
            },
            atualPoints: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        versionKey: false,
    }
);

//Update the atual points of client based on the business needs
ClientSchema.pre("save", async function (next) {
    try {
        let year = this.personalInformation.dob.slice(0, 4);
        let month = this.personalInformation.dob.slice(5, 7);
        let days = this.personalInformation.dob.slice(8, 10);

        let date = new Date(year + "-" + month + "-" + days);

        let today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        var m = today.getMonth() - date.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            age--;
        }

        fidelizationProgram = await getPoints();

        switch (true) {
            case age <= 14:
                this.loyaltySystem.atualPoints =
                    fidelizationProgram[0].infantilAge;
                break;
            case age > 14 && age <= 23:
                this.loyaltySystem.atualPoints =
                    fidelizationProgram[0].juvenilAge;
                break;
            case age > 23 && age <= 50:
                this.loyaltySystem.atualPoints =
                    fidelizationProgram[0].adultAge;
                break;
            case age > 50:
                this.loyaltySystem.atualPoints =
                    fidelizationProgram[0].seniorAge;
                break;
        }
    } catch {
        this.loyaltySystem.atualPoints = 0;
    }
});

module.exports = mongoose.model("Client", ClientSchema);
