const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const reviewController = require("../controllers/reviewController");
const checkLogin = utilities.checkLogin;

router.get("/", checkLogin, utilities.handleErrors(reviewController.buildMyReviewsView));

// Show form to add a review (GET)
router.get("/add/:inv_id", checkLogin, utilities.handleErrors(reviewController.buildAddReviewForm));

// Process form submission to add review (POST)
router.post("/add", checkLogin, utilities.handleErrors(reviewController.processAddReview));



module.exports = router;
