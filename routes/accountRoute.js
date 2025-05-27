// routes/accountRoute.js

const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

// Route to show login view
router.get("/", utilities.handleErrors(accountController.buildLogin));

module.exports = router;