const pool = require("../database");

/* ***************************
 *  Get Reviews By Inventory Id
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT r.review_text, r.rating, a.account_firstname, a.account_lastname
      FROM public.review r
      JOIN public.account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("Error getting reviews by inventory ID:", error);
    throw error;
  }
}

/* ***************************
 *  Get Reviews By Account Id
 *  (for user's personal review list)
 *  Includes vehicle make/model if needed
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT r.review_text, r.rating, i.inv_make, i.inv_model, i.inv_id, i.inv_thumbnail
      FROM public.review r
      JOIN public.inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("Error getting reviews by account ID:", error);
    throw error;
  }
}

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(inv_id, account_id, review_text, rating) {
  try {
    const sql = `
      INSERT INTO public.review (inv_id, account_id, review_text, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(sql, [inv_id, account_id, review_text, rating]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
}

module.exports = {
  getReviewsByInventoryId,
  getReviewsByAccountId,
  addReview
};
