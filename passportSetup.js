"use strict";

var _passport = _interopRequireDefault(require("passport"));

var _passportLocal = require("passport-local");

var _models = require("./models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_passport.default.use("user", _models.User.createStrategy());

_passport.default.use("admin", _models.Admin.createStrategy());

_passport.default.use("editor", _models.Editor.createStrategy());

// passport.use(
//   "user",
//   new LocalStrategy(function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false, { message: "Incorrect username." });
//       }
//       if (password !== user.password) {
//         return done(null, false, { message: "Incorrect password." });
//       }
//       return done(null, user);
//     });
//   })
// );
// passport.use(
//   "admin",
//   new LocalStrategy(function(username, password, done) {
//     Admin.findOne({ username: username }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false, { message: "Incorrect username." });
//       }
//       if (password !== user.password) {
//         return done(null, false, { message: "Incorrect password." });
//       }
//       return done(null, user);
//     });
//   })
// );


_passport.default.serializeUser(function (user, done) {
  console.log("serializing user");
  done(null, user.id);
});

_passport.default.deserializeUser(function (id, done) {
  console.log("deserializing");

  _models.Admin.findById(id, function (err, user) {
    console.log("deserializing admin");
    if (err) done(err);

    if (user) {
      done(null, user);
    } else {

      _models.Editor.findById(id, function (err, user) {
        console.log("deserializing editor");
        if (err) done(err);

        if (user) {
          done(null, user);
        } else {
          _models.User.findById(id, function (err, user) {
            console.log("deserializing user");
            if (err) done(err);
            done(null, user);
          });
        }
      });
    }
  });
});


// _passport.default.deserializeUser(function (id, done) {
//   console.log("deserializing");

//   _models.Admin.findById(id, function (err, user) {
//     console.log("deserializing admin");
//     if (err) done(err);

//     if (user) {
//       done(null, user);
//     } else {
//       _models.User.findById(id, function (err, user) {
//         console.log("deserializing user");
//         if (err) done(err);
//         done(null, user);
//       });
//     }
//   });
// });