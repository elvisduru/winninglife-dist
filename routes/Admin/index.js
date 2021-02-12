"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _express = require("express");

var _passport = _interopRequireDefault(require("passport"));

var _admins = require("../../controllers/admins");

var _connectEnsureLogin = require("connect-ensure-login");

var _users = _interopRequireDefault(require("./users"));

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
  .get((req, res) => res.render("Admin/signup"))
  .post(_admins.register);
router
  .route("/login")
  .get((req, res) =>
    res.render("Admin/signin", { message: req.flash("error") })
  )
  .post(
    _passport.default.authenticate("admin", {
      successReturnToOrRedirect: "/admin/dashboard",
      failureRedirect: "/admin/login",
      failureFlash: "Invalid username or password.",
    })
  );
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/admin/login");
});
router
  .route("/dashboard")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.loadDashboard
  );
router
  .route("/deposits")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.loadDeposits
  );
router
  .route("/deposits/:id")
  .put(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.approveDeposit
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.declineDeposit
  );
router
  .route("/undodeposit/:id")
  .put(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.undoApproveDeposit
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.undoDeclineDeposit
  );
router
  .route("/withdrawals")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.loadWithdrawals
  );
router
  .route("/withdrawals/batch")
  .post(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.batchApproveWithdrawals
  );
router
  .route("/withdrawals/:id")
  .put(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.approveWithdrawal
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.declineWithdrawal
  );
router
  .route("/undowithdrawal/:id")
  .put(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.undoApproveWithdrawal
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.undoDeclineWithdrawal
  );

router
  .route("/gallery")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.getGallery
  )
  .post(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.postGallery
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.deleteGallery
  );

router
  .route("/landing")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.getLanding
  );

router
  .route("/minigallery")
  .post(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.postMiniGallery
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.deleteMiniGallery
  );

router
  .route("/sliders")
  .post(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.postSlider
  );

router
  .route("/sliders/:id")
  .put(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.editSlider
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.deleteSlider
  );

router
  .route("/blogs")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.getBlogs
  )
  .post(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.postBlog
  );

router
  .route("/events")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.getEvents
  )
  .post(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.postEvent
  );

router.put(
  "/announcement",
  (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
  _admins.changeAnnouncement
);

router.put(
  "/featuredPost/:id",
  (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
  _admins.editFeaturedPost
);

router
  .route("/videoTestimonials")
  .post(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.postVideoTestimonial
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.deleteVideoTestimonial
  );

router
  .route("/contact")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.getContact
  )
  .delete(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.deleteContact
  );

router
  .route("/contacts")
  .get(
    (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"),
    _admins.fetchContacts
  );

router.use("/users", _users.default);
router.use("/blogs", _blogs.default);
router.use("/events", _events.default);
var _default = router;
exports.default = _default;
