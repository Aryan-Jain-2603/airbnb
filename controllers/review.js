const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.addReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newreview = await Review.insertOne(req.body.review);
  newreview.author = req.user._id;
  listing.reviews.push(newreview);

  await newreview.save();
  await listing.save();
  req.flash("success", "Review successfully added");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewid } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findByIdAndDelete(reviewid);
  req.flash("success", "Review successfully Removed");
  res.redirect(`/listings/${id}`);
};
