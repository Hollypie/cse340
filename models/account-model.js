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
  
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
 *   Update account
 * *************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE public.account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4
    `;
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ]);
    return result.rowCount === 1;
  } catch (error) {
    console.error("Error updating account:", error); // good for debugging
    return false;
  }
}



module.exports = { registerAccount, checkExistingEmail, checkValidCredentials, getAccountByEmail, updateAccount }