"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _passportLocalMongoose = _interopRequireDefault(require("passport-local-mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const adminSchema = new _mongoose.default.Schema({
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
    required: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
adminSchema.plugin(_passportLocalMongoose.default);

const Admin = _mongoose.default.model('Admin', adminSchema);

var _default = Admin;
exports.default = _default;