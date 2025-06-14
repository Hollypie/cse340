const utilities = require("../utilities");
const reviewModel = require("../models/review-model");

/* ****************************************
 *  Build account User's reviews view
 * ************************************ */
async function buildMyReviewsView(req, res, next) {
    const nav = await utilities.getNav();
    const account_id = req.session.account_id;
    const reviews = await reviewModel.getReviewsByAccountId(account_id); // Should JOIN with inventory to get make/model
  
    reviews.forEach(review => {
        review.stars = utilities.displayStars(Number(review.rating));
    });
  
    res.render("reviews", {
      title: "My Reviews",
      nav,
      reviews,
    });
  }

/* ****************************************
 *  Build Add Review Form
 * ************************************ */
async function buildAddReviewForm(req, res, next) {
    try {
      const nav = await utilities.getNav();
      const inv_id = req.params.inv_id;
  
      res.render("reviews/add", {
        title: "Add Review",
        nav,
        inv_id,
        review_text: "", 
        rating: "",      
        errors: null
      });
    } catch (error) {
      console.error("Error building Add Review form:", error);
      next(error);
    }
  }


/* ****************************************
 *  Process Add Review
 * ************************************ */
async function processAddReview(req, res, next) {
    console.log("Form submitted!", req.body);
    try {
      const nav = await utilities.getNav();
      const { inv_id, reviewText, rating } = req.body;
      const account_id = req.session.account_id;
  
      const errors = [];
      if (!reviewText || reviewText.trim() === "") {
        errors.push({ msg: "Review text is required." });
      }
      if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        errors.push({ msg: "Rating must be a number between 1 and 5." });
      }
  
      if (errors.length > 0) {
        return res.status(400).render("reviews/add", {
          title: "Add Review",
          nav,
          inv_id,
          review_text: reviewText,
          rating,
          errors,
        });
      }
  
      // Insert the review into the database
      const result = await reviewModel.addReview(inv_id, account_id, reviewText, rating);
      
        
      if (result) {
        req.flash("notice", "Review submitted successfully!");
        return res.redirect(`/inv/detail/${inv_id}`);
      } else {
        req.flash("notice", "Something went wrong. Please try again.");
        return res.status(500).render("reviews/add", {
          title: "Add Review",
          nav,
          inv_id,
          review_text: reviewText,
          rating,
          errors: [{ msg: "Database insert failed." }],
        });
      }
    } catch (error) {
      console.error("Error processing review submission:", error);
      next(error);
    }
  }
  

/* ****************************************
 *  Export all controller functions
 * ************************************ */
module.exports = {
    buildMyReviewsView,
    buildAddReviewForm,
    processAddReview,
  };