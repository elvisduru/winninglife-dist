"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const contactSchema = new _mongoose.default.Schema({
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

const Contact = _mongoose.default.model('Contact', contactSchema);

var _default = Contact;
exports.default = _default;