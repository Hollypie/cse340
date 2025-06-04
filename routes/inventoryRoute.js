const express = require("express")
const router = new express.Router() 
const invCont = require("../controllers/invController")
const { validateClassification, checkValidation } = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

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

router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON));

// Route for modifying a inventory item
router.get("/edit/:inv_id", utilities.handleErrors(invCont.editInventoryView));

// Route for submitting new classification (process form POST)
router.post("/add-classification", validateClassification, checkValidation, invCont.addClassification);

// Route for submitting a new inventory item (process form POST)
router.post("/add-inventory", invCont.addInventory);



module.exports = router;
