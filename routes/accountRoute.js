const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

// Route to account management view (default for /account)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));  

// Route to show login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to show registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to show Log out view
router.get("/logout", utilities.handleErrors(accountController.processLogout));

router.get("/update", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdateView));

// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Process the Update Account Data
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccountData)
)

// Process the Change Passwords Form
router.post(
  "/update-password",
  regValidate.changePasswordRules(),
  utilities.handleErrors(accountController.processChangePassword)
)

module.exports = router;
