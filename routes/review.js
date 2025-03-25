const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsnyc = require("../util/wrapAsync.js");

const {validateReview, isLoggedIn, isReviewOwner} = require("../middleware.js");

const ReviewController = require("../controllers/review.js");


// reviews
// post route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsnyc(ReviewController.addReview)
);

// delete route
router.delete(
  "/:reviewid",
  isLoggedIn,
  isReviewOwner,
  wrapAsnyc( ReviewController.deleteReview)
);

module.exports = router;
