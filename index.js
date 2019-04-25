"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

// var _morgan = _interopRequireDefault(require("morgan"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _path = _interopRequireDefault(require("path"));

var _methodOverride = _interopRequireDefault(require("method-override"));

var _passport = _interopRequireDefault(require("passport"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _auth = _interopRequireDefault(require("./routes/auth"));

var _User = _interopRequireDefault(require("./routes/User"));

var _Admin = _interopRequireDefault(require("./routes/Admin"));

var _connectFlash = _interopRequireDefault(require("connect-flash"));

var _models = require("./models");

require("./passportSetup");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

require("dotenv").config();

const app = (0, _express.default)();
const environment = "development";

const stage = require("./config")[environment];

const MongoStore = require("connect-mongo")(_expressSession.default);

const sessionOptions = {
  secret: "winninglifewearewinningwehavewon",
  store: new MongoStore({
    url:
      "mongodb+srv://elvisduru:winninglife101@winninglifedb-eytgk.mongodb.net/winninglife?retryWrites=true",
    // "mongodb://elvisduru:winninglife101@ds123513.mlab.com:23513/winninglife",
    // "mongodb://localhost/winninglife",
    ttl: 1 * 24 * 60 * 60
  }),
  resave: false,
  saveUninitialized: false
};
app.set("view engine", "ejs");
app.use((0, _methodOverride.default)("_method"));
app.use(_bodyParser.default.json());
app.use(
  _bodyParser.default.urlencoded({
    extended: true
  })
);
app.use(_express.default.static(_path.default.join(__dirname, "/views")));
app.use(_express.default.static(_path.default.join(__dirname, "/public")));
app.use((0, _connectFlash.default)());
app.use((0, _expressSession.default)(sessionOptions));
app.use(_passport.default.initialize());
app.use(_passport.default.session());

// if (environment !== "production") {
//   app.use((0, _morgan.default)("dev"));
// }

if (environment == "production") {
  const prodSessOptions = {
    ...sessionOptions,
    cookie: {
      secure: true
    }
  };
  app.set("trust proxy", 1);
  app.use(require("express-session")(prodSessOptions));
}

app.get("/", (req, res) => res.render("index"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/gallery", (req, res) => res.render("gallery"));
let usersProcessed = 0;

// Recreate and Hash User Password
// _models.User.find({})
//   .then(function(users) {
//     console.log("Started password update task");
//     users.forEach(user => {
//       if (user.password) {
//         user.setPassword(user.password, function() {
//           console.log(`Started with ${user.username}`);
//           user.changePassword(user.password, user.password, function() {
//             console.log(`Changed ${user.username} password`);
//             user.update({ $unset: { password: 1 } }, function() {
//               user.save(function() {
//                 usersProcessed++;
//                 console.log(usersProcessed);
//               });
//             });
//           });
//         });
//       }
//     });
//   })
//   .catch(err => console.log(err));

// Update Children Field for each user
_models.User.find({})
  .then(users => {
    console.log("Started Children update task");
    users.forEach((user, index, arr) => {
      if (user.username) {
        console.log(`Creating child array for ${user.username}`);
        user.children = [];
        arr.forEach(arrUser => {
          if (arrUser.parent.toUpperCase() === user.username.toUpperCase()) {
            user.children.push(arrUser.username);
          }
        });
        user.save((err, savedUser) => {
          if (err) console.log(err);
          console.log(`added users to child array for ${savedUser.username}`);
          usersProcessed++;
          console.log(usersProcessed);
        });
      }
    });
  })
  .catch(err => console.log(err));

// Rank Update Task
// async function fetchLevel(num, username) {
//   let levelSum = await _models.User.aggregate()
//     .match({
//       username: username
//     })
//     .graphLookup({
//       from: "users",
//       startWith: "$username",
//       connectFromField: "username",
//       connectToField: "parent",
//       depthField: "depth",
//       as: "descendants"
//     })
//     .unwind("$descendants")
//     .match({
//       "descendants.depth": num
//     })
//     .group({
//       _id: null,
//       count: {
//         $sum: 1
//       }
//     });

//   return levelSum[0];
// }

// // // // Rank Update Task
// (async function() {
//   console.log("Started Rank Level Update Task");
//   const users = await _models.User.find({});

//   users.forEach(async user => {
//     let emptyLevel = false;
//     let levels = [];
//     let levelsProcessed = 0;
//     let lastCompleteLevel;

//     while (!emptyLevel) {
//       const level = await fetchLevel(levelsProcessed, user.username);
//       if (level === undefined) {
//         levelsProcessed = 0;
//         emptyLevel = true;
//       } else {
//         levels.push(level.count);
//         levelsProcessed++;
//       }
//     }

//     if (user.children < 4) {
//       user.nextlevel = 1;
//       user.rank = "None";
//     }

//     if (levels.length) {
//       lastCompleteLevel = levels[0];
//       for (let i = 1; i < levels.length; i++) {
//         if (levels[i] > lastCompleteLevel) {
//           lastCompleteLevel = levels[i];
//         }
//       }

//       if (lastCompleteLevel === 4) {
//         user.nextlevel = 2;
//         user.rank = "SilverLife";
//       }

//       if (lastCompleteLevel === 16) {
//         user.nextlevel = 3;
//         user.rank = "GoldLife 1";
//       }

//       if (lastCompleteLevel === 64) {
//         user.nextlevel = 4;
//         user.rank = "GoldLife 2";
//       }

//       if (lastCompleteLevel === 256) {
//         user.nextlevel = 5;
//         user.rank = "DiamondLife 1";
//       }

//       if (lastCompleteLevel === 1024) {
//         user.nextlevel = 6;
//         user.rank = "DiamondLife 2";
//       }

//       if (lastCompleteLevel === 4096) {
//         user.nextlevel = 7;
//         user.rank = "SapphireLife 1";
//       }

// if (levels[0] === 4 && levels[1] < 16) {
//   user.nextlevel = 2;
//   user.rank = "SilverLife";
// }

// if (levels[1] === 16 && levels[2] < 64) {
//   user.nextlevel = 3;
//   user.rank = "GoldLife 1";
// }

// if (levels[2] === 64 && levels[3] < 256) {
//   user.nextlevel = 4;
//   user.rank = "GoldLife 2";
// }

// if (levels[3] === 256 && levels[4] < 1024) {
//   user.nextlevel = 5;
//   user.rank = "DiamondLife 1";
// }

// if (levels[4] === 1024 && levels[5] < 4096) {
//   user.nextlevel = 6;
//   user.rank = "DiamondLife 2";
// }

// if (levels[5] === 4096 && levels[6] < 16384) {
//   user.nextlevel = 7;
//   user.rank = "SapphireLife 1";
// }
//       console.log(
//         `Processed user: ${user.username}, max: ${lastCompleteLevel}`
//       );
//     } else {
//       console.log(`Processed user: ${user.username}, None`);
//     }

//     await user.save();
//   });
//   console.log("Rank Level Update Task Completed");
// })();

app.use("/auth", _auth.default);
app.use("/user", _User.default);
app.use("/admin", _Admin.default); // 404

app.use(function(req, res, next) {
  res.status(404).render("404");
});
app.listen(`${stage.port}`, () => {
  console.log(`WinningLife running on ${stage.port}`);
});
var _default = app;
exports.default = _default;
