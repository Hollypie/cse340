const { body, validationResult } = require("express-validator");
const utilities = require("./index");

/* ***************************
 *  Validation rules for Add New Classification form
 *  - Ensures classification name is not empty
 *  - Disallows spaces and special characters (letters and numbers only)
 * ************************** */

const validateClassification = [
  body("classification_name")
    .trim()
    .isLength({ min: 1 }).withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/).withMessage("No spaces or special characters allowed."),
];

/* ***************************
 *  Check Validation for Add New Classification form
 * ************************** */
const checkValidation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // required for layout/navbar
    const { classification_name } = req.body; // grab the input value
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      message: null,
      classification_name, // so your view can repopulate the input
    });
  }
  next();
};

/* ***************************
 *  Validate Add Inventory Form Fields
 * ************************** */
const validateInventoryItem = [
  body("inv_make")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Make is required."),
  body("inv_model")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Model is required."),
  body("inv_year")
    .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
    .withMessage("Enter a valid year."),
  body("inv_description")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Description is required and must be less than 500 characters."),
  body("inv_price")
    .isFloat({ min: 0 })
    .withMessage("Enter a valid price."),
  body("inv_miles")
    .isInt({ min: 0 })
    .withMessage("Enter valid mileage."),
  body("inv_color")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Color is required."),
  body("classification_id")
    .isInt({ min: 1 })
    .withMessage("Choose a classification.")
];

/* ***************************
 *  Check inventory data before submitting to database
 * ************************** */

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // for the layout
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);

    // Destructure the form fields to repopulate in case of error
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    } = req.body;

    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      errors: errors.array(),
      classificationSelect,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
  next();
};

/* ***************************
 *  Check Update Data
 * ************************** */

// Check data and return errors to the edit inventory view
const checkUpdateData = async (req, res, next) => {
  console.log("🔍 Running checkUpdateData middleware");

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  console.log("📝 Validation check data:", req.body);
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    res.render("inventory/edit-inventory", {
      errors: errors.array(),
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
    return;
  }
  next();
};

module.exports = {
  validateClassification,
  validateInventoryItem,
  checkValidation,
  checkInventoryData,
  checkUpdateData
};