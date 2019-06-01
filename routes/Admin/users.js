"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _admins = require("../../controllers/admins");

var _connectEnsureLogin = require("connect-ensure-login");

const router = (0, _express.Router)();
router.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
router
  .route("/edit")
  .get((0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), (req, res) =>
    res.render("Admin/Users/edit", { message: req.flash("msg") })
  )
  .put(_admins.updateUser);
router.get("/loadUser", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.loadUser);
router.put("/status", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.setUserStatus);
router.put("/changepwd", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.changePassword);
router.get("/matrix", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), (req, res) => res.render("Admin/Users/matrix"));
router.get("/loadMatrix", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.userMatrix);
router.get("/members", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), (req, res) => res.render("Admin/Users/members"));
router.get("/loadMembers", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.loadMembers);
router.get("/analysis", (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), (req, res) => res.render("Admin/Users/analysis"));
var _default = router;
exports.default = _default;
