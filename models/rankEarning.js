"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rankEarningSchema = new _mongoose.default.Schema({
  recipient: String,
  amount: Number,
  rank: String,
  created: {
    type: Date,
    default: Date.now
  }
});

const RankEarning = _mongoose.default.model('RankEarning', rankEarningSchema);

var _default = RankEarning;
exports.default = _default;