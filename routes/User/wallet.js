"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _users = require("../../controllers/users");

var _connectEnsureLogin = require("connect-ensure-login");

const router = (0, _express.Router)();
router.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
router.route('/deposits').get(_users.getDeposits).post(_users.deposit);
router.route('/deposits/:id').delete(_users.cancelDeposit);
router.get('/earnings', _users.getEarnings);
router.route('/transfer').get(_users.getTransfers).put(_users.transferFund);
router.get('/withdrawal', _users.getWithdrawals);
router.post('/withdrawal/ref', _users.withdrawRefBonus);
router.post('/withdrawal/rank', _users.withdrawRankEarning);
router.post('/paystack', _users.handlePaystack)
var _default = router;
exports.default = _default;