"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _models = require("./models");

// Recreate and Hash Users Password
function resetPwd() {
  _models.User.find({}, function (err, user) {
    if (err) console.log(err);
    user.setPassword(user.password, function () {
      user.changePassword(user.password, user.password, function () {
        user.update({
          $unset: {
            password: 1
          }
        }, function () {
          user.save(function (err, user) {
            if (err) console.log(err);
            console.log(`updated ${user.username} password`);
          });
        });
      });
    });
  });
}

var _default = resetPwd;
exports.default = _default;