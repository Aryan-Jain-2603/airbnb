require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./util/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const secret = process.env.SECRET;

const dbUrl = process.env.ATLASDB_URL;

const store  = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: secret,
  },
  touchAfter: 24 * 60 * 60,
})

store.on("error", function(e) {
  console.log("session store error", e);
});

const sessionOptions = {
  store: store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 3 * 24 * 60 * 60 * 1000,
    maxAge : 3 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then((res) => {
    console.log("connection established");
  })
  .catch((err) => console.log(err));

async function main() {
  const atlasurl = process.env.ATLASDB_URL;
  await mongoose.connect(atlasurl);
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

app.get("/", (req, res) => {
  res.redirect("/listings");
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",usersRouter);


// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({
//     email: "aryan@gmail.com",
//     username: "Aryan123",
//   })

//   let registeredUser = await User.register(fakeUser, "aryan@2603");
//   res.send(registeredUser);
// })  

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
  let { statuscode = 500, message = "unknown err occoured" } = err;
  res.status(statuscode).render("listings/err.ejs", { message });
  // res.status(statuscode).send(message);
});

app.listen(3000, () => {
  console.log("server is running");
});
