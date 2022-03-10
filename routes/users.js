const express = require('express');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const User = require('../models/user');
const users = require('../controllers/users');

const router = express.Router();

router.post('/register', catchAsync(users.register));

router.get('/register', users.renderRegisterForm);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/login', users.renderLoginForm);

router.get('/logout', users.logout);

module.exports = router;
