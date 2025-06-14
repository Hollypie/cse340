const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

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
*  Process Logout
* *************************************** */
async function processLogout(req, res, next) {
  try {
    res.clearCookie("jwt")
    req.flash("success", "You have successfully logged out.");
    return res.redirect("/")
  } catch (err) {
    next(err)
  }
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
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
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
      errors: [{ msg: loginResult }],
      account_email
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      // Store login info in session
      req.session.loggedin = true
      req.session.account_id = accountData.account_id
      req.session.accountData = accountData

      //  Optional: Create JWT
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Process update Account Data
* *************************************** */
async function updateAccountData(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  const accountResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  const account = {
    account_id,
    account_firstname,
    account_lastname,
    account_email
  };

  if (accountResult) {

    req.session.accountData.account_firstname = account_firstname;
    req.session.accountData.account_lastname = account_lastname;
    req.session.accountData.account_email = account_email;

    req.flash("notice", "Congratulations, you’ve updated your account.");
    res.status(201).render("account/update", {
      title: "Update Account Data",
      nav,
      account,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the account update failed.");
    res.status(501).render("account/update", {
      title: "Update Account Data",
      nav,
      account,
      errors: null,
    });
  }
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const user = req.session.accountData; 

    res.render("account", {
      title: "Account Management",
      nav,
      user, // ← pass the user to the EJS view
      errors: null,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Deliver Account Update View
 * ************************************ */
async function buildAccountUpdateView(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = req.session.accountData.account_id;
    const account = await accountModel.getAccountById(account_id);
    const accountData = req.session.accountData;

    if (!accountData || !accountData.account_id) {
      console.error("No account_id found in session or locals.");
      req.flash("notice", "You must be logged in to update your account.");
      return res.redirect("/account/login");
    }

    res.render("account/update", {
      title: "Update Account Information",
      nav,
      account,
      errors: null,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    next(err);
  }
}
  
/* ****************************************
 *  Process Change Password
 * *************************************** */
async function processChangePassword(req, res) {
  const { account_id, account_password } = req.body;
  let nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Your password has been successfully updated.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Password update failed. Please try again.");
      return res.status(501).render("account/update", {
        title: "Update Account",
        nav,
      });
    }
  } catch (error) {
    console.error("Password update error:", error);
    req.flash("notice", "An error occurred. Please try again.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
    });
  }
}

/* ****************************************
 *  Export all controller functions
 * ************************************ */
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  loginAccount,
  accountLogin,
  processLogout,
  buildManagement,
  updateAccountData,
  buildAccountUpdateView,
  processChangePassword
};
