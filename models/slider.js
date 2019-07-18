"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sliderSchema = new _mongoose.default.Schema({
  image: String,
  title: String,
  leading: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const Slider = _mongoose.default.model('Slider', sliderSchema);

var _default = Slider;
exports.default = _default;