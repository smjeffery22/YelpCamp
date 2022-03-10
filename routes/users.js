const express = require('express');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const User = require('../model/user');

const router = express.Router();

router.post('/register', catchAsync(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    
    req.flash('success', 'Welcome to Yelp Camp!');
    res.redirect('/campgrounds');
  } catch(e) {
    req.flash('error', e.message);
    res.redirect('/register')
  }
}));

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/campgrounds');
});

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have been logged out.');
  res.redirect('/campgrounds');
});

module.exports = router;
