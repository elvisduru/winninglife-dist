"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _admins = require("../../controllers/admins");

var _connectEnsureLogin = require("connect-ensure-login");

const router = (0, _express.Router)();
router.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

router.get('/new', (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), (req, res) => {
  res.render('Admin/Blogs/new', { messages: req.flash("msg") });
})


router.route('/:id')
  .get((0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.getBlog)
  .put((0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.updateBlog)
  .delete((0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.deleteBlog);

router.get('/:id/edit', (0, _connectEnsureLogin.ensureLoggedIn)("/admin/login"), _admins.editBlog)

var _default = router;
exports.default = _default;
