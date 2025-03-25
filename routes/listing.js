const express = require("express");
const router = express.Router();
const wrapAsnyc = require("../util/wrapAsync.js");
const { isLoggedIn, isOwner, validateLsiting } = require("../middleware.js");
const ListingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsnyc(ListingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateLsiting,
    wrapAsnyc(ListingController.addListing)
  );

router.get("/new", isLoggedIn, (req, res) => {
  res.render("./listings/new.ejs");
});

router
  .route("/:id")
  .get(wrapAsnyc(ListingController.showIndetail))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    wrapAsnyc(ListingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsnyc(ListingController.deleteListing));

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsnyc(ListingController.getListing)
);

module.exports = router;
