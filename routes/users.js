const express = require('express');
const router = express.Router();
const User = require('../model/user');

router.post('/register', async(req, res) => {
  res.send(req.body);
})

router.get('/register', (req, res) => {
  res.render('users/register');
})

module.exports = router;