"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "User", {
  enumerable: true,
  get: function () {
    return _user.default;
  }
});
Object.defineProperty(exports, "Deposit", {
  enumerable: true,
  get: function () {
    return _deposit.default;
  }
});
Object.defineProperty(exports, "RankEarning", {
  enumerable: true,
  get: function () {
    return _rankEarning.default;
  }
});
Object.defineProperty(exports, "RefEarning", {
  enumerable: true,
  get: function () {
    return _refEarnings.default;
  }
});
Object.defineProperty(exports, "Withdraw", {
  enumerable: true,
  get: function () {
    return _withdraw.default;
  }
});
Object.defineProperty(exports, "Transfer", {
  enumerable: true,
  get: function () {
    return _transfer.default;
  }
});
Object.defineProperty(exports, "Admin", {
  enumerable: true,
  get: function () {
    return _admin.default;
  }
});
Object.defineProperty(exports, "Blog", {
  enumerable: true,
  get: function () {
    return _blog.default;
  }
});
Object.defineProperty(exports, "Event", {
  enumerable: true,
  get: function () {
    return _event.default;
  }
});

var _mongoose = _interopRequireDefault(require("mongoose"));

var _user = _interopRequireDefault(require("./user"));

var _deposit = _interopRequireDefault(require("./deposit"));

var _rankEarning = _interopRequireDefault(require("./rankEarning"));

var _refEarnings = _interopRequireDefault(require("./refEarnings"));

var _withdraw = _interopRequireDefault(require("./withdraw"));

var _transfer = _interopRequireDefault(require("./transfer"));

var _admin = _interopRequireDefault(require("./admin"));

var _blog = _interopRequireDefault(require("./blog"));

var _event = _interopRequireDefault(require("./event"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const connUri =
  "mongodb+srv://elvisduru:winninglife101@winninglifedb-eytgk.mongodb.net/winninglife?retryWrites=true";
  // "mongodb://localhost/winninglife";
  // "mongodb://elvisduru:winninglife101@ds123513.mlab.com:23513/winninglife";

_mongoose.default.connect(
  connUri,
  {
    useNewUrlParser: true
  },
  err => console.log(err)
);

_mongoose.default.Promise = Promise;
