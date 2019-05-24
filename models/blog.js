"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const blogSchema = new _mongoose.default.Schema({
  title: String,
  status: String,
  subtitle: String,
  content: String,
  image: String,
  category: String,
  slug: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const Blog = _mongoose.default.model('Blog', blogSchema);

var _default = Blog;
exports.default = _default;