"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _passportLocalMongoose = _interopRequireDefault(require("passport-local-mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const editorSchema = new _mongoose.default.Schema({
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
editorSchema.plugin(_passportLocalMongoose.default);

const Editor = _mongoose.default.model('Editor', editorSchema);

var _default = Editor;
exports.default = _default;