const express = require("express")
const router = new express.Router() 
const invCont = require("../controllers/invController")
const { validateClassification, checkValidation } = require("../utilities/inventory-validation");


// Route for /inv/ base url
router.get("/", invCont.buildManagement);

// Route to build inventory by classification view
router.get("/type/:classificationId", invCont.buildByClassificationId);

// Route for item details
router.get("/detail/:invId", invCont.buildItemDetails);

// Route for Management view
router.get("/management", invCont.buildManagement);

// Route for Add Classification View (display form)
router.get("/add-classification", invCont.buildAddClassification);

// Route for Add Inventory View
router.get("/add-inventory", invCont.buildAddInventory);

// ✅ Route for submitting new classification (process form POST)
router.post("/add-classification", validateClassification, checkValidation, invCont.addClassification);


module.exports = router;
