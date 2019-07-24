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
app.use(_express.default.static(_path.default.join(__dirname, "/uploads")));
app.use((0, _connectFlash.default)());
app.use((0, _expressSession.default)(sessionOptions));
app.use(_passport.default.initialize());
app.use(_passport.default.session());

global.__basedir = __dirname;

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

app.get("/", async (req, res) => {
  const events = await _models.Event.find()
  const uploads = await _models.MiniGallery.find().sort({
    created: -1
  })
  const slides = await _models.Slider.find().sort({
    created: 1
  })
  res.render("index", { events, uploads, slides })
});
app.get("/contact", (req, res) => res.render("contact"));
app.get("/gallery", async (req, res) => {
  const uploads = await _models.Gallery.find().sort({
    created: -1
  })
  res.render("gallery", { uploads })
});

app.use("/auth", _auth.default);
app.use("/user", _User.default);
app.use("/admin", _Admin.default); // 404

app.use(function (req, res, next) {
  res.status(404).render("404");
});
app.listen(`${stage.port}`, () => {
  console.log(`WinningLife running on ${stage.port}`);
});
var _default = app;
exports.default = _default;
