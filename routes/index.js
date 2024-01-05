var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const bodyParser = require("body-parser");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));
var uploadError = false;
let createdDate, presentDate, Difference_In_Time, Difference_In_Days;

var liked = false;
var likedIndex;

/* GET home page. */
router.get("/", function (req, res, next) {
  const error = req.flash("error");
  res.render("index", { title: "Express", nav: false });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts saved");
  console.log(user);
  res.render("profile", { user, nav: true });
});

router.get("/uploadFile", isLoggedIn, async function (req, res, next) {
  res.render("uploadFile", { nav: true });
});

router.get("/login", function (req, res) {
  const error = req.flash("error");
  res.render("login", { error: error, nav: false });
});

router.get("/feed", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user");
  res.render("feed", { user, posts, nav: true });
});

router.post(
  "/uploadProfile",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    if (!req.file) {
      return res.status(404);
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/show-posts", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  res.render("show_posts", { user, nav: true });
});

router.get("/saved-posts", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("saved");
  res.render("saved", { user, nav: true });
});

router.get("/show-posts/desc", isLoggedIn, async function (req, res, next) {
  const post = await postModel.findOne({ _id: req.query.id }).populate("user");
  const user = await userModel.findOne({ username: req.session.passport.user });

  liked = false;

  for (var i = 0; i < post.likes.length; i++) {
    if (post.likes[i].equals(user._id)) {
      //checking if the user already liked the post
      likedIndex = i;
      liked = true;
      break;
    }
  }

  createdDate = post.createdAt;

  presentDate = new Date();

  Difference_In_Time = presentDate.getTime() - createdDate.getTime();
  Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

  res.render("post_detail", {
    post,
    nav: true,
    liked,
    date: Difference_In_Days,
  });
});

router.post("/show-posts/desc", isLoggedIn, async function (req, res, next) {
  const post = await postModel.findOne({ _id: req.query.id }).populate("user");
  const user = await userModel.findOne({ username: req.session.passport.user });

  if (liked == false) {
    post.likes.push(user._id);
    liked = true;
  } else {
    post.likes.splice(likedIndex, 1);
    liked = false;
  }

  await post.save();

  res.render("post_detail", {
    post,
    date: Difference_In_Days,
    nav: true,
    liked,
    user,
  });
});

router.get("/show-posts/save", isLoggedIn, async function (req, res, next) {
  const post = await postModel.findOne({ _id: req.query.id }).populate("user");
  const user = await userModel.findOne({ username: req.session.passport.user });

  var saved = false;
  for (var i = 0; i < user.saved.length; i++) {
    if (user.saved[i].equals(req.query.id)) {
      //checking if the user already liked the post
      saved = true;
      break;
    }
  }
  if (saved === false) {
    user.saved.push(req.query.id);
    await user.save();
  } else {
    res.render("post_detail", {
      post,
      date: Difference_In_Days,
      nav: true,
      liked,
      user,
    });
  }
});

router.post(
  "/uploadFile",
  isLoggedIn,
  upload.single("file"),
  async function (req, res) {
    if (!req.file) {
      return res.status(404);
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      postData: req.file.filename,
      postCaption: req.body.filecaption,
      postDescription: req.body.postDesc,
      user: user._id,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/search", isLoggedIn, async function (req, res) {
  const searchQuery = req.body.search;
  var regex = new RegExp(searchQuery, "i");
  console.log(regex);
  const users = await userModel.find({ fullname: regex });
  console.log(users);
  console.log(searchQuery);
  res.render("search", { users: users, nav: true });
});

router.get("/profile/user", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.query.user })
    .populate("posts");
  res.render("profile", { user, nav: true });
});

router.post("/register", function (req, res, next) {
  const { username, fullname, email } = req.body;
  const userData = new userModel({ username, fullname, email });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
