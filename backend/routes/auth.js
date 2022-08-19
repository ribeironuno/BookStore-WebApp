var express = require('express');
var router = express.Router();
var authController = require('../controller/authController')

//GET index of admin
router.get('/', authController.verifyToken, authController.index)

//GET login form 
router.get('/login', authController.formLogin);

//GET login form with error warning
router.get('/login/error', authController.errorLogin);

//POST try to make login with the email and password
router.post('/login', authController.login);

//GET logout the user
router.get('/logout', authController.logout);

module.exports = router;