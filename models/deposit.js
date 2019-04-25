"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const depositSchema = new _mongoose.default.Schema({
  depositor: {
    type: _mongoose.default.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  approved: {
    type: Boolean,
    default: false
  },
  declined: {
    type: Boolean,
    default: false
  },
  bank: String,
  amount: Number,
  paymentMode: String,
  teller: {
    type: String,
    trim: true
  },
  remark: String,
  date: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Deposit = _mongoose.default.model('Deposit', depositSchema);

var _default = Deposit;
exports.default = _default;