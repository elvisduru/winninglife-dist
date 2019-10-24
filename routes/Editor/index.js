"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _admins = require("../../controllers/admins");

var _connectEnsureLogin = require("connect-ensure-login");

var _blogs = _interopRequireDefault(require("./blogs"));

var _events = _interopRequireDefault(require("./events"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const router = (0, _express.Router)();
router.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.path = req.path;
  res.locals.originPath = req.originalUrl;
  next();
});
router
  .route("/register")
  .get((req, res) => res.render("Editor/signup"))
  .post(_admins.registerEditor);
router
  .route("/login")
  .get((req, res) =>
    res.render("Editor/signin", { message: req.flash("error") })
  )
  .post(
    _passport.default.authenticate("editor", {
      successReturnToOrRedirect: "/editor/blogs",
      failureRedirect: "/editor/login",
      failureFlash: "Invalid username or password."
    })
  );
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/editor/login");
});
router
  .route("/dashboard")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"),
    _admins.loadEditorDashboard
  );

router
  .route("/gallery")
  .get((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.getGallery)
  .post((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.postGallery)
  .delete((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.deleteGallery);

router.route('/landing')
  .get((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.getLanding);

router
  .route("/minigallery")
  .post((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.postMiniGallery)
  .delete((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.deleteMiniGallery);

router
  .route("/sliders")
  .post((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.postSlider);

router.route('/sliders/:id')
  .put((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.editSlider)
  .delete((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.deleteSlider);

router.route('/blogs')
  .get((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.getBlogs)
  .post((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.postBlog);

router.route('/events')
  .get((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.getEvents)
  .post((0, _connectEnsureLogin.ensureLoggedIn)("/editor/login"), _admins.postEvent);

router.use("/blogs", _blogs.default);
router.use("/events", _events.default);
var _default = router;
exports.default = _default;
