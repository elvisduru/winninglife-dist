"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const gallerySchema = new _mongoose.default.Schema({
  src: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const Gallery = _mongoose.default.model('Gallery', gallerySchema);

var _default = Gallery;
exports.default = _default;