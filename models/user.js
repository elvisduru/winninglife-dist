"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _passportLocalMongoose = _interopRequireDefault(
  require("passport-local-mongoose")
);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const userSchema = new _mongoose.default.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String
  },
  email: {
    type: String,
    trim: true
  },
  fullname: {
    type: String,
    trim: true
  },
  phone: String,
  gender: String,
  parent: String,
  referrer: String,
  children: [String],
  downlines: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: "None"
  },
  level: {
    position: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    }
  },
  nextlevel: {
    type: Number,
    default: 1
  },
  earnings: {
    cash: {
      type: Number,
      default: 0
    },
    food: {
      type: Number,
      default: 0
    },
    car: {
      type: Number,
      default: 0
    },
    suv: {
      type: Number,
      default: 0
    },
    scholarship: {
      type: Number,
      default: 0
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  bankName: String,
  accountNumber: String,
  accountName: String,
  nok_firstname: String,
  nok_lastname: String,
  nok_phone: String,
  nok_email: String,
  nok_relationship: String,
  depositWallet: {
    type: Number,
    default: 0
  },
  referralBonus: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
userSchema.plugin(_passportLocalMongoose.default);

const User = _mongoose.default.model("User", userSchema);

var _default = User;
exports.default = _default;
