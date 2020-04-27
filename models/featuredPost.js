"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const featuredPostSchema = new _mongoose.default.Schema({
  title: String,
  image: String,
  url: {
    type: String,
    default: "#"
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const FeaturedPost = _mongoose.default.model('FeaturedPost', featuredPostSchema);

var _default = FeaturedPost;
exports.default = _default;