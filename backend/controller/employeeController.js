var mongoose = require("mongoose");
var Employee = require("../models/employeeModal");
var Counter = require("../models/counterModal");
var bcrypt = require("bcrypt");

var employeeController = {};

//return the employees counted by gender
employeeController.getEmployeesByGender = async (req, res) => {
    const aggregate = Employee.aggregate()
        .group({
            _id: "$gender",
            count: { $sum: 1 },
        })
        .project({ _id: 0, gender: "$_id", count: 1 });

    aggregate.exec((err, result) => {
        if (err) {
            res.status(400).json(response);
        } else {
            let response = {};
            result.forEach((gender) => {
                response[gender.gender] = gender.count;
            });
            res.status(200).json(response);
        }
    });
};

//get employees count by their country
employeeController.getCitys = async (req, res, next) => {
    const aggregate = Employee.aggregate()
        .group({
            _id: "$city",
            count: { $sum: 1 },
        })
        .project({ _id: 0, city: "$_id", count: 1 });
    aggregate.exec((err, result) => {
        if (err) {
            res.status(400).json(response);
        } else {
            let response = {};
            result.forEach((city) => {
                response[city.city] = city.count;
            });
            res.status(200).json(response);
        }
    });
};

//Show all the Employees from the database
employeeController.dashboardEmployees = (req, res, next) => {
    let perPage = req.query.perPage || 10; //10 per default
    let page = req.query.page || 1; //page 1 in default

    let searchType = req.query.searchType || "default";
    let searchValue = req.query.searchValue || null;

    //object for search
    let searchCustomization;

    //checks the search type
    try {
        switch (searchType) {
            case "id":
                searchCustomization = { employeeId: Number(searchValue) };
                break;

            case "employeeName":
                searchCustomization = {
                    name: {
                        $regex: `.*${searchValue}.*`,
                        $options: "i",
                    }, //option i: search for upper or lower case
                };
                break;

            case "employeeCellPhone":
                searchCustomization = {
                    cellPhone: Number(searchValue),
                };
                break;

            default:
                searchCustomization = {};
                break;
        }
    } catch {
        //If some error in casting occurred
        searchCustomization = {};
        searchType = "default";
        searchValue = null;
    }
    Employee.find(searchCustomization).exec((err, dbEmployee) => {
        if (err) {
            next(err);
        } else {
            let counter = dbEmployee.length;
            let totalPages = Math.ceil(counter / perPage);
            //if the page to search exceeds the max, the max is associated
            if (page > totalPages) {
                page = totalPages;
            }
            Employee.find(searchCustomization).exec((err, dbEmployee) => {
                if (err) {
                    next(err);
                } else {
                    Employee.find(searchCustomization)
                        .skip(perPage * page - perPage) //skips the first N elements
                        .limit(perPage) //limits the number of results
                        .exec(async (err, dbEmployee) => {
                            if (err) {
                                res.redirect("/admin/employee?badSearch=true");
                                console.log(
                                    "Error searching for employees in dashboard"
                                );
                                next();
                            } else {
                                res.render("template", {
                                    loadContent: {
                                        page: "employee/employeeDashboard.ejs",
                                        employees: dbEmployee,
                                        pagination: {
                                            totalPages: totalPages,
                                            current: Number(page),
                                            perPage: perPage,
                                        },
                                        search: {
                                            type: searchType,
                                            value: searchValue,
                                        },
                                    },
                                });
                            }
                        });
                }
            });
        }
    });
};

function getCounter() {
    return new Promise((resolve, reject) => {
        Counter.findOne({ "_id.coll": "employees" }).exec((err, dbCounter) => {
            if (err) {
                reject(0);
            } else {
                resolve(dbCounter.seq_value + 1);
            }
        });
    });
}

//Show employee add form
employeeController.add = (req, res, next) => {
    Counter.findOne({ "_id.coll": "employees" }).exec((err, dbCounter) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "employee/add.ejs",
                    counter: dbCounter.seq_value + 1,
                },
            });
        }
    });
};

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

//Save a Employee on database
employeeController.create = async (req, res) => {
    req.body.password = await hashPassword(req.body.password);
    let counter = await getCounter();

    let employee = new Employee({
        name: req.body.name,
        gender: req.body.gender,
        dob: req.body.dob,
        cellPhone: req.body.cellPhone,
        email: req.body.email,
        address: req.body.address,
        city: req.body.city,
        zip: req.body.zip,
        employeeType: req.body.employeeType,
        password: req.body.password,
    });

    employee.save((err) => {
        if (err) {
            console.log(err);
            res.render("template", {
                loadContent: {
                    page: "employee/add.ejs",
                    counter: counter,
                    error: true,
                },
            });
        } else {
            res.redirect("/admin/employee");
        }
    });
};

//Show all the information of a Employee
employeeController.show = (req, res, next) => {
    Employee.findOne({ email: req.params.email }).exec((err, dbEmployee) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "employee/view",
                    employee: dbEmployee,
                },
            });
        }
    });
};

//Displays the form for edit a Employee information
employeeController.formEdit = (req, res, next) => {
    Employee.findOne({ email: req.params.email }).exec((err, dbEmployee) => {
        if (err) {
            return next(err);
        } else {
            res.render("template", {
                loadContent: {
                    page: "employee/edit",
                    employee: dbEmployee,
                },
            });
        }
    });
};

function getPassword(email) {
    return new Promise((resolve, reject) => {
        Employee.findOne({ email: email }).exec((err, dbEmployee) => {
            if (err) {
                reject();
            } else {
                resolve(dbEmployee.password);
            }
        });
    });
}

//Edit a Employee information
employeeController.edit = async (req, res, next) => {
    //Get hashed password before edit
    let previousPassword = await getPassword(req.params.email);

    //If the password was changed then the new password should be hashed
    if (previousPassword != req.body.password) {
        req.body.password = await hashPassword(req.body.password);
    }

    Employee.findOneAndUpdate(
        { email: req.params.email },
        {
            $set: {
                name: req.body.name,
                gender: req.body.gender,
                dob: req.body.dob,
                cellPhone: req.body.cellPhone,
                email: req.body.email,
                address: req.body.address,
                city: req.body.city,
                zip: req.body.zip,
                employeeType: req.body.employeeType,
                password: req.body.password,
            },
        },
        { runValidators: true },
        (err, editedEmployee) => {
            if (err) {
                Employee.findOne({ email: req.params.email }).exec(
                    (err, dbEmployee) => {
                        if (err) {
                            return next(err);
                        } else {
                            res.render("template", {
                                loadContent: {
                                    page: "employee/edit",
                                    employee: dbEmployee,
                                    error: true,
                                },
                            });
                        }
                    }
                );
            } else {
                res.redirect("/admin/employee/show/" + req.params.email);
            }
        }
    );
};

//checks if a client have at least one sale associated
checkIfEmployeeIsManager = (idEmployee) => {
    return new Promise((resolve, reject) => {
        Employee.findOne({ _id: idEmployee }).exec((err, employee) => {
            if (err) {
                reject(err);
            } else {
                if (employee.employeeType == "Gerente") {
                    resolve(true);
                }
                resolve(false);
            }
        });
    });
};

//check if a employee is a manager
employeeIsManager = (emailEmployee) => {
    return new Promise((resolve, reject) => {
        Employee.findOne({ email: emailEmployee }).exec((err, employee) => {
            if (err) {
                reject(err);
            } else {
                employee.employeeType == "Gerente"
                    ? resolve(true)
                    : resolve(true);
            }
        });
    });
};

//chek if there is only one manager on the database
isTheLastManager = () => {
    return new Promise((resolve, reject) => {
        Employee.find({ employeeType: "Gerente" }).exec((err, employees) => {
            if (err) {
                reject(err);
            } else {
                employees.length == 1 ? resolve(true) : resolve(false);
            }
        });
    });
};

//delete a employee
employeeController.delete = async (req, res) => {
    //Check if a employee is manager and the last manager
    if (
        (await employeeIsManager(req.params.email)) &&
        (await isTheLastManager())
    ) {
        res.status(400).json({
            error: "employeeIsTheLastManagerCannotBeDeleted",
        });
    } else {
        Employee.deleteOne({ email: req.params.email }).exec((err, result) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json(result.deletedCount);
            }
        });
    }
};

module.exports = employeeController;
