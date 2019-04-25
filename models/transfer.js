"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const transferSchema = new _mongoose.default.Schema({
  from: String,
  amount: Number,
  to: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const Transfer = _mongoose.default.model('Transfer', transferSchema);

var _default = Transfer;
exports.default = _default;