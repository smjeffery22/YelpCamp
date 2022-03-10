const express = require('express');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const User = require('../models/user');
const users = require('../controllers/users');

const router = express.Router();

router.route('/register')
  .post(catchAsync(users.register))
  .get(users.renderRegisterForm);

router.route('/login')
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)
  .get(users.renderLoginForm);

router.get('/logout', users.logout);

module.exports = router;
