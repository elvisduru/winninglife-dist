"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const eventSchema = new _mongoose.default.Schema({
  title: String,
  dayFrom: String,
  dayTo: String,
  month: String,
  timeFrom: String,
  timeTo: String,
  image: String,
  status: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const Event = _mongoose.default.model('Event', eventSchema);

var _default = Event;
exports.default = _default;