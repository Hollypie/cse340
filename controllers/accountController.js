// controllers/accountController.js

const utilities = require("../utilities");
const accountModel = require("../models/account-model");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
}
  
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
}
  
 
/* ****************************************
*  Process Login
* *************************************** */
/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
  const { account_email, account_password } = req.body
  let nav = await utilities.getNav()

  const loginResult = await accountModel.checkValidCredentials(account_email, account_password)

  if (typeof loginResult === "object") {
    // Successful login
    req.flash("notice", `Welcome back ${loginResult.account_firstname}`)
    res.redirect("/") // Or to a dashboard page
  } else {
    // Failed login
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: {
        array: () => [{ msg: loginResult }]
      },
      account_email
    })
  }
}

  
module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }

