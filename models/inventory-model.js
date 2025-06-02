const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}

/* ***************************
 *  Get item details by inv_id
 * ************************** */
async function getDetailsByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getDetailsByInventoryId error " + error)
    throw error
  }
}

/* ***************************
 *  Add Classifications to Classifications table
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
    INSERT INTO classification (classification_name)
    VALUES ($1) RETURNING *;
    `;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("Database insert error:", error);
    return null;
  }
}

/* ***************************
 *  Get All Classifications
 * ************************** */
async function getAllClassifications() {
  const sql = `SELECT * FROM classification ORDER BY classification_name`;
  const result = await pool.query(sql);
  return result.rows;
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getDetailsByInventoryId,
  addClassification,
  getAllClassifications,
}
