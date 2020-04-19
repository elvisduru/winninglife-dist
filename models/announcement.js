"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const announcementSchema = new _mongoose.default.Schema({
  src: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const Announcement = _mongoose.default.model('Announcement', announcementSchema);

var _default = Announcement;
exports.default = _default;