"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const miniGallerySchema = new _mongoose.default.Schema({
  src: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const MiniGallery = _mongoose.default.model('MiniGallery', miniGallerySchema);

var _default = MiniGallery;
exports.default = _default;