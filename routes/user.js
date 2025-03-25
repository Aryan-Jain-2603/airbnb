const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../util/wrapAsync");
const passport = require("passport");
const UserController = require("../controllers/user.js");

const { saveRedirectURL } = require("../middleware.js");

router
  .route("/signup")
  .get((req, res) => {
    res.render("./users/signup.ejs");
  })
  .post(wrapAsync(UserController.signup));

router
  .route("/login")
  .get((req, res) => {
    res.render("./users/login.ejs");
  })
  .post(
    saveRedirectURL,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(UserController.login)
  );

router.get("/logout", UserController.logout);

module.exports = router;
