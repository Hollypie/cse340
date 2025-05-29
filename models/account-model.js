const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
}


/* *****************************
*   Check if Email Exists Already
* *************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Check if Email and Password Match an Existing Account
* *************************** */
async function checkValidCredentials(email, password) {
  try {
    const data = await pool.query(
      "SELECT * FROM account WHERE account_email = $1",
      [email]
    )
    const account = data.rows[0]

    if (!account) {
      return "No account found with that email."
    }

    if (account.account_password !== password) {
      return "Incorrect password."
    }

    return account
  } catch (error) {
    console.error("Login error:", error)
    return "An error occurred during login."
  }
}
  
module.exports = { registerAccount, checkExistingEmail, checkValidCredentials }