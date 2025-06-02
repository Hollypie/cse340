const { body, validationResult } = require("express-validator");

const validateClassification = [
  body("classification_name")
    .trim()
    .isLength({ min: 1 }).withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/).withMessage("No spaces or special characters allowed."),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      errors: errors.array(),
      message: null,
    });
  }
  next();
};

module.exports = {
  validateClassification,
  checkValidation,
};