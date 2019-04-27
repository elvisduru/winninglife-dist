"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const withdrawSchema = new _mongoose.default.Schema({
  withdrawer: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: "User"
  },
  type: String,
  approved: {
    type: Boolean,
    default: false
  },
  declined: {
    type: Boolean,
    default: false
  },
  amount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Withdraw = _mongoose.default.model("Withdraw", withdrawSchema);

var _default = Withdraw;
exports.default = _default;
