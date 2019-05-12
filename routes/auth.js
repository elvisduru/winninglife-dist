"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var userController = _interopRequireWildcard(require("../controllers/users"));

var _passport = _interopRequireDefault(require("passport"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc =
            Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {};
          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

const router = (0, _express.Router)();
router
  .route("/register")
  .get((req, res) => {
    const chars = [..."ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"];
    const userID = [...Array(6)].map(
      i => chars[(Math.random() * chars.length) | 0]
    ).join``;
    res.render("signup", {
      userID
    });
  })
  .post(userController.register);
router
  .route("/login")
  .get((req, res) => res.render("signin", { message: req.flash("error") }))
  .post(
    _passport.default.authenticate("user", {
      successReturnToOrRedirect: "/user/dashboard",
      failureRedirect: "/auth/login",
      failureFlash: "Invalid username or password."
    })
  );
router.route("/logout").get(userController.logout);
var _default = router;
exports.default = _default;
