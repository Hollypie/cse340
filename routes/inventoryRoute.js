const express = require("express")
const router = new express.Router() 
const invCont = require("../controllers/invController")
const { checkInventoryData, checkUpdateData, validateClassification, checkValidation, validateInventoryItem } = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

// Route for /inv/ base url
router.get("/", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildManagement));  

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId));

// Route for item details
router.get("/detail/:invId", utilities.handleErrors(invCont.buildItemDetails));

// Route for Management view
router.get("/management", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildManagement));

// Route for Add Classification View (display form)
router.get("/add-classification", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildAddClassification));

// Route for Add Inventory View
router.get("/add-inventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildAddInventory));

router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON));

// Route for modifying an inventory item
router.get("/edit/:inv_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.editInventoryView));

// Route to display the delete confirmation view
router.get("/delete/:inv_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildDeleteInventoryConfirmationView));

// Route for submitting new classification (process form POST)
router.post("/add-classification", validateClassification, checkValidation, utilities.handleErrors(invCont.addClassification));

// Route for submitting a new inventory item (process form POST)
router.post("/add-inventory", validateInventoryItem, checkInventoryData, utilities.handleErrors(invCont.addInventory));

// Route for handling incoming request to update the Inventory Item details
router.post("/update/", validateInventoryItem, checkUpdateData, utilities.handleErrors(invCont.updateInventory));

// Route to process the deletion of an inventory item
router.post("/delete", utilities.handleErrors(invCont.deleteInventoryItem));

module.exports = router;
