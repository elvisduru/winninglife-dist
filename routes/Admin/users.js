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
  .get((req, res) => res.render("Admin/Users/edit"))
  .put(_admins.updateUser);
router.get("/loadUser", _admins.loadUser);
router.put("/status", _admins.setUserStatus);
router.get("/matrix", (req, res) => res.render("Admin/Users/matrix"));
router.get("/loadMatrix", _admins.userMatrix);
router.get("/members", (req, res) => res.render("Admin/Users/members"));
router.get("/loadMembers", _admins.loadMembers);
router.get("/analysis", (req, res) => res.render("Admin/Users/analysis"));
var _default = router;
exports.default = _default;
