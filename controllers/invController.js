const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build item detail view by inv_id
 * ************************** */
invCont.buildItemDetails = async function (req, res, next) {
  const inv_id = req.params.invId;
  const itemData = await invModel.getDetailsByInventoryId(inv_id);
  let nav = await utilities.getNav();

  if (itemData && itemData.length > 0) {
    const item = itemData[0];
    res.render("./inventory/item", {
      title: `${item.inv_make} ${item.inv_model}`,
      nav,
      item,
    });
  } else {
    res.render("./inventory/item", {
      title: "Item not found",
      nav,
      item: null,
    });
  }
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  try {
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      notice: req.flash("notice"),
    });
  } catch (error) {
    console.error("Error loading management view:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Build Add New Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  try {
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      notice: req.flash("notice"),
    });
  } catch (error) {
    console.error("Error loading add classification view:", error);
    res.status(500).send("Server Error");
  }
};

/* ***************************
 *  Add New Classification (POST handler)
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;

  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      const nav = await utilities.getNav();
      req.app.locals.nav = nav;
      req.flash("success", "Classification added successfully!");
      res.redirect("/inv/");
    } else {
      res.render("inventory/add-classification", {
        message: "Error: Could not add classification.",
        errors: [],
      });
    }
  } catch (err) {
    res.render("inventory/add-classification", {
      message: "Server error. Try again later.",
      errors: [],
    });
  }
};

/* ***************************
 *  Build Add New Inventory View
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList();
  try {
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect,
      notice: req.flash("notice"),
    });
  } catch (error) {
    console.error("Error loading add inventory view:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = invCont;
