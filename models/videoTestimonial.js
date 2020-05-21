"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const videoTestimonialSchema = new _mongoose.default.Schema({
  videoID: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const VideoTestimonial = _mongoose.default.model('VideoTestimonial', videoTestimonialSchema);

var _default = VideoTestimonial;
exports.default = _default;