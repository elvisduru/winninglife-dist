"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const refEarningSchema = new _mongoose.default.Schema({
  recipient: String,
  amount: {
    type: Number,
    default: 1000
  },
  from: { type: String, unique: true },
  created: {
    type: Date,
    default: Date.now
  }
});

const RefEarning = _mongoose.default.model('RefEarning', refEarningSchema);

var _default = RefEarning;
exports.default = _default;