"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
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

var _Editor = _interopRequireDefault(require("./routes/Editor"));

var _connectFlash = _interopRequireDefault(require("connect-flash"));

var _models = require("./models");

var cors = require("cors");

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
    ttl: 1 * 24 * 60 * 60,
  }),
  resave: false,
  saveUninitialized: false,
};

app.use(cors());
app.set("view engine", "ejs");
app.use((0, _methodOverride.default)("_method"));
app.use(_bodyParser.default.json());
app.use(
  _bodyParser.default.urlencoded({
    extended: true,
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

app.locals.withdraw = "true";
app.locals.announce = "false";

// if (environment !== "production") {
//   app.use((0, _morgan.default)("dev"));
// }

if (environment == "production") {
  const prodSessOptions = {
    ...sessionOptions,
    cookie: {
      secure: true,
    },
  };
  app.set("trust proxy", 1);
  app.use(require("express-session")(prodSessOptions));
}

app.get("/", async (req, res) => {
  const events = await _models.Event.find();
  const uploads = await _models.MiniGallery.find().sort({
    created: -1,
  });
  const slides = await _models.Slider.find().sort({
    created: 1,
  });
  const announcement = await _models.Announcement.findOne();
  // const featuredPosts = await _models.FeaturedPost.find()
  const videoTestimonials = await _models.VideoTestimonial.find();
  res.render("index", {
    events,
    uploads,
    slides,
    announcement,
    videoTestimonials,
    showAnnouncement: req.app.locals.announce,
  });
});
app.get("/contact", (req, res) => res.render("contact"));
app.get("/gallery", async (req, res) => {
  const uploads = await _models.Gallery.find().sort({
    created: -1,
  });
  res.render("gallery", { uploads });
});

app.get("/incentives", (req, res) => res.render("incentives"));
app.get("/rally", (req, res) => res.render("rally"));
app.get("/terms", (req, res) => res.render("terms"));

app.get("/news", async (req, res) => {
  try {
    const blogs = await _models.Blog.find().sort({ created: -1 });
    res.render("news", { blogs });
  } catch (err) {
    console.log(err);
  }
});

app.get("/news/:id", async (req, res) => {
  try {
    const blog = await _models.Blog.findOne({ slug: req.params.id });
    res.render("post", { blog });
  } catch (err) {
    console.log(err);
  }
});

app.post("/hooks", async function (req, res) {
  try {
    // Retrieve the request's body
    var event = req.body;
    const { username, amount } = event.data.metadata;
    // Do something with event
    if (event.data.status === "success") {
      await _models.User.update(
        {
          username,
        },
        {
          $inc: {
            depositWallet: amount,
          },
        }
      );
    }
    res.sendStatus(200);
  } catch (err) {
    res.send(err);
  }
});

app.use("/auth", _auth.default);
app.use("/user", _User.default);
app.use("/admin", _Admin.default);
app.use("/editor", _Editor.default);

// 404

app.use(function (req, res, next) {
  res.status(404).render("404");
});
app.listen(`${stage.port}`, () => {
  console.log(`WinningLife running on ${stage.port}`);
});
var _default = app;
exports.default = _default;
