var mongoose = require("mongoose");
var validator = require("../models/validator");

var EmployeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            validate: {
                validator: validator.isName,
                message:
                    "The inserted name is not a valid. The name cannot include numbers or any special characters.",
            },
            minlength: 3,
            maxlength: 50,
            required: [true, "Name is required!"],
        },
        gender: {
            type: String,
            enum: {
                values: ["Masculino", "Feminino", "Outro"],
                message: "Gender should be 'Masculino', 'Feminino' or 'Outro'",
            },
            required: [true, "Gender is required!"],
        },
        dob: {
            type: String,
            validate: {
                validator: validator.isDOBAdult,
                message:
                    "The inserted date it's not valid. Date should be on format YYYY-MM-DD and correspond an adult age.",
            },
            required: [true, "Date of birth is required!"],
        },
        cellPhone: {
            type: Number,
            validate: {
                validator: validator.isCellPhone,
                message:
                    "Invalid phone number. The phone number should correspond to Portugal.",
            },
            required: [true, "Phone number is required!"],
        },
        email: {
            type: String,
            validate: {
                validator: validator.isEmail,
                message: "Invalid email.",
            },
            unique: true,
            required: [true, "Email is required!"],
        },
        address: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        zip: {
            type: String,
            required: false,
            validate: {
                validator: validator.isZipCode,
                message:
                    "Invalid zip code. The Zip code should correspond a Portuguese country and be on format xxxx-xxx.",
            },
        },
        employeeType: {
            type: String,
            enum: {
                values: ["Funcionário", "Gerente"],
                message: "Employee should be 'Funcionário' or 'Gerente'",
            },
            required: [true, "Employee type is required!"],
        },
        password: {
            type: String,
            minlength: 5,
            required: [true, "Password of employee is requerid!"],
        },
        employeeId: Number,
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
