const User = require("../models/user");
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let createdUser = new User({ email, username });
    let result = await User.register(createdUser, password);
    req.login(result, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You have been logged In successfully");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back User, Login successful");
  if (!res.locals.redirectURL) {
    res.redirect("/listings");
    return;
  }
  res.redirect(res.locals.redirectURL);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out successfully");
    res.redirect("/listings");
  });
};
