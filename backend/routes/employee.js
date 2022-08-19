var express = require("express");
var router = express.Router();
var employeeController = require("../controller/employeeController");

//GET Employees dashboard
router.get("/", employeeController.dashboardEmployees);

//GET form for add Employee
router.get("/add", employeeController.add);

//POST create a Employee
router.post("/addEmployee", employeeController.create);

//GET for show all information of a Employee
router.get("/show/:email", employeeController.show);

//GET form for edit Employee information
router.get("/edit/:email", employeeController.formEdit);

//POST edit a Employee information
router.post("/edit/:email", employeeController.edit);

//DELETE a employee after user confirmation
router.delete("/delete/:email", employeeController.delete);

//GET the cities of employees to reproduce graph on dashboard
router.get("/getCities", employeeController.getCitys);

//GET count of employees by gender to reproduce a graph on dashboard
router.get("/getEmployeesByGender", employeeController.getEmployeesByGender);

module.exports = router;
