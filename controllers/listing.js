const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodeingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find();
  res.render("./listings/index.ejs", { alllistings });
};

module.exports.showIndetail = async (req, res) => {
  let { id } = req.params;
  let list = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!list) {
    req.flash("error", "Lsiting does not exists");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { list });
};

module.exports.addListing = async (req, res) => {
  try {
    let response = await geocodeingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    let url = req.file.path;
    let filename = req.file.filename;

    const validCategories = [
      "Trending",
      "Rooms",
      "Iconic Cities",
      "Mountains",
      "Castle",
      "Amazing Pools",
      "Camping",
      "Farms",
      "Arctic",
    ];

    // Ensure the category is valid before saving
    if (!validCategories.includes(req.body.listing.category)) {
      req.flash("error", "Invalid category selected.");
      return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash("success", "New listing created!");

    res.redirect("/listings");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/listings/new");
  }
};


module.exports.getListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Lsiting does not exists");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  try {
    // Geocode the location provided in the request
    let response = await geocodeingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    // Update geometry with the response from geocoding
    listing.geometry = response.body.features[0].geometry;

    // Update other fields from req.body.listing
    Object.assign(listing, req.body.listing);

    // If there's an image file, update the image field
    if (req.file) {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
    }

    // Save the listing after making all updates
    await listing.save();

    // Flash success message and redirect to the updated listing page
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send("Something went wrong while updating the listing");
  }
};


module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "listing successfully deleted");
  res.redirect("/listings");
};

module.exports.filterListings = async (req, res) => {
  const { category } = req.query;

  if (!category) {
    req.flash("error", "Please select a valid category.");
    return res.redirect("/listings");
  }

  try {
    // Filter listings by category
    const filteredListings = await Listing.find({ category: category });

    res.render("listings/index", { alllistings: filteredListings });
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
};


module.exports.searchListings = async (req, res) => {
  const { query } = req.query; // Get search input

  if (!query) {
      req.flash("error", "Please enter a search term.");
      return res.redirect("/listings");
  }

  const listings = await Listing.find({
      $or: [
          { title: { $regex: query, $options: "i" } }, // Case-insensitive title search
          { location: { $regex: query, $options: "i" } }, // Case-insensitive location search
          { country: { $regex: query, $options: "i" } }, // Case-insensitive country search
      ],
  });

  if (listings.length === 0) {
      req.flash("error", "No listings found for this search.");
      return res.redirect("/listings");
  }

  res.render("listings/index", { alllistings: listings });
};

