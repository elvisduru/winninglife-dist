"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _users = require("../../controllers/users");

var _connectEnsureLogin = require("connect-ensure-login");

var _wallet = _interopRequireDefault(require("./wallet"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const router = (0, _express.Router)();
router.use((0, _connectEnsureLogin.ensureLoggedIn)("/auth/login"));
router.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.path = req.path;
  res.locals.originPath = req.originalUrl;
  next();
});
router
  .route("/profile")
  .get((req, res) => res.render("Dashboard/profile"))
  .put(_users.updateProfile);
router.route("/dashboard").get(_users.graphUser);
router
  .route("/placement")
  .get((req, res) => res.render("Dashboard/placement"))
  .put(_users.placeUser);
router.get("/matrix", (req, res) => res.render("Dashboard/matrix"));
router.get("/loadMatrix", _users.userMatrix);
router.use("/wallet", _wallet.default);
var _default = router;
exports.default = _default;
